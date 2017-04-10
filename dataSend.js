var debug = require('debug')('dataSend');
var mysql = require('mysql');
var util = require('util');
const uuidV4 = require('uuid/v4');
var run = require('sync_back').run;
var readline = require('readline');
var request = require('request');
var db_conf = require('./config');

var conf = {
    'tableName': 't_data',
    'url': 'http://10.0.0.5:1088?act=user.test&type=dl'
}

run(function* (api) {
    api.conn = mysql.createConnection(db_conf);

    var conn = api.conn;
    var errCounter = 0;

    yield conn.connect(api.next);
    if (api.err)
        yield api.return(api.err, '连接数据库失败');

    var data = yield conn.query('SELECT * FROM ' + conf.tableName, api.next);
    if (api.err)
        yield api.return(api.err, '读取数据失败');
    debug('读到%s行数据', data.length);

    debug('开始发送数据');
    for (var i = 0; i < data.length; i++) {
        var timeStatr = new Date().getTime();
        yield post(conf.url, data[i], api.next);
        if (api.err) {
            debug('请求失败:%o', api.err);
            errCounter++;
            continue;
        }
        var timeEnd = new Date().getTime();
        debug('请求成功 本次请求花费时间%s', timeEnd - timeStatr);
    }

    debug('测试结束 共发送%s个包 成功%s个', data.length, data.length - errCounter);

    yield api.return();
}, function (err, data, api) {
    var conn = api.conn;

    if (conn != null)
        conn.end();

    if (err)
        debug("%s:%o", data, err);
})

function post(url, data, back) {
    request.post({
        url: url,
        form: data
    }, function (err, httpResponse, body) {
        back(err, body);
    })
}