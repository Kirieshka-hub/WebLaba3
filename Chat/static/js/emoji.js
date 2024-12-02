document.addEventListener('DOMContentLoaded', function () {
    const sendMessageButton = document.getElementById('sendMessageButton');
    const messageInput = document.getElementById('messageInput');
    const emojiButton = document.getElementById('emojiButton');

    // Инициализация Emoji Button с пользовательскими стилями
    const picker = new EmojiButton({
        styleProperties: {
            '--font': 'Arial, sans-serif', // Шрифт для эмодзи
            '--background-color': '#ffffff', // Цвет фона окна выбора
            '--category-button-color': '#007BFF', // Цвет кнопок категорий
            '--category-button-hover-color': '#0056b3', // Цвет кнопок категорий при наведении
            '--emoji-size': '1.5em', // Размер эмодзи
        }
    });

    emojiButton.addEventListener('click', () => {
        picker.togglePicker(emojiButton); // Открыть/закрыть выбор эмодзи
    });

    picker.on('emoji', emoji => {
        messageInput.value += emoji; // Вставляем выбранный эмодзи в поле ввода
        autoResize(); // Обновляем высоту поля ввода
    });

    function autoResize() {
        this.style.height = 'auto'; // Сбрасываем высоту
        this.style.height = (this.scrollHeight) + 'px'; // Устанавливаем новую высоту
    }
});