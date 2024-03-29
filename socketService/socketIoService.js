
import User from "../models/user/user.model";
var Message = require('../models/message/message.model');
var MessageController = require('../controllers/message/messageController');

module.exports = {

    startChat: function (io) {  
        console.log('socket is on')
        
        var nsp = io.of('/edyouhub'); //namespace

        nsp.on('connection', async(socket) => { 
               nsp.emit('hi', 'Hello everyone!'); 
            var myId = socket.handshake.query.id
           
            var roomName = 'room-' + myId; 
            socket.join(roomName); 
            console.log('client ' + myId + ' connected.');

            var clients1 = nsp.allSockets()//old is nsp.clients();             
            socket.userId = myId; 
            console.log("socket: "+socket.userId);
            var clients=[];
            for (var id in clients1.connected) { 
                var userid= clients1.connected[id].userId;
                clients.push(userid);
            }
            
            var onlineData={
                id: myId,
                users : clients
            };
            if(myId && myId != 'null'){
                MessageController.getOnlineUsers(nsp,onlineData);
                await User.findByIdAndUpdate(myId, {lastSeen:Date.parse(new Date()),online:true}, { new: true });   
            }
           
            socket.on('newMessage', function (data) { 
                console.log(data);
                MessageController.addnewMessage(io,nsp,data);
            });
            socket.on('seen',function(data){
                data.myId = myId;
                console.log("in server in seeen")
                MessageController.updateSeenSocket(nsp,data);

            });
            socket.on('typing', function (data) { 
                var toRoom = 'room-' + data.toId;
                nsp.to(toRoom).emit('typing', data);
            });


            socket.on('stopTyping', function (data) {
                var toRoom = 'room-' + data.toId;
                nsp.to(toRoom).emit('stopTyping', data);
            });


            socket.on('online',function(){
                var check = true; 
                MessageController.changeStatus(socket,{id: myId},check);
                console.log('user is online')
            });

            socket.on('offline',function(){
                var check = false;
                MessageController.changeStatus(socket,{id: myId},check);
                console.log('user is offline')
            });
            
            socket.on('disconnect', async(reason) =>{
                var check = false;
                console.log(`socket ${socket.id} disconnected because: ${reason}`)
                MessageController.changeStatus(socket,{id: myId},check);
                nsp.emit('clientDisconnected',{id: myId})
            });

            
          
        });
    },
    startNotification : function(io){
        global.notificationNSP = io.of('/notification') ; 
        notificationNSP.on('connection',function(socket){
            var id = socket.handshake.query.id;
            var roomName = 'room-' + id;
            socket.join(roomName);
            console.log('client ' + id + ' connected on notification .');
        });
    }
}