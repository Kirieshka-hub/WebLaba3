document.getElementById('clearChatButton').addEventListener('click', function() {
    const receiverUsername = document.getElementById('user-displayname').textContent;

    fetch(`/clear_chat/${receiverUsername}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Удаляем пользователя из навбара
            loadActiveChats();
            // Скрываем окно чата
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('user-info').style.display = 'none';
            document.getElementById('empty-chat-window').style.display = 'block';
        }
    })
    .catch(error => console.error('Ошибка при очистке чата:', error));
});
