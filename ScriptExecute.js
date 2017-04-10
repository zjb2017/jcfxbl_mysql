var debug = require('debug')('jcSerlet:LoadScript');
var xmlJS = require('xml2js');
var util = require('util');
var config = require('./config.js');
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
    multipleStatements: true
});



function ParseSqlParameters(Template, postData) {
    var r = {};
    r.ErrCode = 0;
    r.ErrMsg = null;
    try {
        var ScriptType = Template['SqlScript'].$['type'];
        var Command = Template['SqlScript']['Command'];
        var Parameters = Template['SqlScript']['Parameters'];
        var ResultType = Template['SqlScript']['ResultType'];
        var sql = Command[0].toString();
        var selectSql = '';//select @returnValue, @returnMsg;
        if (typeof (Parameters) != 'undefined')
            if (Parameters.length == 1 && typeof (Parameters[0].par) != 'undefined') {
                for (var i = 0; i < Parameters[0].par.length; i++) {
                    //https://www.npmjs.com/package/xml2js
                    //attrkey (default: $): Prefix that is used to access the attributes. Version 0.1 default was @.
                    var par = Parameters[0].par[i].$;
                    var par_name = par.name;
                    var par_type = par.type;
                    var par_dir = par.dir;
                    var par_value = postData[par_name.replace('@', '')];
                    if (par_dir == 'OUT') {
                        if (selectSql == '') selectSql = 'select ';
                        selectSql += par_name + ',';
                    } else {
                        if (typeof (par_value) == 'undefined') {
                            console.log('ERR_PARAM_UNDEFINED:' + par_name);
                            r.ErrCode = 1;
                            r.ErrMsg = 'ERR_PARAM_UNDEFINED';
                        } else {
                            sql = sql.replace(par_name, mysql.escape(par_value));
                        }
                    }
                    //debug('name:%s,value:%s', par.name, par.type);
                }
                if (selectSql.length > 0) {
                    selectSql = selectSql.substring(0, selectSql.length - 1) + ';';
                }
            }
    } catch (err) {
        r.ErrCode = 1;
        r.ErrMsg = 'ERR_TEMPLET_PARAM_PARSE';
    }
    r.sql = sql;
    r.selectSql = selectSql;
    return r;
}

var ScriptExecute = function (Template, postData, callback) {
    //callback=function (ErrCode, returnValue, returnMsg, returnResult)
    //解析xml
    var r = ParseSqlParameters(Template, postData);
    if (r.ErrCode > 0) {
        callback(r.ErrMsg, null, null, null);
    } else {
        var ScriptType = r.ScriptType;
        var sql = r.sql + r.selectSql;
        pool.getConnection(function (err, conn) {
            if (err) {
                //conn.release();
                console.log('ERR_DB_CONNECT_FAILED');
                callback('ERR_DB_CONNECT_FAILED', null, null, null);
            } else {
                conn.query(sql, function (qerr, rows, fields) {

                    //事件驱动回调   
                    if (qerr) {
                        debug("ERR_DB_QUERY_FAILED:%s", sql);
                        callback('ERR_DB_QUERY_FAILED', -1, null, null);
                        //释放连接  
                        conn.release();

                    } else {
                        var returnValue;
                        var returnMsg;
                        var Result = {};
                        var returnResult = {};
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].__proto__.constructor.name == 'OkPacket') {
                                returnResult['PAMROutPut'] = rows[i + 1];
                                break;
                            } else {
                                Result[i] = rows[i];
                            }
                        }
                        //释放连接  
                        returnResult['Result'] = Result;
                        callback(null, returnValue, returnMsg, returnResult);
                        conn.release();
                    }
                });
            }
        });//pool.getConnection
    }
}



module.exports.ScriptExecute = ScriptExecute;