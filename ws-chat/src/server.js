const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const port = 8000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to store connected users and their websockets connections
let users = new Map();
// Structure for storing all user chats in memory
let chatHistory = {};

wss.on('connection', ws => {
    console.log('new user connected');
    
    ws.on('message', message => {
        console.log('message: ' + message);
        let parsedMessage = JSON.parse(message);

        switch(parsedMessage.type) {
            case 'login' :
                if(isUsernameTaken(parsedMessage.username)) {
                    // Send error message if username is taken
                    ws.send(JSON.stringify({ 
                        type: 'error', 
                        message: 'Username already taken' 
                    }));
                } else {
                    // Send success message if login is successful
                    ws.send(JSON.stringify({ 
                        type: 'success', 
                        message: 'Logged in successfully' 
                    }));

                    // Prepare and send list of current users to the new user
                    let userList = Array.from(users.values());

                    ws.send(JSON.stringify({
                        type: 'userList',
                        users: userList
                    }));

                    // Notify all users about new user login
                    users.forEach((username, ws) => {
                        ws.send(JSON.stringify({
                            type: 'userLogin',
                            user: parsedMessage.username
                        }));
                    });

                    // Add new user to the users map
                    users.set(ws, parsedMessage.username);  
                    console.log('user logged in: ' + parsedMessage.username);
                }
                break;
            case 'message' :
                console.log('message content: ' + parsedMessage.text);

                // Retrieve values from parsed message
                let to = parsedMessage.to;
                let from = parsedMessage.from;
                let text = parsedMessage.text;

                // Store new message in chatHistory
                if (!chatHistory[from]) {
                    chatHistory[from] = {};
                }
                if (!chatHistory[to]) {
                    chatHistory[to] = {};
                }
            
                if (!chatHistory[from][to]) {
                    chatHistory[from][to] = [];
                }
                if (!chatHistory[to][from]) {
                    chatHistory[to][from] = [];
                }
            
                const message = { from, text };
                chatHistory[from][to].push(message);
                chatHistory[to][from].push(message);

                // Find connection to the message receiver and send the message
                for (let [ws, username] of users) {
                    if (username === to) {
                        ws.send(JSON.stringify({ 
                            type: 'message', 
                            from: from, 
                            text: text 
                        }));
                        break;
                    }
                }
                break;
        }
    });
    
    ws.on('close', () => {
        let user = users.get(ws);

        // Remove user from the users map
        users.delete(ws);

        // Notify all users about the user logout
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