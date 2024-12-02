// Обработчик клика по кнопке поиска
document.querySelector('.search-button').addEventListener('click', async function () {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    const resultsContainer = document.querySelector('.search-results');

    if (query.startsWith('@') && query.length > 1) {
        const response = await fetch(`/search-users/?query=${encodeURIComponent(query)}`);
        if (response.ok) {
            const html = await response.text();
            resultsContainer.innerHTML = html;
        } else {
            console.error('Failed to fetch search results');
        }
    } else {
        resultsContainer.innerHTML = '<p>Enter a valid username</p>';
    }
});

// Обработчик клика на пользователя в результатах поиска
document.querySelector('.search-results').addEventListener('click', async function (event) {
    const userBlock = event.target.closest('.user-block');
    if (userBlock) {
        const username = userBlock.dataset.username;
        const chatContainer = document.querySelector('.chat-container');

        const response = await fetch(`/chat/${username}/`);
        if (response.ok) {
            const html = await response.text();
            chatContainer.innerHTML = html;
        } else {
            console.error('Failed to load chat');
        }
    }
});
