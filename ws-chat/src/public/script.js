$(document).ready(function() {
    let ws;
    let username;

    $('#loginForm').submit(function(event) {
        event.preventDefault();
        
        username = $('#username').val().trim();
        if (username === "") {
            alert('Username cannot be empty!');
            return;
        }

        ws = new WebSocket('ws://localhost:8000');
        
        ws.onopen = function() {
            console.log('Connected to websocket server'); 
        };
        
        $('#loginModal').hide();
    });
});
