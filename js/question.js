var counter = 0; // keeps track of the timer's current count function
var qModal = null; // will hold an instance of the question modal
var questions = {
    IT: [
        {question: 'How many layers are in the OSI model?', answer: '7'},
        {question: 'How many bits are in a byte?', answer: '8'},
        {question: 'Mac operating system is developed by which company?', answer: 'apple'},
        {question: 'A Trojan is what type of software?', answer: 'malware'},
        {question: 'A computer use which number system to calculate and store data?', answer: 'binary'},
    ],
    SPORTS: [
        {question: 'The Olympics are held every how many years?', answer: '4'},
        {question: 'What does NBA stand for?', answer: 'national basketball association'},
        {question: 'Which country won the World Cup 2018?', answer: 'france'},
        {question: 'How many gold medals has Usain Bolt won?', answer: '8'},
        {question: 'What is the world record time for the women 100 metres?', answer: '10.49'},
    ],
    MOVIES: [
        {question: 'In The Matrix, does Neo take the blue pill or the red pill?', answer: 'red'},
        {question: 'Who wrote the screenplay for Rocky?', answer: 'sylvester stallone'},
        {question: 'In what year was the Jim Carrey blockbuster The Mask released?', answer: '1994'},
        {question: 'How many suns does Luke home planet of Tatooine have in Star Wars?', answer: '2'},
        {question: 'Who is the first and only woman of color to win the Oscar for Best Actress?', answer: 'halle berry'},
    ],
    HISTORY: [
        {question: 'Who sent Christopher Columbus to explore the New World?', answer: 'king ferdinand'},
        {question: 'How old was Queen Elizabeth II when she was crowned the Queen of England?', answer: '27'},
        {question: 'Who was the first person in the world to land on the moon?', answer: 'neil armstrong'},
        {question: 'Who is the king of the Olympian gods in Greek mythology?', answer: 'zeus'},
        {question: 'What year did the Berlin Wall fall?', answer: '1989'},
    ],
    MUSIC: [
        {question: 'Who was the very first American Idol winner?', answer: 'kelly clarkson'},
        {question: 'Before Miley Cyrus recorded Wrecking Ball, it was offered to which singer?', answer: 'beyonce'},
        {question: 'Which classical composer was deaf?', answer: 'beethoven'},
        {question: 'The J in Mary J. Blige stands for what?', answer: 'jane'},
        {question: 'Which pop singer\'s real name is Robyn Fenty?', answer: 'rihanna'},
    ]
};

let questionAnswer = '', questionValue = 0;
let submitBtn = document.getElementById('btn-submit-answer');
let answerField = document.getElementById('player-answer');
let ddWrapper = document.getElementById('dd-wrapper');
let timer = document.getElementById('timer');

const timeExpiredEvent = new Event('timeExpired');

timer.addEventListener(timeExpiredEvent.type, onTimeExpired);

function startTimer() {
    let time = 59;

    submitBtn.removeAttribute('disabled');
    resetTimer();

    counter = setInterval(function () { // this function will be called every second and reduce time by 1
        timer.innerText = --time >= 10 ? ('0:' + time) : ('0:0' + time);
        
        if (time <= 15 && !timer.classList.contains('text-warning')) {
            timer.classList.remove('text-muted');
            timer.classList.add('text-warning');
        } else if (time <= 10 && !timer.classList.contains('text-danger')) {
            timer.classList.remove('text-warning');
            timer.classList.add('text-danger');
        }

        if (time === 0) {
            timer.dispatchEvent(timeExpiredEvent);
        }
    }, 1000);

    return counter;
}

function resetTimer() {
    timer.classList = '';
    timer.classList.add('text-muted');
    timer.classList.add('fs-2');
    timer.innerHTML = '1:00';
}

function stopTimer() {
    clearInterval(counter);
    submitBtn.setAttribute('disabled', '');
}

function onTimeExpired() {
    stopTimer();
    decrementScore(questionValue);
    notify({heading: 'Incorrect', message: 'Time expired. Would you like to see the answer?', theme: 'danger'});
}

function onShowQuestion (event) {
    let questionModal = event.currentTarget;
    let modalTitle = questionModal.querySelector('.modal-title');
    let modalBody = questionModal.querySelector('.modal-body #question');

    // get coordinates for the clicked cell e.g. 1x2 and split it at the x to determine category and amount
    let coord = event.relatedTarget.getAttribute('data-bs-cell').split('x');
    let amount = coord[0];
    let category = boardHeaders[coord[1] - 1]; // categories are 0 based so subtract 1 to get the real category
    let question = questions[category][amount - 1].question;
    let isDailyDouble = dailyDouble.includes(coord.join('x'));

    if (!qModal) { // set global reference to the modal if it is not yet set
        qModal = bootstrap.Modal.getInstance(questionModal);
    }

    if (isDailyDouble) {
        handleDailyDouble();
    }

    questionAnswer = questions[category][amount - 1].answer;
    questionValue = amount * 100;
    activeCell = event.relatedTarget;

    // set title and question
    modalTitle.innerHTML = category + ' for $' + questionValue;
    modalBody.innerHTML = '<p>' + question + '</p>';

    // reset answer field
    answerField.removeAttribute('disabled');
    answerField.value = '';

    startTimer();

    console.log('active cell:', coord.join('x'));
    console.log('question val:', questionValue);
}

function onCloseQuestion(event) {
    stopTimer();

    questionAnswer = '';
    activeCell = '';
    
    if (ddWrapper.classList.contains('d-none') === false) { // hide daily double wager
        ddWrapper.classList.add('d-none');
    }
}

function onToastClose(event) {
    let toast = event.currentTarget;

    toast.classList.remove('border-danger');
    toast.classList.remove('border-success');
}

function onDdWagerChanged(event) {
    let target = event.target;
    let playerScore = playerData.stats.score;

    if (target.value < 0) {
        target.value = 0;
    } else if (target.value > playerScore) {
        target.value = playerScore;
    }
    questionValue = target.value;
    console.log('question value:', questionValue);
}

function checkAnswer() {
    let playerAnswer = answerField.value.trim().toLowerCase();
    let response = {heading: '', message: '', theme: ''}

    
    if (playerAnswer === '') {
        response = {heading: 'No Answer', message: 'No answer was given.', theme: 'danger'};
    } else if (questionAnswer === playerAnswer) {
        response = {heading: 'Correct', message: 'You answered correctly!', theme: 'success'};

        stopTimer();
        incrementScore(questionValue);
        disableActiveCell();
    } else {
        response = {heading: 'Incorrect', message: 'Your answer is incorrect, would you like to see the correct answer?', theme: 'danger'};
        
        stopTimer();
        decrementScore(questionValue);
    }

    notify(response);
    console.log('player stats:', playerData.stats);
    showAllPlayers();
    
}

function revealAnswer() {
    answerField.value = questionAnswer;
    answerField.setAttribute('disabled', '');
    notification.hide();
    disableActiveCell();
}