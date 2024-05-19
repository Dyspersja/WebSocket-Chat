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

                        $('#messages').empty();
                    });
                    break;
                case 'userLogin':
                    // TODO: Finish
                    break;
                case 'userLogout':
                    // TODO: Finish
                    break;
                case 'message':
                    // TODO: Finish
                    break;
            }
        }
    });

    $('#messageForm').submit(function(event) {
        event.preventDefault();
        $('#messageInput').val('');
    });
});
