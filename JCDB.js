var config = require('./config.js');
var debug = require('debug')('jcSerlet:JCDB');

//https://github.com/mysqljs/mysql/issues/682
//https://github.com/mysqljs/mysql/issues/1122
var initPool = function () {
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
    debug("mysql.createPool connectionLimit [%d],acquireTimeout [%d]", pool.config.connectionLimit, pool.config.acquireTimeout);
    return pool;
}



exports.initPool = initPool;
