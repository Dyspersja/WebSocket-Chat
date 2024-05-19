const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const port = 8000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = new Map();

wss.on('connection', ws => {
    console.log('new user connected');
    
    ws.on('message', message => {
        console.log('message: ' + message);
        let parsedMessage = JSON.parse(message);

        switch(parsedMessage.type) {
            case 'login' :
                if(isUsernameTaken(parsedMessage.username)) {
                    ws.send(JSON.stringify({ 
                        type: 'error', 
                        message: 'Username already taken' 
                    }));
                } else {
                    ws.send(JSON.stringify({ 
                        type: 'success', 
                        message: 'Logged in successfully' 
                    }));

                    let userList = Array.from(users.values());

                    ws.send(JSON.stringify({
                        type: 'userList',
                        users: userList
                    }));

                    users.forEach((username, ws) => {
                        ws.send(JSON.stringify({
                            type: 'userLogin',
                            user: parsedMessage.username
                        }));
                    });

                    users.set(ws, parsedMessage.username);  
                    console.log('user logged in: ' + parsedMessage.username);
                }
                break;
        }
    });
    
    ws.on('close', () => {
        let user = users.get(ws);

        users.delete(ws);
        users.forEach((username, ws) => {
            ws.send(JSON.stringify({
                type: 'userLogout',
                user: user
            }));
        });        
        console.log('user disconnected: ' + user);
    });
});

function isUsernameTaken(username) {
    for (let user of users.values()) {
        if(user === username) {
            return true;
        }
    }
    return false;
}

server.listen(port, function() {
    console.log(`Server is listening on port: ${port}`);
});