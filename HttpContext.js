var ResponseEnd = require('./ResponseEnd.js').ResponseEnd;
var xmlJS = require('xml2js');

var ScriptExecute = require('./ScriptExecute.js').ScriptExecute;

var LoadTempletScript = require('./LoadTempletScript.js').LoadTempletScript;

var querystring = require('querystring');
var util = require('util');
var url = require('url');
var debug = require('debug')('jcSerlet:HttpContent');



function HttpContent(JCCache, request, response, postStr) {

    var postData = querystring.parse(postStr);
    var urlParams = url.parse(request.url, true);
    var act = urlParams.query.act; //指令
    var actType = urlParams.query.type;//指令类别
    if (typeof (act) == 'undefined' || act == '' || act == null) {
        var myDate = new Date();
        console.log(myDate.toLocaleString() + ' ERR_REQ_ACT_UNDEFINED :[' + act + ']');
        ResponseEnd(JCCache, response, 'false', 'ERR_REQ_ACT_UNDEFINED', null, null, null);
        return;
    }
    if (typeof (actType) == 'undefined' || actType == '' || actType == null) {
        var myDate = new Date();
        console.log(myDate.toLocaleString() + ' ERR_REQ_TYPE_UNDEFINED :[' + actType + ']');
        ResponseEnd(JCCache, response, 'false', 'ERR_REQ_TYPE_UNDEFINED', null, null, null);
        return;
    }

    switch (actType) {
        case 'dl': {
            var TemplateScript = LoadTempletScript(JCCache, act);
            if (TemplateScript == null) {
                ResponseEnd(JCCache, response, 'false', 'ERR_TEMPLET_FILE_READ_FAILED', null, null, null);
            } else {
                xmlJS.parseString(moduleFileData, function (err, data) {
                    if (err) {
                        var myDate = new Date();
                        console.error(myDate.toLocaleString() + ' ERR_TEMPLET_XML_PARSE_FAILED :[' + act + ']');
                        ResponseEnd(JCCache, response, 'false', 'ERR_TEMPLET_XML_PARSE_FAILED', null, null, null);
                    } else {
                        ScriptExecute(data, postData, function (ErrCode, msg, result, resultCount) {
                            if (ErrCode > 0) {
                                ResponseEnd(JCCache, response, 'false', ErrCode, msg, null, null);
                            } else {
                                //req_count_success++;
                                ResponseEnd(JCCache, response, 'true', ErrCode, msg, result, resultCount);
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
                var myDate = new Date();
                console.error(myDate.toLocaleString() + ' ERR_REQ_TYPE_UNKNOWN :[' + actType + ']');
                ResponseEnd(response, 'false', 'ERR_REQ_TYPE_UNKNOWN', null, null, null);
                break;
            }
    }
}


module.exports.HttpContent = HttpContent;