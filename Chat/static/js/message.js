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
                    <div style="display: flex; justify-content: center; align-items: center; ">
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

// Обработчик для поиска пользователей
document.querySelector('.search-button').addEventListener('click', function () {
    const input = document.querySelector('.search-input').value.trim();
    const searchHead = document.getElementById('search-head'); // Заголовок "Search"
    const searchRes = document.getElementById('search-res'); // Контейнер результатов поиска
    const resultsContainer = document.querySelector('.search-results'); // Контейнер для списка результатов

    resultsContainer.innerHTML = ''; // Очищаем предыдущие результаты

    if (!input) {
        // Если поле ввода пустое, скрываем элементы
        searchHead.style.display = 'none';
        searchRes.style.display = 'none';
        return;
    }

    // Показываем элементы, если есть текст в поле
    searchHead.style.display = 'block';
    searchRes.style.display = 'block';

    fetch(`/search_users?query=${input}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) {
                resultsContainer.innerHTML = '<p>No users found</p>';
            } else {
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
            resultsContainer.innerHTML = '<p>Ошибка при поиске пользователя</p>';
        });
});

// Функция для добавления пользователя в навбар
function addToNavbar(user) {
    const chatUsersContainer = document.getElementById('chat-users');
    if (!Array.from(chatUsersContainer.children).some(li => li.textContent.trim() === user.displayname)) {
        const userLi = document.createElement('li');
        userLi.innerHTML = `
            <div>
                <img src="${user.avatar}" class="avatar" alt="Avatar">
                <div>${user.displayname}</div>
            </div>
        `;
        userLi.addEventListener('click', () => loadChat(user.username));
        chatUsersContainer.appendChild(userLi);
    }
}

function loadChat(username) {
    if (!username) {
        console.error('Имя пользователя не передано!');
        return;
    }

    fetch(`/chat/${username}/`)
        .then(response => response.json())
        .then(data => {
            const userProfileLink = document.getElementById('user-profile-link');
            const userAvatar = document.getElementById('user-avatar');
            const userDisplayname = document.getElementById('user-displayname');
            const chatMessagesContainer = document.getElementById('chat-messages');
            const messageForm = document.getElementById('messageForm');

            if (!userProfileLink || !userAvatar || !userDisplayname || !chatMessagesContainer || !messageForm) {
                console.error('Один или несколько элементов не найдены в DOM');
                return;
            }

            // Обновляем информацию о пользователе
            userProfileLink.href = `/messanger/@${username}/`;
            userAvatar.src = data.avatar;
            userDisplayname.textContent = data.displayname;
            userDisplayname.href = `/messanger/@${username}/`;

            document.getElementById('user-info').style.display = 'flex';
            document.getElementById('empty-chat-window').style.display = 'none';
            chatMessagesContainer.style.display = 'flex';
            messageForm.style.display = 'flex';

            chatMessagesContainer.innerHTML = ''; // Очищаем старые сообщения

            // Добавляем сообщения
            data.messages.forEach(message => {
                const messageDiv = document.createElement('div');

                messageDiv.classList.add('message');
                if (message.sender === data.current_user) {
                    messageDiv.classList.add('my-message');
                    messageDiv.innerHTML = `
                        <span class="sender">Вы:</span>
                        <span class="message-content">${message.message}</span>
                    `;
                } else {
                    messageDiv.classList.add('received-message');
                    messageDiv.innerHTML = `
                        <span class="sender">${message.sender}:</span>
                        <span class="message-content">${message.message}</span>
                    `;
                }

                chatMessagesContainer.appendChild(messageDiv);
            });

            // Прокрутка к последнему сообщению
            scrollToLastMessage(chatMessagesContainer);
        })
        .catch(error => console.error('Ошибка при загрузке чата:', error));
}

// Функция для прокрутки к последнему сообщению
function scrollToLastMessage(container) {
    container.scrollTop = container.scrollHeight; // Устанавливаем scrollTop в максимальное значение
}



// Функция для скрытия правой панели
function resetChatUI() {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('chat-messages').style.display = 'none';
    document.getElementById('messageForm').style.display = 'none';
    document.getElementById('empty-chat-window').style.display = 'flex';
}

// Устанавливаем начальное состояние
document.addEventListener('DOMContentLoaded', () => {
    resetChatUI();
    loadActiveChats();
});function updateActiveChat() {
    // Получаем активного пользователя
    const activeUsername = document.getElementById('user-displayname')?.textContent;
    const chatMessagesContainer = document.getElementById('chat-messages');

    if (activeUsername && chatMessagesContainer.style.display !== 'none') {
        // Отправляем запрос для обновления сообщений
        fetch(`/chat/${activeUsername}/`)
            .then(response => response.json())
            .then(data => {
                if (!data.messages) return;

                // Очищаем и обновляем сообщения
                chatMessagesContainer.innerHTML = '';
                data.messages.forEach(message => {
                    const messageDiv = document.createElement('div');

                    messageDiv.classList.add('message');
                    if (message.sender === data.current_user) {
                        messageDiv.classList.add('my-message');
                        messageDiv.innerHTML = `
                            <span class="sender">Вы:</span>
                            <span class="message-content">${message.message}</span>
                        `;
                    } else {
                        messageDiv.classList.add('received-message');
                        messageDiv.innerHTML = `
                            <span class="sender">${message.sender}:</span>
                            <span class="message-content">${message.message}</span>
                        `;
                    }

                    chatMessagesContainer.appendChild(messageDiv);
                });

                // Прокрутка к последнему сообщению
                scrollToLastMessage(chatMessagesContainer);
            })
            .catch(error => console.error('Ошибка при обновлении чата:', error));
    }
}

// Периодическое обновление активного чата
setInterval(updateActiveChat, 5000); // Обновление каждые 5 секунд


// Функция для отправки сообщения
document.getElementById('sendMessageButton').addEventListener('click', function () {
    const messageInput = document.getElementById('messageInput');
    const messageContent = messageInput.value;
    const receiverUsername = document.getElementById('user-displayname').textContent;
    const chatMessagesContainer = document.getElementById('chat-messages');

    if (messageContent) {
        fetch('/send_message/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
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
                const newMessageDiv = document.createElement('div');
                newMessageDiv.classList.add('message', 'my-message');
                newMessageDiv.innerHTML = `
                    <span class="sender">Вы:</span>
                    <span class="message-content">${messageContent}</span>
                `;
                chatMessagesContainer.appendChild(newMessageDiv);

                // Прокручиваем чат к последнему сообщению
                scrollToLastMessage(chatMessagesContainer);

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
            const chatMessagesContainer = document.getElementById('chat-messages');
            chatMessagesContainer.innerHTML = '';
            resetChatUI();
        } else {
            console.error('Ошибка при очистке чата:', data.error);
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

// Периодическое обновление активных чатов
setInterval(() => {
    loadActiveChats();
}, 5000);


