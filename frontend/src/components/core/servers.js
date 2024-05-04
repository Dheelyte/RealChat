const express = require("express")  
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server,{

   cors: {
    origin: "http://localhost:3000/",
    methods: [ "GET", "POST"]
   }


})

// this is to run the server

// first thing is to create the connection with the web socket here

// this is for the on part of the socket connection and it takes two arguments, one is the status and the other is the function of socket
// that indicates the socket taht is emitted as the sender
io.on("connection", (socket)=>{

    // this is the socket for the caller 
    socket.emit('me', socket.id)

    // this is to ensure that the code can be broken at times
    socket.on("disconnect", ()=>{
        socket.broadcast.emit("callEnded")
    })

    // this is the logic for ensuring the call meets a particular id when connecting

    socket.on("callUser", (data)=>{
        // this has something taht links with the front end here i.e the userToCall
        io.to(data.userToCall).emit("callUser", {signal : data.signalData, from: data.from, name:data.name})
    })

    // for the actual answering of the call

    socket.on("answerCall", (data)=>
    io.to(data.to).emit("callAccepted"), data.signal)
    

})

server.listen(5000, ()=> console.log('server is running on th reel chat'))
 