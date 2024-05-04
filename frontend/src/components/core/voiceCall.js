
import React, {uuseRef, useState, useEffect, useRef } from 'react';
import io from "socket.io-client" 
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Peer from 'simple-peer'


  // we are creating our socket connection
  // we pass the socket then we pass in the route we want 
const socket = io.connect("http://localhost:3000/")
function CallerConfig(){
   
    // we need to pass in a number of states here 
    const [me, setMe] = useState("")
    const [stream, setStream] = useState()
    const [receivingCall , setReceivingCall] = useState(false)
    const [caller , setCaller] = useState("")
    const [callerSignal , setCallerSignal] = useState()
    const [callAccepted,setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name , setName] = useState("")  

    // we have a couple of things to reference
    // Enable us to reference our video
    const myVideo = useRef()
    // to reference the other person video
    const userVideo = useRef()
    // then for the connection
    const connectionRef = useRef()

// to be able to have access to the webCam
// the key value is the video
// what this code indicates is that when navigator and MediaDevices return as true 

    useEffect(()=>{
   navigator.mediaDevices.getUserMedia({video: true, audio: true}),then ((stream)=>{
    setStream(stream)
    // to set the stream to the current video coming in
    myVideo.current.srcObject = stream
   })

//    this is the logic to receieve  the id

   socket.on('me' ,(id)=>{
    setMe(id)
   })


//    this is the logic for the user 
socket.on("callUser", (data)=>{
    setReceivingCall(true)
    setCaller(data.from)
    setName(data.name)
    setCallerSignal(data.signal)
})


    },[])

    // this code isto be able to call the user
//    this is where we are going to create a new pair
const callUser = (id) =>{
  const peer = new Peer({
    initiator :true,
    trickle: false,
    stream : stream
  })

  peer.on("signal", (data)=>{
    socket.emit("callUser",{
      userToCall : id ,
      signalData : data,
      from : me,
      name :name  
    })
  })

  peer.on("stream", (stream)=>{
    // set the stream to the current Video 
    userVideo.current.srcObject = stream
  })

//   the call accepeted socket
   socket.on("callAccepted", (signal)=>{
    setCallAccepted(true)
    peer.signal(signal)
   })

//    to dsiable the call

connectionRef.current = peer
}


// this is iwhat asnwers the call eventually
  const answerCall = () =>{
    setCallAccepted(true)
    const peer= new Peer({
        initiator :false,
        trickle : false,
        stream : stream
    })
// on the answer signal we want to pass the signal and the data
    peer.on("signal",(data)=>{
        socket.emit("answerCall", {signal : data, to: caller})
    })
// we want to be able to leave the call whne we want 
  }

//   we want to be able to leave the call when we want

const leaveCall = () =>{
    setCallEnded(true)
connectionRef.current.destroy()
}


    return(
        <div className='voiceCall'>

        </div>
    )
}

export default  CallerConfig