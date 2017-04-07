var config = require('./config.js');
var debug = require('debug')('jcSerlet:JCDB');

//https://github.com/mysqljs/mysql/issues/682
//https://github.com/mysqljs/mysql/issues/1122

var mysql = require('mysql');
var pool = mysql.createPool({
    //connectionLimit: 10,
    //acquireTimeout: 10000,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: false
});

//导出查询相关  
var query = function (sql, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (qerr, vals, fields) {
                //释放连接    
                conn.release();
                //事件驱动回调    
                callback(qerr, vals, fields);
            });
        }
    });
};

module.exports=query;
