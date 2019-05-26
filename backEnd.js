//server code
const express	= require("express")
const socket 	= require('socket.io')
var app = express();

var server = app.listen(4000,function(){
	console.log('');
	console.log("\x1b[36m%s\x1b[0m","FatMan32 game server started - press ctrl+c for stop_________________________")
  	console.log("\x1b[32m%s\x1b[0m",'-------> listening  on port 4000')
});

app.use(express.static('.'))//change for 'html_server_test' to start on chat test page

var io= socket(server);

io.on('connection',function(s){
  console.log("\x1b[33m%s\x1b[0m",'new client conected -->	',s.id);
});