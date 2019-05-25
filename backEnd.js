//server code, for a provissional use i taked the lilim project source https://github.com/wecode4food/lilith/blob/master/server.js
const express	= require("express")
const socket 	= require('socket.io')
const firebase  = require('firebase')
var app = express();
var provider = new firebase.auth.GoogleAuthProvider();
//let results = {};
//let listS = [];

var server = app.listen(4500,function(){
	console.log('');
	console.log("\x1b[36m%s\x1b[0m","server started - press ctrl+c for stop_________________________")
  	console.log("\x1b[32m%s\x1b[0m",'-------> listening  on port 80')
});

app.use(".");

var config = {
    apiKey: "AIzaSyCoEZjpQrQNdzpPM_WN64-2ygQOp0rV02A",
    authDomain: "adan-is-aive.firebaseapp.com",
    databaseURL: "https://adan-is-aive.firebaseio.com",
    projectId: "adan-is-aive",
    storageBucket: "adan-is-aive.appspot.com",
    messagingSenderId: "738898624761"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
//data base functions

function writeData(data, child) {
	// Get a key for a new Post.
	var newPostKey = firebase.database().ref().child(child).push().key;
  
	// Write the new post's data simultaneously in the posts list and the user's post list.
	var updates = {};
	updates[('/'+child+'/') + newPostKey] = data;
	data.key = newPostKey;
	return firebase.database().ref().update(updates);
}

function readData(in_child){
	
	firebase.database().ref('/'+in_child+'/').on("value", snapshot => {
		var results = snapshot.val(); //siempre es snapshot.val() para tomar el json de la ruta
		//console.log(snapshot.val());
            //console.log(results)//esto es para mostrar
            let xd = Object.getOwnPropertyNames(results);
            //this.setState({dataKeys: xd, getFckanSht: results});
            //console.log(this.state.dataKeys);
            //console.log(this.state.getFckanSht);
            let bad = results;
            let x;
            for (x in bad) {
                //console.log(bad[x]);
                listS.push(bad[x]);

            }
		return results;
	});
}

function addUserData(in_admin, in_cc, in_nombre, in_email, in_barrio){
	writeData(
		{
			admin: in_admin,
			cc: in_cc,
			nombre: in_nombre,
			email: in_email,
			barrio: in_barrio
		}, 'user');
}

function addPost(desc, in_reto, tit, src){
	writeData(
		{
			descripcion: desc,
			reto: in_reto, 
			titulo: tit,
			srchelp: src
		}, 'post');
}

function addReto(in_desc, in_persona, int_title, src){
	writeData(
		{
			descripcion: desc,
			owner: in_persona,
			titulo: tit,
			srchelp: src
		}, 'reto');
}

function register(admin, cc, nombre, email, password, barrio){
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("fallo de registro ", errorCode, " ", errorMessage);
	});
	
}

function login(email, password, client){
	let auth = true;
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
		auth = false;
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("fallo de ingreso ", errorCode, " ", errorMessage);
	});
	if(auth)
	{
		client.emit('showNotif',{});
		if(email === 'admin@admin.com'){
			client.emit('admin',{admin:true});
		}else{
			client.emit('admin',{admin:false});
		}
	}
}

function googleLogin(email, password){
	firebase.auth().signInWithPopup(provider).then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
		// ...
	  }).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		console.log("fallo de ingreso ", errorCode, " ", errorMessage);
		});
}


//app.use(express.static('./public/html'))//change for 'html_server_test' to start on chat test page
var io= socket(server);

console.log(readData('user'));

//server listener
io.on('connection',function(s){
	console.log("\x1b[33m%s\x1b[0m",'new client conected -->	',s.id);

	s.on('chat', (message_data)=>{
		io.sockets.emit('chat',message_data);
		console.log("\x1b[36m%s\x1b[0m","--> global chat message by: ",s.id)
	})

	s.on('test', ()=>{
		console.log("\x1b[36m%s\x1b[0m","--> ", s.id, " has executed a test")
	})

	s.on('register', (regist_data) => {
		register(regist_data.admin, regist_data.cc, regist_data.nombre, regist_data.email, regist_data.password, regist_data.barrio);
		addUserData(regist_data.admin, regist_data.cc, regist_data.nombre, regist_data.email, regist_data.barrio);
		console.log("\x1b[32m%s\x1b[0m",'-------> nuevo usuario registrado: ', regist_data.nombre, " ", regist_data.cc);
	});

	s.on('login', (log_data) => {
		login(log_data.email, log_data.password, s);
		console.log("client ", s.id, " loged as ", log_data.email);
	});

	s.on('new_post', (post) => {
		addPost(post.descripcion, post.reto, post.titulo, post.src);
		console.log("nuevo post creado");
	});
	
	s.on('read', (c) => {
		const consulta = readData(c.child, c.field, c.sortby, c.exact);
		console.log("-->  new consult: ",consulta);
		s.emit('result',consulta);
	});

	s.on('write', (c) => {
		writeData(c.data, c.child);
		console.log('data added');
	});
});