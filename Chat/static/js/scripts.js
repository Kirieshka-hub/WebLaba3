// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Пример обработки сообщений
    const messages = document.querySelectorAll('.alert');
    
    messages.forEach(message => {
        let showMessage = true;

        setTimeout(() => {
            if (showMessage) {
                message.style.display = 'none';
                showMessage = false;
            }
        }, 6000); // Скрыть сообщение через 6 секунд

        message.querySelector('.close-button').addEventListener('click', () => {
            message.style.display = 'none';
            showMessage = false;
        });
    });

});