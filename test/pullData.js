var debug = require('debug')('pullData');
var mysql = require('mysql');
var util = require('util');
const uuidV4 = require('uuid/v4');
var run = require('sync_back').run;
var readline = require('readline');
var request = require('request');

var db_conf = {
    host: '127.0.0.1',
    user: 'root',
    password: '1q2w3e4r5t6y&*(',
    database: 'testdb'
};

var max = 100000;
//var max = 100;
var subPage = 10000;
//var subPage = 10;
var getDataConMax = max / subPage;
var success = 0;
var failure = 0;
var wait = 0;

function post(url, data, back) {
    request.post({
        url: url,
        form: data
    }, function (err, httpResponse, body) {
        back(err, body);
    })
}

run(function* (api) {
    api.conn = mysql.createConnection(db_conf);

    var conn = api.conn;

    yield conn.connect(api.next);
    if (api.err)
        yield api.return(api.err, '连接数据库失败');


    debug('总数为%s,每组测试读%s行,共测试%s组', max, subPage, getDataConMax);

    for (var i = 0; i < getDataConMax; i++) {
        var sc = 0;
        var fc = 0;

        debug('开始第%s组测试', i + 1);

        var sql = util.format('SELECT * FROM t_data LIMIT %s,%s', i * subPage, subPage);
        var data = yield conn.query(sql, api.next);
        if (api.err) {
            failure++;
            debug('读取数据失败 跳过这一组');
            continue;
        }

        debug('读到%s行数据', data.length);
        for (var k = 0; k < data.length; k++) {
            wait++;

            //setTimeout是为了保证发出post请求一定在yield之后
            setTimeout(function () {
                post('http://10.0.0.5:3000?act=user.test&type=dl', data[i], function (err, backData) {
                    wait--;
                    if (err)
                        fc++;
                    else
                        sc++;
                    debug('等待回调返回:%s/%s', data.length - wait, data.length);
                    readline.moveCursor(process.stdout, 0, -1);
                    if (wait == 0) {
                        debug('确认所有回调均已返回');
                        api.next();
                    }
                });
            }, 0);
        }

        debug('已并发%s个post请求 等待回调全部返回', data.length);
        yield

        success++;
        debug('第%s组测试结束 成功%s次 失败%s次', i + 1, sc, fc);
    }

    yield api.return();
}, function (err, data, api) {
    var conn = api.conn;

    if (conn != null)
        conn.end();

    if (err)
        debug("%s:%o", data, err);

    debug('共有数据%s行 分为%s组测试 成功%s组 每组成功次数请看调试信息', max, getDataConMax, success);
})