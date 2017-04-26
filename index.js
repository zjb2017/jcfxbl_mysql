var http = require('http');
var debug = require('debug')('jcSerlet:main');
var HttpContent = require('./HttpContext.js').HttpContent;

var port = 1088;


//全局缓存
var JCCache = {};
JCCache.sqlModuleCache = {};
JCCache.SrvState = {};

//客户端请求次数
JCCache.SrvState.RequestCount = 0;
//服务器应答次数
JCCache.SrvState.ResponseCount = 0;

//程序启动时间
JCCache.SrvState.StartTime = new Date();



//统计60分钟内的平均请求／处理频次
var TimerTick = 1000 * 60 * 60;
var mydate_t0 = new Date();
setInterval(function () {
    var mydate = new Date();
    var hh = mydate.getHours() - mydate_t0.getHours();
    var mm = mydate.getMinutes() - mydate_t0.getMinutes();
    var ss = mydate.getSeconds() - mydate_t0.getSeconds();
    var T = ss + mm * 60 + hh * 60 * 60;

    var req_pv = JCCache.SrvState.RequestCount / T;
    var res_pv = JCCache.SrvState.ResponseCount / T;
    req_pv = req_pv.toFixed(2);
    res_pv = res_pv.toFixed(2);
    console.log(mydate.toLocaleString() + ' req_count： ' + JCCache.SrvState.RequestCount + '(' + req_pv + '/s) success:' + JCCache.SrvState.ResponseCount + '(' + res_pv + '/s)');
    JCCache.SrvState.RequestCount = 0;
    JCCache.SrvState.ResponseCount = 0;
    mydate_t0 = new Date();
}, TimerTick);




var server = http.createServer(
    function (request, response) {
        try {
            var postStr = '';
            request.setEncoding('utf8');
            request.addListener("data", function (chunk) {
                postStr += chunk;
            });
            request.addListener("end", function () {
                JCCache.SrvState.RequestCount++;
                //Http上下文处理
                HttpContent(JCCache, request, response, postStr);
            });
        }
        catch (err) {
            //服务器错误
            console.log(err.stack);
        }
    }
);//.listen(port);

//连接数设置了，似乎意义不大！
//server.maxConnections=2000;

//启动服务
server.listen(port);


var myDate = new Date();
console.log(myDate.toLocaleString() + '  JCServer listen:' + port);
