document.addEventListener('DOMContentLoaded', function () {
    const sendMessageButton = document.getElementById('sendMessageButton');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.querySelector('.chat-messages'); // Изменено на querySelector

    sendMessageButton.addEventListener('click', function() {
        const messageText = messageInput.value.trim();

        if (messageText) {
            addMessageToChat('Вы', messageText); // Добавляем сообщение в чат
            messageInput.value = ''; // Очищаем поле ввода
        }
    });

    function addMessageToChat(sender, message) {
        if (!chatMessages) {
            console.error("Chat messages container not found.");
            return; // Выход, если контейнер сообщений не найден
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        
        chatMessages.appendChild(messageElement);
        
        // Прокручиваем вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});