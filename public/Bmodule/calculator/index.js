const result = document.querySelector('.result');
let formula = [];

function calculate(e) {
    const value = e.target.innerText; 

    if (value === '=') {
        const data = eval(formula.join(''));
        result.innerText = data;
        formula = [data.toString()]; 
    } else if (value === 'C') {
        formula = [];
        result.innerText = '';
    } else if (value === '<-') {
        formula.pop();
        result.innerText = formula.join(''); 
    } else {
        formula.push(value);
        result.innerText = formula.join(''); 
    }
}

document.querySelectorAll('.key-wrap div').forEach(button => {
    button.addEventListener('click', calculate);
});

document.querySelectorAll('.calc-wrap div').forEach(button => {
    button.addEventListener('click', calculate);
});