const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const port = 8000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(port, function() {
    console.log(`Server is listening on port: ${port}`);
});