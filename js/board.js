var categories = Object.keys(questions);
var boardHeaders = []; // categories as they are arranged on the current board
var dailyDouble = []; // holds the daily double coordinates
var activeCell; // used to hold a reference to the board cell selected by the player
var initialBoard = ''; // stores the initial HTML of the board so that the board can be reset
var disabledCellCount = 0;

function initializeBoard() {
    let questionModal = document.getElementById('question-modal');

    questionModal.addEventListener('show.bs.modal', onShowQuestion);
    questionModal.addEventListener('hidden.bs.modal', onCloseQuestion);
    questionModal.querySelector('#notification-toast').addEventListener('hidden.bs.toast', onToastClose);
    initialBoard = document.querySelector('#board table tbody').innerHTML;
}

function generateBoardHeader() {
    let header = '';

    boardHeaders = [];

    do {
        let h = categories[getRandomNumber(0, categories.length)];

        if (boardHeaders.indexOf(h) === -1) {
            boardHeaders.push(h);
        }
    } while (boardHeaders.length != 5);

    boardHeaders.forEach(function(h) {
        header += '<th>' + h + '</th>';
    });

    return header;
}

function setDailyDouble() {
    dailyDouble = [];

    while (dailyDouble.length != 3) {
        let coord = getRandomNumber(1, 6) + 'x' + getRandomNumber(1, 6); // e.g. 1x5

        if (!dailyDouble.includes(coord)) {
            dailyDouble.push(coord);
        }
    }
}

function handleDailyDouble() {
    let ddImgs = document.getElementById('dd-celebration').children;
    let ddWager = ddWrapper.querySelector('#dd-wager');
    let celebrationImg = getRandomNumber(0, 2); // randomly choose a celebration gif

    ddWager.setAttribute('placeholder', playerData.stats.score);
    ddWager.setAttribute('max', playerData.stats.score);
    ddWager.value = '';

    // show the celebration gif
    ddWrapper.classList.remove('d-none');
    ddImgs[celebrationImg].classList.remove('d-none');

    setTimeout(function () { // hide celebration after 1.5 seconds
        ddImgs[celebrationImg].classList.add('d-none');
        ddWager.focus();
    }, 1250);
    
    notify({heading: 'Daily Double', message: 'Choose your wager!', theme: 'success', delay: 3000});
}

/**
 * This method implement a version of the Fisher-Yates shuffle algorithm
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 * 
 * @param {array} category A category from the questions array
 */
function shuffleQuestions(category) {
    let randomIndex = 0;
    let temp = null;

    for (let i = category.length - 1; i > 0; i--) {
        // pick a random question
        randomIndex = getRandomNumber(0, (i + 1));
        temp = category[i];

        // swap the random question with the current question
        category[i] = category[randomIndex];
        category[randomIndex] = temp;
    }

    return category;
}

function disableActiveCell() {
    activeCell.style.cursor = 'initial';
    activeCell.classList.add('bg-secondary');
    activeCell.removeAttribute('data-bs-target');
    activeCell.removeAttribute('data-bs-toggle');
    disabledCellCount++;
}