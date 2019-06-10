//server code
const express	= require("express")
const socket 	= require('socket.io')
var app = express();

var server = app.listen(4000,function(){
	console.log('');
	console.log("\x1b[36m%s\x1b[0m","TheOpenGate server started - press ctrl+c for stop_________________________")
  	console.log("\x1b[32m%s\x1b[0m",'-------> listening  on port 4000')
});

app.use(express.static('./tog/'))//change for 'html_server_test' to start on chat test page

var io= socket(server);

io.on('connection',function(s){
  console.log("\x1b[33m%s\x1b[0m",'new client conected -->	',s.id);

  s.on('identifier',(clave_id)=>{
  	let identifier= {
  		clave:		clave_id,	//clave de sala
  		server_id:	s.id,		//id de la sesión (socket)
  		connection:	0,			//estado de conexion (disponibilidad de sala)
  		py:			0,			//jugador aún no definido
  	}
  	
  	s.emit('identifier',identifier);
  })

  s.on('chat',(message_data)=>{
  	io.sockets.emit('chat',message_data);
  	console.log("\x1b[36m%s\x1b[0m","--> global chat message by: ",s.id)
  })

});
