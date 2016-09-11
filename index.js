var express = require('express');
var app =express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var users=new Array();
server.listen(3434);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));
io.on('connection', function (socket) {
  socket.on('user',function(data){
  	io.emit('call',data);
  });
  socket.on('login',function(id){
  	users.push(id);
  })
});

// var wss = new WebSocketServer({port: 3434});
// var userList=new Array();
// wss.broadcast = function(data) {
//     for(var i in this.clients) {
//         this.clients[i].send(data);
//     }
// };

// wss.on('connection', function(ws) {
//     ws.on('message', function(message) {
//         console.log('received: %s', message);
//         //wss.broadcast(message);
//     });
// });
