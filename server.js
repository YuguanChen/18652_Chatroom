// 引入必须模块
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'test'
});
 
connection.connect();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 在线人数统计
var onlineCount = 0;
app.use(express.static(__dirname));

var userlist=new Array();

// 路径映射
app.get('/login', function (req, res) {
    res.sendFile(__dirname +'/login.html');
});

app.post('/login*', urlencodedParser, function (req, res) {
   var response = {
       "username":req.body.username,
       "password":req.body.password,
       "profile":req.body.profile,
       "register":req.body.register
   };
   //console.log(response);
   var sql = 'SELECT * FROM user';
   var flag=0;
   connection.query(sql,function (err, result) {
       if(err){
         console.log('[SELECT ERROR] - ',err.message);
         return;
       } 
       var password;
       for (var i=0;i<result.length;i++)
           if (result[i].user_name==response.username) {flag=1;password=result[i].user_password;}
       
       if (typeof(response.profile)!="undefined")
          if (flag==1 && response.password==password){
             var url="http://localhost:4000/index.html?selectpicture="+response.profile+"&username="+response.username;
             res.redirect(url);
          }
          else res.redirect("http://localhost:4000/login.html?status=wrong");
       else 
         if (flag==1) res.redirect("http://localhost:4000/login.html?status=already");
         else{
             insert_user(response);
             res.redirect("http://localhost:4000/login.html?status=registed");
         }
   }); 

})


// 当有用户连接进来时
io.on('connection', function (socket) {
    //console.log('a user connected');
    socket.on('new_connection', function(username){
        var list=show_message(username);
    })

    //console.log(list);
    // 发送给客户端在线人数
    io.emit('connected', ++onlineCount);

    // 当有用户断开
    socket.on('disconnect', function () {
        //console.log('user disconnected');

        // 发送给客户端断在线人数
        io.emit('disconnected', --onlineCount);
        //console.log(onlineCount);
    });

    // 收到了客户端发来的消息
    socket.on('message', function (message) {
        // 给客户端发送消息
        save_message(message);
        io.emit('message', message);
    });
    
});

var server = http.listen(4000, function () {
    console.log('Server is running');
});


function insert_user(response){
  var sql='insert into user (user_name,user_password) values (\''+ response.username + '\','+'\'' + response.password + '\');';
  connection.query(sql, function (error, result, fields) {
      if (error) throw error;
  });
}

function save_message(message){
  var sql='insert into message(user_name, user_profile, message_content, message_time) values (\'';
  sql=sql+message.name + '\','+'\'' + message.img + '\','+'\'' + message.chatContent + '\','+'\'' + message.time+ '\');';
  //console.log(message);
  //console.log(sql);
  connection.query(sql, function (error, result, fields) {
      if (error) throw error;
  });
}

function show_message(username){
  var sql = 'SELECT * FROM message';
  connection.query(sql, function (error, result, fields) {
      if (error) throw error;
      io.emit('oldmessage',result,username);
  });
}