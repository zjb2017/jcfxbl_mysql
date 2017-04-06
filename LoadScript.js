var debug = require('debug')('jcSerlet:LoadScript');
var fs = require("fs");
var xmlJS = require('xml2js');
var mysql = require('mysql');
var util = require('util');


function ParseSqlParameters(Template, postData) {
    var r = {};
    try {

        var ScriptType = Template['SqlScript'].$['type'];
        var Command = Template['SqlScript']['Command'];
        var Parameters = Template['SqlScript']['Parameters'];
        var ResultType = Template['SqlScript']['ResultType'];
        var sql = Command[0].toString();
        var selectSql = '';//select @returnValue, @returnMsg;

        //if (typeof (Parameters) != 'undefined')
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
                        console.log('Parameter ' + par_name + ' undefined');
                        r.err = 1;
                        return r;
                    } else {
                        sql = sql.replace(par_name, mysql.escape(par_value));
                    }
                }
                //debug('name:%s,value:%s', par.name, par.type);
            }
        }


        r.sql = sql;
        r.selectSql = selectSql;

        r.ScriptType = ScriptType;
    } catch (err) {
        r.err = 1;
        r.err_msg = err;
    }
    return r;

}

var LoadTemplet = function (pool, sqlModuleCache, act, postData, callback) {
    var err_code = 0;
    var err_msg;

    //  var path = util.format('./sqlModule/user/%s.xml', act);
    // fs.exists(path, function (exists) {
    //   if (!exists) {
    //     debug("Internal server error,Template file [%s] not found", path);
    //   err_msg = 'Internal server error: act ' + act + ' unrecognized';
    // err_code = 1;

    // callback(1, '', -1, err_msg);
    //}
    // else {
    var moduleFileData;
    if (typeof (sqlModuleCache[act]) == 'undefined') {
        //https://nodejs.org/dist/latest-v6.x/docs/api/fs.html

        var path = util.format('./sqlModule/user/%s.xml', act);
        if (fs.existsSync(path)) {
            moduleFileData = fs.readFileSync(path);
            sqlModuleCache[act] = moduleFileData.toString();
            debug('Read Template file [%s] successfully.', path);
        } else {
            debug("Internal server error,Template file [%s] not found", path);
            err_msg = 'Internal server error: act ' + act + ' unrecognized';
            err_code = 1;

            callback(1, '', -1, err_msg);
            return;
        }
    } else {
        moduleFileData = sqlModuleCache[act];
        debug('Read Template cache [%s] successfully.', act);
    }
    //解析xml
    xmlJS.parseString(moduleFileData, function (err, data) {
        var sql = '';
        var selectSql = '';
        var ScriptType;
        if (err) {
            debug('Internal server error,xmlJS.parseString error:%s', data);
            err_code = 2;
            err_msg = 'Internal server error,template parse failed.';
            callback(err, '', -2, 'Internal server error,template parse failed..');

        } else {

            r = ParseSqlParameters(data, postData);
            if (r.err > 0) {
                callback(err, '', -1, 'Script Parameters missing.');

            } else {
                console.log('Script Parameters successfully.');
                sql = r.sql;
                selectSql = r.selectSql;
                ScriptType = r.ScriptType;
                pool.getConnection(function (err, connection) {
                    if (err) {
                        console.log('Database connection failed');
                        callback(err, '', -1, 'Database connection failed');
                        //callback(err, 'Database connection failed');
                        connection.release();
                        return;
                    }
                    else {
                        connection.query(sql, function (err, rows, fields) {
                            if (err) {
                                debug("err:%O,%O,Query data failed：%s", err, rows, sql);
                                //callback(err, 'Query data failed.');
                                callback(err, '', -2, 'Query data failed.');
                                connection.release();
                                return;
                            } else {
                                debug("Prepare Query [%s] successfully", sql);
                                if (ScriptType == 'StoredProcedure') {

                                    selectSql = selectSql.substring(0, selectSql.length - 1) + ';';
                                    connection.query(selectSql, function (err, return_rows, fields) {
                                        if (err) {
                                            console.log('Query data failed：' + selectSql);
                                            //callback(err, 'Query data failed.');
                                            callback(err, '', -3, 'Query data failed');
                                        } else {
                                            debug("Prepare Query [%s] successfully", selectSql);
                                            //callback(0, rows);
                                            var result = rows;
                                            var returnValue = return_rows[0]['@returnValue'];
                                            var returnMsg = return_rows[0]['@returnMsg'];

                                            result.PacketCount = result.length;
                                            callback(err, result, returnValue, returnMsg);
                                        }

                                        connection.release();
                                    });
                                }
                                else {

                                    var result = rows;
                                    result.PacketCount = result.length;
                                    callback(err, result, 1, 'QueryOK');
                                    connection.release();
                                }
                            }
                        });
                    }
                });
            }
        }
    });
    //}
    //});
}

exports.LoadTemplet = LoadTemplet;