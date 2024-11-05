document.getElementById('btn').addEventListener("click", function(){
    document.getElementById('text').style.fontSize = (parseInt(window.getComputedStyle(document.getElementById('text'), null).getPropertyValue('font-size')) + 5) + 'px';
})

document.getElementById('btn2').addEventListener("click", function(){
    document.getElementById('text').style.fontSize = (parseInt(window.getComputedStyle(document.getElementById('text'), null).getPropertyValue('font-size')) - 5) + 'px';
})

document.getElementById('btn3').addEventListener('click', function(){
    document.getElementById('div').style.width = (parseInt(window.getComputedStyle(document.getElementById('div'), null).getPropertyValue('width')) + 10) + 'px';
})

document.getElementById('btn4').addEventListener('click', function(){
    document.getElementById('div').style.height = (parseInt(window.getComputedStyle(document.getElementById('div'), null).getPropertyValue('height')) + 10) + 'px';
})

document.getElementById('btn5').addEventListener('click', function(){
    document.getElementById('div').style.background = "#" + Math.floor(Math.random() * 16777215).toString(16);
})

document.getElementById('btn6').addEventListener('click', function(){
    document.getElementById('div').style.borderRadius = (parseInt(window.getComputedStyle(document.getElementById('div'), null).getPropertyValue('border-radius')) + 3) + 'px';
})