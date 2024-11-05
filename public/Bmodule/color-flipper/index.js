const background = document.querySelector('.container');
const colorText = document.querySelector('.color');
const btn = document.querySelector('button');
const colors = ['red', 'orange', 'yellow', 'lime', 'skyblue', 'aquamarine', 'coral', 'tomato', 'springgreen', 'gray', 'pink']

btn.addEventListener('click', () => {
const random = Math.floor(Math.random() * colors.length);
background.style.backgroundColor = colors[random];
colorText.style.color = colors[random];
colorText.textContent = colors[random];
});