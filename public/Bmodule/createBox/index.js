document.getElementById('btn').addEventListener('click', function(){
    let newDiv = document.createElement('div');
    newDiv.style.background = "#" + Math.floor(Math.random() * 16777215).toString(16);
    document.getElementById('section').appendChild(newDiv);
});