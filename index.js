var http = require('http');
var querystring = require('querystring');
var util = require('util');
var url = require('url');
var debug = require('debug')('jcSerlet:main');
var fs = require("fs");
var xmlJS = require('xml2js');

var ScriptExecute = require('./ScriptExecute.js').ScriptExecute;

var port = 1088;


var sqlModuleCache = {};

var req_count = 0;
var req_count_success = 0;

function Response(res, success, ErrCode, returnValue, returnMsg, returnResult) {
    var r = {};
    r.success = success;            //业务层成功标示(success/failed)
    r.ErrCode = ErrCode;            //错误代码（业务层／数据层）
    if (r.success == 'success') {
        r.returnValue = returnValue;      //查询返回值（查询／存储过程）
        r.returnMsg = returnMsg;          //查询返回值（存储过程）
        r.returnResult = returnResult;    //查询返回数据集
        //r.PacketCount = returnResult.PacketCount;
    } else {
        r.returnValue = '';      //查询返回值（查询／存储过程）
        r.returnMsg = '';          //查询返回值（存储过程）
        r.returnResult = [];    //查询返回数据集
        r.PacketCount = 0;
    }
    var resdata = JSON.stringify(r);

    res.end(resdata);
}


function LoadTempletScript(act) {
    if (typeof (sqlModuleCache[act]) == 'undefined') {
        //https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
        var path = util.format('./sqlModule/%s.xml', act.replace('.', '/'));
        if (fs.existsSync(path)) {
            moduleFileData = fs.readFileSync(path);
            sqlModuleCache[act] = moduleFileData.toString();
            debug('Template [%s] Load OK.', path);
        } else {
            debug("ERR_TEMPLET_FILE_READ_FAILED:[%s]", path);
            return null;
        }
    } else {
        moduleFileData = sqlModuleCache[act];
        debug('Template Cache [%s] Read OK.', act);
    }

    return sqlModuleCache[act];
}

http.createServer(
    function (request, response) {
        var postStr = '';
        request.setEncoding('utf8');
        request.addListener("data", function (chunk) {
            postStr += chunk;
        });

        request.addListener("end", function () {
            req_count++;

            var postData = querystring.parse(postStr);
            var urlParams = url.parse(request.url, true);
            var act = urlParams.query.act; //指令
            var actType = urlParams.query.type;//指令类别
            if (typeof (act) == 'undefined' || act == '' || act == null) {
                console.log('ERR_REQ_ACT_UNDEFINED' + ':' + act);
                Response(response, 'failed', 'ERR_REQ_ACT_UNDEFINED', null, null, null);
                return;
            }
            if (typeof (actType) == 'undefined' || actType == '' || actType == null) {
                console.log('ERR_REQ_TYPE_UNDEFINED' + ':' + actType);
                Response(response, 'failed', 'ERR_REQ_TYPE_UNDEFINED', null, null, null);
                return;
            }
            switch (actType) {
                case 'dl': {
                    var TemplateScript = LoadTempletScript(act);
                    if (TemplateScript == null) {
                        Response(response, 'failed', 'ERR_TEMPLET_FILE_READ_FAILED', null, null, null);
                    } else {
                        xmlJS.parseString(moduleFileData, function (err, data) {
                            if (err) {
                                console.log('ERR_TEMPLET_XML_PARSE_FAILED:' + act);
                                debug('%s', data);
                                Response(response, 'failed', 'ERR_TEMPLET_XML_PARSE_FAILED', null, null, null);
                            } else {
                                ScriptExecute(data, postData, function (ErrCode, returnValue, returnMsg, returnResult) {
                                    if (ErrCode) {
                                        Response(response, 'failed', ErrCode, null, null, null);
                                    } else {
                                        req_count_success++;
                                        Response(response, 'success', null, returnValue, returnMsg, returnResult);
                                    }
                                });

                            }
                        });//xmlJS.parseString
                    }

                    break;
                }
                case 'bi': {
                    ///
                    //https://github.com/mysqljs/mysql/blob/master/test/integration/connection/test-procedure-with-multiple-selects.js
                    //var sql = util.format('call %()', act);
                    ///
                    break;
                }
                case 'developer': {

                    break;
                }
                default:
                    {
                        console.log('ERR_REQ_TYPE_UNKNOWN :[' + actType + ']');
                        Response(response, 'failed', 'ERR_REQ_TYPE_UNKNOWN', null, null, null);
                        break;
                    }
            }
            //console.log('request end');
        });
    }
).listen(port);


console.log('JCServer listen:' + port);


var TimerTick =1000 * 60;
var mydate_t0 = new Date();

setInterval(function () {

    var mydate = new Date();
    var hh = mydate.getHours() - mydate_t0.getHours();
    var mm = mydate.getMinutes() - mydate_t0.getMinutes();
    var ss = mydate.getSeconds() - mydate_t0.getSeconds();
    var T = ss + mm * 60 + hh * 60 * 60;

    console.log('[' + hh+':'+mm+':'+ss + '] S req_count： ' + req_count +'('+req_count/T+ '/s) success:' + req_count_success+'('+req_count_success/T+ '/s)');
    req_count = 0;
    req_count_success = 0;
    mydate_t0 = new Date();

}, TimerTick);