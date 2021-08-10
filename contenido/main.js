var localStream;
var remoteStream = {};
var isRoomCreator;
var rtcPeerConnection = {};// Connection between the local device and the remote peer.
var room;
var numClientes = 0;


room = prompt("Enter room name:");
var socket = io(window.location.protocol + '//' +
window.location.host + '/', {
 path: '/gdie2104b/socket.io'
});
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                              Para crear salas con el Socket.IO
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
if (room !== '') {
  socket.emit('create or join', room);
}

socket.on('nuevoUsuario', function(mensaje) {
  console.log(mensaje);
});

socket.on('printID', function(id) {
  console.log('Hola cliente: ' + id);
});

socket.on('mensaje', function(mensaje) {
  console.log(mensaje);
});

socket.on('created', function(room) {
  created();
});

socket.on('joined', function (room){
  joined();
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                            RTC
//----------------------------------------------------------------------------------------------------------------------------------------------------------------

async function created(){
  await setLocalStream(mediaConstraints);
  isRoomCreator = true;
}

async function joined(){
  await setLocalStream(mediaConstraints);
  socket.emit('start_call', room, socket.id); //si te unes a una sala, inicias la conexión del rtc
}

const videoChatContainer = document.getElementById('video-chat-container');
const localVideoComponent = document.getElementById('localVideo');
//const remoteVideoComponent = document.getElementById('remoteVideo');

const mediaConstraints = {
  audio: true,
  video: { width: { exact: 300 }, height: { exact: 300 } }
}
/*
const iceServers = {
  iceServers:[{
    'urls': 'stun:stun.l.google.com:19302'
  }]
}*/
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}


async function setLocalStream(mediaConstraints) {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  } catch (error) {
    console.error('Could not get user media', error);
  }

  localStream = stream;
  localVideoComponent.srcObject = stream;
}

// SOCKET EVENT CALLBACKS =====================================================
socket.on('start_call', async (idUsNuevo) => {
  //numClientes++; //peticiones que le llegan a los que ya hay cuando se une alguien nuevo
  //let a = numClientes;
  console.log('Socket event callback: start_call')
  rtcPeerConnection[idUsNuevo] = new RTCPeerConnection(iceServers)
  addLocalTracks(rtcPeerConnection[idUsNuevo])
  rtcPeerConnection[idUsNuevo].ontrack = function(event){setRemoteStream(event,idUsNuevo)}
  rtcPeerConnection[idUsNuevo].onicecandidate = function(event){sendIceCandidate(event, idUsNuevo, socket.id)}
  //rtcPeerConnection[numClientes].onicecandidate = sendIceCandidate
  await createOffer(rtcPeerConnection[idUsNuevo], idUsNuevo, socket.id)
    
})

socket.on('webrtc_offer', async (event, idUsuario) => {
  //numClientes++; //peticiones que le llegan al nuevo de todos los que ya hay
  //let a = numClientes;
  console.log('Socket event callback: webrtc_offer')

    rtcPeerConnection[idUsuario] = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection[idUsuario])
    rtcPeerConnection[idUsuario].ontrack = function(event){setRemoteStream(event,idUsuario)}
    rtcPeerConnection[idUsuario].onicecandidate = function(event){sendIceCandidate(event,idUsuario, socket.id)}
    //rtcPeerConnection[numClientes].onicecandidate = sendIceCandidate
    rtcPeerConnection[idUsuario].setRemoteDescription(new RTCSessionDescription(event))
    await createAnswer(rtcPeerConnection[idUsuario], idUsuario, socket.id)
    
})

/*socket.on('start_call', async () => {
  console.log('Socket event callback: start_call')

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    await createOffer(rtcPeerConnection)
  }
})

socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    await createAnswer(rtcPeerConnection)
  }
})*/

socket.on('webrtc_answer', (event, otroUsuario) => {
  console.log('Socket event callback: webrtc_answer')

  rtcPeerConnection[otroUsuario].setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('webrtc_ice_candidate', (event, otroUsuario) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection[otroUsuario].addIceCandidate(candidate)
})

// FUNCTIONS ==================================================================
function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream)
  })
}

async function createOffer(rtcPeerConnection, idUsNuevo, idUsExistente) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription
  },
  idUsNuevo,
  idUsExistente)
}

async function createAnswer(rtcPeerConnection, idUsExistente, idUsNuevo) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription
  },
  idUsExistente,
  idUsNuevo)
}

function setRemoteStream(event,num) {

  if(event.track.kind == "video"){
    console.log(num);
    $("#video-chat-container").append("<div class='contCamara' id='contCamara"+num+"'></div>");
    $("#contCamara"+num).append("<video class='camaras' id='camara" + num + "' autoplay playsinline></video>");

    document.getElementById('camara'+num).srcObject = event.streams[0]
    remoteStream[num] = event.stream
  }
  
}

function sendIceCandidate(event, idUsuario, otroUsuario) {
  console.log("Estoy en la funcion sendIceCandidate()");
  if (event.candidate) {
    socket.emit('webrtc_ice_candidate', {
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    },idUsuario, room, otroUsuario)
  }
}