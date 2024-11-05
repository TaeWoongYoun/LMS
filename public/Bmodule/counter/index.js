$(document).ready(function(){
    let count = document.querySelector('.number');
    const decrease = document.querySelector('.decrease');
    const reset = document.querySelector('.reset');
    const increase = document.querySelector('.increase');

    function btn(a){
        let num = Number(count.textContent);
        num += a;
        count.textContent = num;
        colorChange();
    }

    decrease.addEventListener('click', function(){
        btn(-1);
    });

    reset.addEventListener('click', function(){
        count.textContent = 0;
        colorChange();
    });
    
    increase.addEventListener('click', function(){
        btn(1);
    });

    function colorChange(){
        if (Number(count.textContent) < 0){
            count.style.color = 'red';
        } else if (Number(count.textContent) > 0){
            count.style.color = 'green';
        } else {
            count.style.color = 'black';
        }
    }
});
