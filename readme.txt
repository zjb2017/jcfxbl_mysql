wget https://nodejs.org/dist/v6.10.2/node-v6.10.2-linux-x64.tar.xz

下载并解压 node-v6.10.2-linux-x64.tar.xz 
tar -xJf node-v6.10.2-linux-x64.tar.xz 
移到通用的软件安装目录 /opt/ 
sudo mv node-v6.10.2-linux-x64 /opt/

安装 npm 和 node 命令到系统命令 
sudo ln -s /opt/node-v6.10.2-linux-x64/bin/node /usr/local/bin/node 
sudo ln -s /opt/node-v6.10.2-linux-x64/bin/npm /usr/local/bin/npm

验证： 
node -v

v4.4.4
npm -v




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

