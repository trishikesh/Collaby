// app.js
const socket = io();

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message !== '') {
        appendMessage(message, true); // Display sent message instantly
        socket.emit('chat message', message); // Send message to server
        messageInput.value = '';
    }
}

socket.on('chat message', function(data) {
    appendMessage(data.message, data.sent); // Display received message with sender info
});

function appendMessage(message, sent) {
    const chatBox = document.getElementById('chatBox');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (sent) {
        messageContainer.classList.add('sent');
    } else {
        messageContainer.classList.add('received');
    }
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageContainer.appendChild(messageText);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom
}
