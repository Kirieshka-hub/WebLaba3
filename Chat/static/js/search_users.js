document.querySelector('.search-button').addEventListener('click', function() {
    console.log('Кнопка поиска нажата'); // Отладочное сообщение
    const input = document.querySelector('.search-input').value;
    if (input.startsWith('@')) {
        const username = input.substring(1); // Убираем '@' из запроса
        console.log(`Ищем пользователя: ${username}`); // Отладочное сообщение
        fetch(`/search_users?query=${username}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Ответ сервера получен:', response); // Отладочное сообщение
            return response.json();
        })
        .then(data => {
            console.log('Данные от сервера:', data); // Отладочное сообщение
            const resultsContainer = document.querySelector('.search-results');
            resultsContainer.innerHTML = ''; // Очищаем предыдущие результаты
            data.results.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `<img src="${user.avatar}" class="avatar"> ${user.displayname}`;
                userDiv.addEventListener('click', () => loadChat(user.username));
                resultsContainer.appendChild(userDiv);
            });
        })
        .catch(error => console.error('Ошибка:', error)); // Обработка ошибок
    }
});

//выше вывод пользователя тYт появление  его в контейнере
function loadChat(username) {
    // Получаем информацию о пользователе и сообщения
    fetch(`/chat/${username}/`)
        .then(response => response.json())
        .then(data => {
            // Обновляем информацию о пользователе
            document.getElementById('user-profile-link').href = `/${username}/`; // Ссылка на профиль
            document.getElementById('user-avatar').src = data.avatar;
            document.getElementById('user-displayname').textContent = data.displayname;

            // Отображаем информацию о пользователе и скрываем пустое окно чата
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('empty-chat-window').style.display = 'none';

            // Загружаем сообщения
            const chatMessagesContainer = document.getElementById('chat-messages');
            chatMessagesContainer.innerHTML = ''; // Очищаем предыдущие сообщения
            data.messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = `${message.sender}: ${message.message}`;
                chatMessagesContainer.appendChild(messageDiv);
            });

            // Показываем контейнер для ввода сообщений
            document.getElementById('message-input-container').style.display = 'block';
        })
        .catch(error => console.error('Ошибка:', error));
}

// Пример вызова функции loadChat при выборе пользователя из результатов поиска
document.querySelectorAll('.search-results div').forEach(userDiv => {
    userDiv.addEventListener('click', () => {
        const username = userDiv.querySelector('.username-msg').textContent; // Получаем имя пользователя
        loadChat(username); // Загружаем чат с этим пользователем
    });
});

// навбар
function loadChatUsers() {
    fetch('/chat_users/')
        .then(response => response.json())
        .then(data => {
            const chatUsersContainer = document.getElementById('chat-users');
            chatUsersContainer.innerHTML = ''; // Очищаем предыдущие результаты
            
            data.results.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `<img src="${user.avatar}" class="avatar"> ${user.displayname}`;
                userDiv.addEventListener('click', () => loadChat(user.username)); // Загрузка чата с этим пользователем
                chatUsersContainer.appendChild(userDiv);
            });
        })
        .catch(error => console.error('Ошибка при загрузке пользователей чата:', error));
}

// Вызов функции при загрузке страницы
document.addEventListener('DOMContentLoaded', loadChatUsers);