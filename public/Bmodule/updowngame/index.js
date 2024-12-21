const targetNumber = Math.floor(Math.random() * 101);
let attempts = 0;

function updateAIResponse(message) {
    const responseText = document.getElementById('aiResponse');
    responseText.style.opacity = '0';
    
    setTimeout(() => {
        responseText.textContent = message;
        responseText.style.opacity = '1';
    }, 200);
}

function checkNumber() {
    const userGuess = parseInt(document.getElementById('userGuess').value);
    attempts++;

    if (isNaN(userGuess) || userGuess < 0 || userGuess > 100) {
        updateAIResponse("0부터 100 사이의 유효한 숫자를 입력해주세요.");
        return;
    }

    let message;
    if (userGuess === targetNumber) {
        message = `축하합니다! ${attempts}번 만에 정답을 맞추셨어요! 🎉\n정답은 ${targetNumber}입니다.`;
    } else if (userGuess < targetNumber) {
        message = `${userGuess}보다 큰 숫자예요! UP! ⬆️\n다시 시도해보세요.`;
    } else {
        message = `${userGuess}보다 작은 숫자예요! DOWN! ⬇️\n다시 시도해보세요.`;
    }

    updateAIResponse(message);
    document.getElementById('userGuess').value = '';
}

document.getElementById('userGuess').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkNumber();
    }
});