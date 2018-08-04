const socket = io();

function scrollToBottom() {
    // Selectors
    let chatMessages = $('.chat-messages');
    let messages = $('#messages');
    let newMessage = messages.children('li:last-child');

    // Heights
    let scrollTop = chatMessages.prop('scrollTop');
    let clientHeight = chatMessages.prop('clientHeight');
    let scrollHeight = chatMessages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if(scrollTop + clientHeight + lastMessageHeight + newMessageHeight >= scrollHeight) {
        chatMessages.scrollTop(scrollHeight);
    }
}

socket.on('connect', () => {
    let params = $.deparam(window.location.search);
    socket.emit('join', params, err => {
        if(err) {
            alert(err);
            window.location.href = '/';
        }
    });
});

socket.on('newMessage', message => {
    let formattedDate = moment(message.createdAt).format('h:mm A');
    let template = $('#message-template').html();
    let rendered = Mustache.render(template, {
        from: message.from,
        createdAt: formattedDate,
        text: message.text
    });

    $('#messages').append(rendered);
    scrollToBottom();
});

socket.on('newLocationMessage', message => {
    let formattedDate = moment(message.createdAt).format('h:mm A');
    let template = $('#location-template').html();
    let rendered = Mustache.render(template, {
        from: message.from,
        createdAt: formattedDate,
        url: message.url
    });

    $('#messages').append(rendered);
    scrollToBottom();
});

socket.on('updateUsersList', users => {
    let ul = $('<ul></ul>');

    users.forEach(user => {
        ul.append($('<li></li>').text(user));
    });

    $('#users').html(ul);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

$('#message-form').on('submit', e => {
    e.preventDefault();
    let messageTextbox = $('[name=message]');

    socket.emit('createMessage', {
        'text': messageTextbox.val()
    }, () => {
        messageTextbox.val('');
    });
});

let locationButton = $('#send-location');
locationButton.on('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by you browser');
    }

    locationButton.css({'background-color': '#53486d' , 'color': '#fff'});
    locationButton.attr('disabled', 'disabled').text('Sending...');

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('createLocationMessage', {
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        });

        locationButton.css({'background-color': '#e7e7e7' , 'color': '#2e2346'});
        locationButton.removeAttr('disabled').text('Send Location');        
    }, () => {
        locationButton.css({'background-color': '#e7e7e7' , 'color': '#2e2346'});
        locationButton.removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location');
    });
});