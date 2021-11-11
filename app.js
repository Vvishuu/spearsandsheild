var express=require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname+ '/public'));

app.get('/', function(req, res) {
   res.sendfile('index.html');
});

var count=1;
var roomno =1;
var users= 0;
io.on('connection',function(socket){
	var id = 'usr'+count;
	count++;
	
    socket.join("room-"+roomno);
    users++;
    io.sockets.in("room-"+roomno).emit('connectToRoom',{id:id,roomid:"room-"+roomno,users:users});
    if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1){
    roomno++;
    users=0;
  }
 
    socket.on('spear',function(data){
    	socket.broadcast.in(data.obj.room_id).emit('attack',{value:10,obj:data.obj});
    });

    socket.on('result',function(data){
      socket.broadcast.in(data.obj.room_id).emit('recieved',{value:10});
    });

    socket.on('alert',function(data){
      socket.broadcast.in(data.obj.room_id).emit('alertback',{value:data.value,obj:data.obj});
    });

    socket.on('lightoff',function(data){
      socket.broadcast.in(data.obj.room_id).emit('lightoffback',{obj:data.obj});
    });
	
   socket.on('send-msg',function(data){
      socket.broadcast.in(data.obj.room_id).emit('msg-rcv',{msg:data.msg,obj:data.obj});
    });

    socket.on('leftroom',function(data){
      var tempid="room-"+roomno;
      if (tempid==data.obj.room_id) { roomno++; users=0; }
      socket.broadcast.in(data.obj.room_id).emit('leftroomback',{obj:data.obj});
    });

});

var port = process.env.PORT || 3000;
http.listen(port, function() {
   console.log('listening on *:'+port);
});
