var debug = require('debug')('dataSend');
var mysql = require('mysql');
var util = require('util');
const uuidV4 = require('uuid/v4');
var run = require('sync_back').run;
var fs = require('fs');
var db_conf = require('./config');

var conf = {
    'tableName': 't_data',
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

    debug('开始写入数据');
    for (var i = 0; i < data.length; i++) {
        var d = '';
        for (var name in data[i])
            d += name + '=' + data[i][name] + '&';
        d = d.substring(0, d.length - 1);

        yield fs.appendFile('data.txt', d + '\n', api.next);
        if (api.err) {
            debug('写入失败');
            errCounter++;
            continue;
        }
        debug('进度 %s/%s', i + 1, data.length);
    }

    debug('写入结束 共写入%s行 成功%s个', data.length, data.length - errCounter);

    yield api.return();
}, function (err, data, api) {
    var conn = api.conn;

    if (conn != null)
        conn.end();

    if (err)
        debug("%s:%o", data, err);
})
