$(document).ready(function() {
    let ws;
    let username;
    let selectedUser;

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
            ws.send(JSON.stringify({ 
                type: 'login', 
                username: username 
            }));
        };

        ws.onmessage = function(event) {
            let data = JSON.parse(event.data);

            switch(data.type) {
                case 'success':
                    if (data.message === 'Logged in successfully') {
                        $('#loginModal').hide();
                        $('#currentUser').text('Logged in as: ' + username);
                    }
                    break;
                case 'error':
                    if (data.message === 'Username already taken') {
                        alert('Username already taken');
                    }
                    break;
                case 'userList':
                    data.users.forEach(user => {
                        if (user !== username) {
                            $('#users').append('<div class="user" data-username="' + user + '">' + user + '</div>');
                        }
                    });

                    $('.user').click(function() {
                        $('.user').removeClass('selected');
                        $(this).addClass('selected');
                        selectedUser = $(this).data('username');

                        loadChatHistory();
                    });
                    break;
                case 'userLogin':
                    $('#users').append('<div class="user" data-username="' + data.username + '">' + data.username + '</div>');

                    $('.user').off('click').click(function() {
                        $('.user').removeClass('selected');
                        $(this).addClass('selected');
                        selectedUser = $(this).data('username');
                        
                        loadChatHistory();
                    });
                    break;
                case 'userLogout':
                    if (data.username === selectedUser) {
                        selectedUser = null;
                        $('#messages').empty();
                    }
                    $('#users .user').filter(function() {
                        return $(this).data('username') === data.username;
                    }).remove();
                    break;
                case 'message':
                    if (data.from === selectedUser) {
                        $('#messages').append('<div><strong>' + data.from + ':</strong> ' + data.text + '</div>');
                    }
                    break;
            }
        }
    });

    $('#messageForm').submit(function(event) {
        event.preventDefault();

        if(!selectedUser) {
            alert('Please select user to message.');
            return;
        }

        let message = $('#messageInput').val();
        ws.send(JSON.stringify({ 
            type: 'message', 
            to: selectedUser,
            from: username, 
            text: message 
        }));
        $('#messages').append('<div><strong>' + username + ':</strong> ' + message + '</div>');
        $('#messageInput').val('');
    });

    function loadChatHistory() {
        $('#messages').empty();
        $.get('/chat-history', { username: username, target: selectedUser }, function(data) {
            data.messages.forEach(message => {
                $('#messages').append('<div><strong>' + message.from + ':</strong> ' + message.text + '</div>');
            });
        });        
    }
});
