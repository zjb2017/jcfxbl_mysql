var http = require('http');
var querystring = require('querystring');
var util = require('util');
var url = require('url');

var debug = require('debug')('jcSerlet:main');
var fs = require("fs");
var xmlJS = require('xml2js');

var JCDB = require('./JCDB.js');

var LoadScript = require('./LoadScript.js');


var port = 1088;


var pool = JCDB.initPool();

var sqlModuleCache = {};


function res(success, returnValue, returnMsg, returnMsgCode, returnResult) {
    var r = {};
    r.success = success;//success / failed
    r.returnValue = returnValue;
    r.returnMsg = returnMsg;
    r.returnMsgCode = returnMsgCode;
    r.returnResult = returnResult;
    r.returnCount = returnResult.returnCount;
    /* if (typeof (returnResult.length) == 'undefined') {
         r.returnCount = 0;
     } else {
         r.returnCount = returnResult.length;
     }*/

    return JSON.stringify(r);
}

http.createServer(
    function (request, response) {
        var success;  //业务层请求成功标示
        var returnValue;
        var returnMsg;
        var returnMsgCode;
        var returnResult = {};
        var returnCount;

        var postStr = '';
        request.setEncoding('utf8');
        request.addListener("data", function (chunk) {
            postStr += chunk;
        });

        request.addListener("end", function () {
            var postData = querystring.parse(postStr);
            var urlParams = url.parse(request.url, true);

            var act = urlParams.query.act; //指令
            var actType = urlParams.query.type;//指令类别

            if (typeof (act) == 'undefined' || act == '' || act == null) {
                console.log('warning act : undefined');
                var r = res('failed', '0', 'warning :act undefined', '500', '');
                response.end(r);
                return;
            }
            if (typeof (actType) == 'undefined' || actType == '' || actType == null) {
                console.log('warning Type: undefined');
                var r = res('failed', '0', 'warning :type undefined', '500', '');
                response.end(r);
                return;
            }
            switch (actType) {
                case 'dl': {
                    LoadScript.LoadTemplet(pool, sqlModuleCache, act, postData, function (err, result, returnValue, returnMsg) {

                        if (err) {
                            response.end(res('failed', returnValue, returnMsg, returnMsgCode, result));
                        } else {
                            response.end(res('success', returnValue, returnMsg, returnMsgCode, result));
                        }
                    });

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

                        console.log('warning type[' + actType + '] : unrecognized');
                        var r = res('failed', '0', 'warning :type unrecognized', '400', '');
                        response.end(r);
                        return;
                        break;
                    }
            }

            //console.log('request end');
        });

    }
).listen(port);


console.log('JCServer listen:' + port);