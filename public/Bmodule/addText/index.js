let add = document.getElementById('add')
let remove = document.getElementById('remove')
let main = document.querySelector('.main')
let counter = 0;

add.addEventListener('click', e=>{
    counter++;
    let element = document.createElement('p');
    element.innerHTML = "새로운 텍스트 입니다." + counter;
    main.appendChild(element);
})

remove.addEventListener('click', e=>{ 
    main.removeChild(main.lastChild);
    counter--;
})