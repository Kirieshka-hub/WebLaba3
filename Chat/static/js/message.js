// Функция для загрузки активных чатов из базы данных
function loadActiveChats() {
    fetch('/active_chats/')
        .then(response => response.json())
        .then(data => {
            const chatUsersContainer = document.getElementById('chat-users');
            chatUsersContainer.innerHTML = ''; // Очищаем контейнер

            data.results.forEach(user => {
                const userLi = document.createElement('li');
                userLi.innerHTML = `
                    <div>
                        <img src="${user.avatar}" class="avatar" alt="Avatar">
                        <span>${user.displayname}</span>
                    </div>
                `;
                userLi.addEventListener('click', () => loadChat(user.username)); // Подгружаем чат
                chatUsersContainer.appendChild(userLi);
            });
        })
        .catch(error => console.error('Ошибка при загрузке активных чатов:', error));
}

// Функция для поиска пользователей
// Функция для поиска пользователей
document.querySelector('.search-button').addEventListener('click', function () {
    const input = document.querySelector('.search-input').value.trim(); // Получаем значение из поля ввода

    const resultsContainer = document.querySelector('.search-results'); // Контейнер для результатов поиска
    resultsContainer.innerHTML = ''; // Очищаем предыдущие результаты

    if (!input) {
        // Если поле пустое, показываем сообщение "No users found"
        resultsContainer.innerHTML = '<p>No users found</p>';
        return;
    }

    fetch(`/search_users?query=${input}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.results.length === 0) {
            // Если результатов нет, показываем сообщение "No users found"
            resultsContainer.innerHTML = '<p>No users found</p>';
        } else {
            // Если есть результаты, отображаем их
            data.results.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `
                    <img src="${user.avatar}" class="avatar" alt="Avatar">
                    <span>${user.displayname}</span>
                `;
                userDiv.addEventListener('click', () => {
                    loadChat(user.username); // Загружаем чат при клике
                });
                resultsContainer.appendChild(userDiv);
            });
        }
    })
    .catch(error => {
        console.error('Ошибка при поиске пользователя:', error);
        resultsContainer.innerHTML = '<p>Ошибка при поиске пользователя</p>'; // Показываем сообщение об ошибке
    });
});


// Функция для добавления пользователя в навбар
function addToNavbar(user) {
    const chatUsersContainer = document.getElementById('chat-users');
    // Проверяем, не добавлен ли пользователь уже
    if (!Array.from(chatUsersContainer.children).some(li => li.textContent.trim() === user.displayname)) {
        const userLi = document.createElement('li');
        userLi.innerHTML = `
            <div>
                <img src="${user.avatar}" class="avatar" alt="Avatar">
                <span>${user.displayname}</span>
            </div>
        `;
        userLi.addEventListener('click', () => loadChat(user.username));
        chatUsersContainer.appendChild(userLi);
    }
}

// Функция для загрузки чата с пользователем
function loadChat(username) {
    if (!username) {
        console.error('Имя пользователя не передано!');
        return;
    }

    fetch(`/chat/${username}/`)
        .then(response => response.json())
        .then(data => {
            // Обновляем информацию о пользователе
            document.getElementById('user-profile-link').href = `/${username}/`; // Ссылка на профиль
            document.getElementById('user-avatar').src = data.avatar;
            document.getElementById('user-displayname').textContent = data.displayname;

            // Отображаем информацию о пользователе и скрываем пустое окно чата
            // document.getElementById('user-info').style.display = 'flex';
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
            // document.getElementById('messageForm').style.display = 'flex';
        })
        .catch(error => console.error('Ошибка:', error));
}

// Функция для отправки сообщения
document.getElementById('sendMessageButton').addEventListener('click', function () {
    const messageInput = document.getElementById('messageInput');
    const messageContent = messageInput.value;
    const receiverUsername = document.getElementById('user-displayname').textContent;

    // Проверяем, что поле не пустое
    if (messageContent) {
        fetch('/send_message/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // Получите CSRF-токен
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiver: receiverUsername,
                message: messageContent,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const chatMessagesContainer = document.getElementById('chat-messages');
                const newMessageDiv = document.createElement('div');
                newMessageDiv.textContent = `Вы: ${messageContent}`; // Отображаем "Вы" для своих сообщений
                chatMessagesContainer.appendChild(newMessageDiv);
                messageInput.value = ''; // Очищаем поле ввода
            } else {
                console.error('Ошибка при отправке сообщения:', data.error);
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }
});

// Функция для очистки чата
document.getElementById('clearChatButton').addEventListener('click', function () {
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
            // Удаляем пользователя из локального навбара
            const chatUsersContainer = document.getElementById('chat-users');
            Array.from(chatUsersContainer.children).forEach(li => {
                if (li.textContent.trim() === receiverUsername) {
                    li.remove();
                }
            });

            // Скрываем окно чата
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('user-info').style.display = 'none';
            document.getElementById('empty-chat-window').style.display = 'block';
        }
    })
    .catch(error => console.error('Ошибка при очистке чата:', error));
});

// Функция для получения CSRF-токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Периодическое обновление навбара каждые 5 секунд
setInterval(() => {
    fetch('/active_chats/')
        .then(response => response.json())
        .then(data => {
            const chatUsersContainer = document.getElementById('chat-users');
            chatUsersContainer.innerHTML = ''; // Очищаем контейнер перед обновлением

            data.results.forEach(user => {
                const userLi = document.createElement('li');
                userLi.innerHTML = `
                    <div>
                        <img src="${user.avatar}" class="avatar" alt="Avatar">
                        <span>${user.displayname}</span>
                    </div>
                `;
                userLi.addEventListener('click', () => loadChat(user.username)); // Подгружаем чат
                chatUsersContainer.appendChild(userLi);
            });
        })
        .catch(error => console.error('Ошибка при обновлении навбара:', error));
}, 5000); // Обновление каждые 5 секунд

// Запуск загрузки активных чатов при загрузке страницы
document.addEventListener('DOMContentLoaded', loadActiveChats);
