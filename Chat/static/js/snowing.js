// scripts.js
document.addEventListener('DOMContentLoaded', function() {
    
    // Создаем снежинки
    for (let i = 0; i < 100; i++) {
        const snowflake = document.createElement('div');
        
       // Задаем класс снежинки
       snowflake.className = 'snowflake';
       
       // Случайное положение по горизонтали
       snowflake.style.left = Math.random() * window.innerWidth + 'px'; 
       
       // Случайная скорость падения
       snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; 
       
       // Случайная прозрачность
       snowflake.style.opacity = Math.random(); 
       
       document.body.appendChild(snowflake);
       
       // Удаляем снежинку после завершения анимации
       snowflake.addEventListener('animationend', () => {
           snowflake.remove();
       });
       
       // Запускаем анимацию
       setTimeout(() => {
           snowflake.style.animationName = 'falling-snow';
       }, Math.random() * 1000);
   }
});