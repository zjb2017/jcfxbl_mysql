wget https://nodejs.org/dist/v6.10.2/node-v6.10.2-linux-x64.tar.xz

解压  
tar -xvf node-v6.10.2-linux-x64.tar.xz 
移到通用的软件安装目录 /opt/ 
sudo mv node-v6.10.2-linux-x64 /opt/
安装 npm 和 node 命令到系统命令 
sudo ln -s /opt/node-v6.10.2-linux-x64/bin/node /usr/local/bin/node 
sudo ln -s /opt/node-v6.10.2-linux-x64/bin/npm /usr/local/bin/npm

验证： 
node -v

v4.4.4
npm -v


//Box 盒子内

sudo ln -s /opt/node-v6.10.2-linux-armv7l/bin/node /usr/local/bin/node 
sudo ln -s /opt/node-v6.10.2-linux-armv7l/bin/npm /usr/local/bin/npm

/opt/node-v6.10.2-linux-armv7l


linux 下启用调试  输出 的参数

export DEBUG=*

kill -9 PID 杀掉 node


----测试环境----

sudo apt-get update
sudo apt-get install git


cd /
mkdir project

git clone https://github.com/zjb2017/jcfxbl_mysql

git clone https://github.com/zjb2017/HttpPostTest



npm install


///////////////////////////////////////////////////
Web开发，少不了的就是压力测试，它是评估一个产品是否合格上线的基本标准，下面我们来一一剖析他们的使用方式。

测试前，前面先把系统的端口限制数改大，看看Mac下面的默认限制

ulimit -a

open files (-n) 2560
2000多的fd数是很小的，我们把他改大，当然我测试过了，也只能开10000而已，Linux可以开6W多，所以：

ulimit -n 10000
在用 ulimit -a 检查一下

open files (-n) 10000
接下来把cpu检查打开，通常我们只看使用率最高的那个即可：

top -n1
-n3 就是前面3个了，以此类推。

OK我们可以继续了。。。

webbench

webbench是一枚强大得可以的压力测试工具，它最多可以模拟3万个并发连接去测试网站的负载能力，个人感觉要比Apache自带的ab压力测试工具好，安装使用也特别方便。

安装：

sudo port install webbench
用法：

webbench -c 并发数 -t 运行测试时间 URL
如：

webbench -c 5000 -t 120 http://www.epooll.com
ab

ab是Apache自带的压力测试工具，非常小巧，可惜的是在mac下面表现不佳，跳动太大，而且还会出现 apr_socket_recv: Connection reset by peer (54) 的错误。ab想说爱你不容易呀，不过Linux下还是比较稳定的，所以还是来说说用法吧。

安装：

http://apache.mirrors.pair.com/httpd/
用法：

ab -c 并发数 -n 请求数 URL
如：

ab -c 1000 -n 10000 http://www.epooll.com
当然其他用法就自己 man ab 然后好好看文档啦

siege

siege是我解决ab该死的 apr_socket_recv: Connection reset by peer (54) 错误时发现的一个好工具，不得不说这工具真心好，用法和webbench一样，但是信息全面很多。

安装：

sudo port install siege
用法：

siege -c 并发数 -t 运行测试时间 URL
如：

siege -c 1000 -t 5s URL
这里要注意的是-t后面的时间要带单位，s表示秒，如果不带，就是分钟，分钟的单位，还是挺长的，所以要注意一下。



ab -n 100000  -c 800 -p 'post.txt' -T 'application/x-www-form-urlencoded' 'http://118.190.114.124:1089/?type=dl&act=user.InsertHYXX'



ETIMEDOUT



ERR_REQ_ACT_UNDEFINED           客户端ACT参数未定义
ERR_REQ_TYPE_UNDEFINED          客户端TYEP参数未定义

ERR_REQ_TYPE_UNKNOWN            未知TYPE值

ERR_PARAM_UNDEFINED             参数未定义

ERR_TEMPLET_PARAM_PARSE_FAILED  模版文件参数解析错误
ERR_TEMPLET_XML_PARSE_FAILED    模版文件XML内容解析错误
ERR_TEMPLET_FILE_READ_FAILED    模版文件读取失败
ERR_TEMPLET_EXECUTE_FAILED      模版文件脚本调用失败

ERR_DB_CONNECT_FAILED           数据库连接失败
ERR_DB_QUERY_FAILED             数据查询失败
ERR_DB_QUERY_PRO_RE_FAILED      存储过程返回值查询失败

OK_DB_QUERY                     数据库查询成功
OK_DB_PROCED                    存储过程调用成功


OK_DL


undefined




ab -n 100  -c 10 -p 'post.txt' -T 'application/x-www-form-urlencoded' 'http://118.190.114.124:1088/?type=dl&act=user.InsertHYXX'


ab -n 100  -c 10 -p 'post.txt' -T 'application/x-www-form-urlencoded' 'http://127.0.0.1:1088/?type=dl&act=user.InsertHYXX'




/*
                        var Result = {};
                        var Tables={};
                        Tables[0]={};
                         Tables[0].rows={};
                         Tables[0].totalCount=0;

                        var PAMROutPut={};
                        var PAMROutPut_count=0;
                        var OkPacket={};
                        var OkPacket_count=0;


                        //Result.Table={};
                        //Result.Table.rows={};
                        //Result.Table.totalCount=0;

                        /*
                       


                        if(rows.__proto__.constructor.name=='Array')
                        {

                        }


                        for (var i = 0; i < rows.length; i++) {

                            switch(rows[i].__proto__.constructor.name)
                            {
                                case 'OkPacket':
                                {
                                     OkPacket[OkPacket_count++]=rows[i];
                                     break;
                                }
                                case '':{
                                    PAMROutPut[PAMROutPut_count] = rows[i];
                                    break;
                                }
                                case 'Array':
                                {
                                     Tables[i]={};
                                     Tables[i].rows = rows[i];
                                     Tables[i].totalCount=rows[i].length;
                                     break;
                                }
                                case 'RowDataPacket':
                                {
                                    break;
                                }
                                default:
                                {
                                    debug("%O",rows[i]);
                                    break;
                                }
                            
                            }
                        }
                           /* if (rows[i].__proto__.constructor.name == 'OkPacket') {
                                returnResult['PAMROutPut'] = rows[i + 1];
                                break;
                            } else {
                                if(rows[i].__proto__.constructor.name == 'RowDataPacket')
                                {

                                }else{

                                }
*/
                                //Result[i] = rows[i];
                                /*Result.Table[ResultCount]={};
                                Result.Table[ResultCount].rows[i]=rows[i];
                                Result.Table[ResultCount].totalCount=rows[i].length;*/
                               // ResultCount++;
                            //}
                        //}
                        //释放连接  
                       // var returnResult = {};
                        
                       // returnResult['DataSet'] = Tables;
                       // returnResult['PAMROutPut'] = PAMROutPut;
                       // returnResult['OkPacket'] = OkPacket;







                       进入主题：

　　修改/etc/profile文件，在末尾添加以下内容

1
2
export NODE_HOME=/usr/local/node  //Node所在路径
export PATH=$NODE_HOME/bin:$PATH
　　修改完成后需要重新登陆才能生效，也可以执行命令 source /etc/profile 或者 . /etc/profile来生效（注意。与/etc/profile中有一个空格）

     查看PATH

1
2
3
4
查看单个环境变量
echo $PATH
查看所有环境变量
env

