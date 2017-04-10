var debug = require('debug')('getData');
var mysql = require('mysql');
var util = require('util');
const uuidV4 = require('uuid/v4');
var run = require('sync_back').run;

var db_conf = {
    host: '127.0.0.1',
    user: 'root',
    password: '1q2w3e4r5t6y&*(',
    database: 'testdb'
};

var max = 100000;
var success = 0;
var failure = 0;
var t1 = new Date().getTime();

run(function* (api) {
    api.conn = mysql.createConnection(db_conf);

    var conn = api.conn;

    yield conn.connect(api.next);
    if (api.err)
        yield api.return(api.err, '连接数据库失败');

    debug('开始生成数据');
    for (var i = 0; i < max; i++) {
        var sql = util.format(
            'INSERT INTO t_data(id,c1,c2,c3,c4,c5,c6,c7,c8,c9) VALUES ("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s")',
            uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4(), uuidV4()
        );
        var data = yield conn.query(sql, api.next);
        if (api.err) {
            debug('插入失败:%o', api.err);
            failure++;
        } else {
            success++;
        }
        debug('总数:%s/成功数:%s/失败数:%s', max, success, failure);
    }
    debug('生成数据完毕');

    yield api.return();
}, function (err, data, api) {
    var conn = api.conn;

    if (conn != null)
        conn.end();

    if (err)
        debug("%s:%o", data, err);

    var t2 = new Date().getTime();
    debug('执行插入%s次 成功%s次 共消耗时间%s秒', max, success, (t2 - t1) / 1000);
})
