const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(express.static('/root/public'));

server.listen(8080);
var io = require('socket.io')(server);
io.on('connection', function(socket) {


  socket.on('create or join', function(room) {
    const clients = io.sockets.adapter.rooms.get(room);
    const clientesSala = clients ? clients.size : 0;
    if (clientesSala == 0) {
      socket.join(room);
      socket.emit('mensaje','Has creado la sala: ' + room);
      socket.emit('created', room, socket.id);
      socket.emit('printID', socket.id);
    } else if (clientesSala > 0 && clientesSala <= 8) {
      socket.join(room);
      socket.emit('mensaje','Te has unido a la sala: ' + room);
      socket.emit('joined', room, socket.id);
      socket.to(room).emit('nuevoUsuario', "Se ha unido un usuario nuevo");
      socket.emit('printID', socket.id);
    } else { // max 8 clientes
      socket.emit('mensaje', 'La sala a la que intentas unirte está completa');
    }
  });

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on('start_call', async(roomId, idUsNuevo) => {
    socket.broadcast.to(roomId).emit('start_call', idUsNuevo)
  });
  socket.on('webrtc_offer', async(event, idUsNuevo, idUsExistente) => {
    socket.to(idUsNuevo).emit('webrtc_offer', event.sdp, idUsExistente)
  });
  socket.on('webrtc_answer', async(event, idUsExistente, idUsNuevo) => {
    socket.to(idUsExistente).emit('webrtc_answer', event.sdp, idUsNuevo)
  });
  socket.on('webrtc_ice_candidate', async(event, idUsuario, roomId, otroUsuario) => {
    socket.to(idUsuario).emit('webrtc_ice_candidate', event,otroUsuario)
  });


});