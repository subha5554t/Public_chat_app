const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const path = require('path');
const port = 3000;
const mongoose = require("mongoose");
const userRoute = require('./routes/user');
const User = require("./models/user");
const bodyParser = require('body-parser');
const io =socketio(server);



mongoose.connect('mongodb://127.0.0.1:27017/auth')
.then(()=> console.log("MongoDb connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async(req,res)=>{
    return res.render('home');
});


io.on('connection', (socket) => {
  console.log('new user connected');

  socket.on('joining msg', (name) => {
      console.log(name + ' has joined the chat');
      socket.name = name; 
      io.emit('user joined', name);
  });

  socket.on('disconnect', () => {
      const name = socket.name; 
      console.log(name + ' user disconnected');
      io.emit('user left', name);
  });

  socket.on('chat message', (msg) => {
      socket.broadcast.emit('chat message', msg);
  });

  socket.on('join room', ({ roomId, name }) => {
    socket.join(roomId);
    console.log(name + ' has joined the chat');
    socket.uname = name;
    io.to(roomId).emit('join room', name); // Emitting to everyone in the room
});

socket.on('disconnect', () => {
    const name = socket.uname;
    if(name!=null){
        console.log(name + ' user disconnected');
        io.emit('leave room', name);
    } 
});

socket.on('private message', ({ roomId, msg }) => {
    socket.broadcast.to(roomId).emit('private message', msg);
});



});

app.use("/user", userRoute);



server.listen(port,()=> console.log(`server started at: ${port}`))

