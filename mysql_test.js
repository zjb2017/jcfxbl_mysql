var mysql=require('mysql');
var conn=mysql.createConnection({
    host:'10.211.55.23',
    user:'root',
    password:'123456',
    database:'testdb'
});

conn.connect();


conn.query('SELECT * FROM testdb.t_hyb', function(err, rows, fields) {
    if (err) throw err;
    console.log('The solution is: ', rows);
});
//关闭连接
//conn.end();