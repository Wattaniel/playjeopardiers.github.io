var playersData = []; // holds data for all players
var playerData; // holds data for the current player
var notification = new bootstrap.Toast(document.getElementById('notification-toast'));
var currentDate = new Date();
var gameBtns = {
    play: document.getElementById('btn-play'),
    end: document.getElementById('btn-end'),
    replay: document.getElementById('btn-replay')
};


function onLoad() {
    initializeBoard();
    document.getElementById('top-anchor').click();
    setInterval(showgender,5000);
    setInterval(showAge,5000);
}

function setAge(dobField) {    
    let dob = new Date(dobField.value);

    if (isNaN(dob) === false) { // if a valid date was given proceed to calculate age
        // get number of years since birth year
        let age = currentDate.getFullYear() - dob.getFullYear();

        // get the number of month since birth month
        let month = currentDate.getMonth() - dob.getMonth();

        // if the current month is before birth month or if the current month is the birth month
        // and the current day is before the birth day then subtract 1 from age
        age = (month < 0 || (month === 0 && currentDate.getDate() < dob.getDate())) ? --age : age;    

        document.getElementById('age').value = age;  
    }
}


function uploadAvatar() {
    let file = document.getElementById('profile').files[0];
    let avatar = document.getElementById('player-img');

    if (file) {
	    avatar.src = URL.createObjectURL(file);
    }
}

function register(form, event) {
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) { // if form is valid proceed to save the player's data
        let formData = new FormData(form);
        let gameBtns = document.getElementById('game-btns');
        playerData = {}; // new player

        // disable form by setting the disabled attribute on the fieldset element
        form[0].setAttribute('disabled', '');
        event.submitter.setAttribute('disabled', '');

        // populate payerData with data from the registration form
        for (let data of formData.entries()) {
            // data[0] is the name of the form field and data[1] is the value it contains
            playerData[data[0]] = data[1]; // e.g. playerData[lastName] = 'dexter'
        }
        
        //playerData.push(playerData.age = (document.getElementById('age').value));      
        playersData.push(playerData); // append the current player to the playersData store 
        playerData.stats = {
            games: 0,
            correct: 0,
            incorrect: 0,
            score: 100,
        };
        
        // display and scroll to the buttons that controls the game
        gameBtns.classList.remove('d-none');
        gameBtns.querySelector('#game-btns-anchor').click();
    }

    form.classList.add('was-validated');
}
function displayFunctions(){
    showAge();
    showgender();
}
function playGame(event) {
    event.currentTarget.setAttribute('disabled', '');
    playerData.stats.games++;
    disabledCellCount = 0;

    document.querySelector('#board table tr').innerHTML = generateBoardHeader();
    document.querySelector('#board table tbody').innerHTML = initialBoard;
    document.getElementById('board').classList.remove('d-none');
    gameBtns.end.removeAttribute('disabled');
    document.getElementById('board-anchor').click();

    enableButton();
    setDailyDouble();

    // go through each category and randomize the questions in the category
    boardHeaders.forEach(function(category_name, index) {
        let categoryQuestions = questions[category_name];
        questions[category_name] = shuffleQuestions(categoryQuestions);
    });

    console.log('playerData:', playerData);
    console.log('daily double:', dailyDouble);    
}

function endGame(event) {
    event.currentTarget.setAttribute('disabled', '');
    gameBtns.replay.removeAttribute('disabled');
    document.getElementById('board').classList.add('d-none');
    findPercentageScore();    
}

function getRandomNumber(min, max) {
    let number = 0;

    if (min >= 0 && max > min) {
        number = Math.floor(Math.random() * (max - min) + min);
    }

    return number;
}

function notify(config) {
    let heading = config.heading || '',
        message = config.message || '',
        theme = config.theme || '',
        delay = config.delay || 5000,

        toast = notification._element,
        toastBody = toast.querySelector('.toast-body'),
        toastHeader = toast.querySelector('.toast-header'),

        toastButtons = {
            action: toastBody.querySelector('#t-btn-action'),
            close: toastBody.querySelector('#t-btn-close')
        },

        icons = {
            danger: toastHeader.querySelector('#t-img-danger'),
            success: toastHeader.querySelector('#t-img-success')
        }

    
        
    if (message !== '') {
        // remove previous theme
        toast.classList.remove('border-danger');
        toast.classList.remove('border-success');
        icons['danger'].classList.add('d-none');
        icons['success'].classList.add('d-none');
        toastButtons.action.classList.add('d-none');
        toastButtons.close.classList.add('d-none');
        notification._config.autohide = true;
        notification._config.delay = delay;
        
        if (theme !== '') { // set theme
            toast.classList.add('border-' + theme);
            icons[theme].classList.remove('d-none');
        }

        if (heading === 'Correct' || heading === 'Incorrect') {
            notification._config.autohide = false;
            toastButtons.close.classList.remove('d-none');

            if (heading === 'Incorrect') {
                toastButtons.action.classList.remove('d-none');
                toastButtons.close.innerText = 'No';
            } else {
                toastButtons.close.innerText = 'Close';
            }
        }

        toastHeader.querySelector('strong').innerText = heading;
        toastBody.querySelector('p').innerText = message;

        notification.show();
    }
}

function decrementScore(amount) {
    playerData.stats.incorrect++;
    playerData.stats.score -= amount;
}

function incrementScore(amount) {
    playerData.stats.correct++;
    playerData.stats.score += amount;
}

function findPercentageScore() {
    let showPercentageField = document.getElementById('showpercentage'),
        numQuestions = 0,
        percentCorrect = 0,
        percentIncorrect = 0,
        percentageFieldVal = '',
        dateString = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear(),
        totalGames = 0; // overall total games played
    
    // calculate overall total games played
    playersData.forEach(function(p) {totalGames += p.stats.games});
    
    playersData.forEach(function (playerData, index) {
        numQuestions = playerData.stats.correct + playerData.stats.incorrect,
        percentCorrect = (numQuestions != 0) ? (playerData.stats.correct / numQuestions * 100).toFixed(2) : 0,
        percentIncorrect = (numQuestions != 0) ? (playerData.stats.incorrect / numQuestions * 100).toFixed(2) : 0,
        percentageFieldVal += 'Date: ' + dateString
            + ', Name: ' + playerData.firstName + ' ' + playerData.lastName
            + ', Town: ' + playerData.town
            + ', Games: ' + playerData.stats.games + '/' + totalGames + ' (' + (playerData.stats.games/totalGames * 100).toFixed(2) + '%)'
            + ', Questions: ' + numQuestions
            + ', Correct: ' + playerData.stats.correct + ' (' + percentCorrect + '%)'
            + ', Incorrect: ' + playerData.stats.incorrect + ' (' + percentIncorrect + '%)'
            + ', Total Score: ' + playerData.stats.score + '\n';
    });

    showPercentageField.value = '';
    showPercentageField.value = percentageFieldVal;
}

document.getElementById("clearBtn").addEventListener("click", disablePlayingArea);
document.getElementById("clearBtn").addEventListener("click", enableForm);
document.getElementById("submitBtn").addEventListener("click", enablePlayingArea);


function disablePlayingArea(){
    var fields = document.getElementById("play").getElementsByTagName('*');
    for(var i = 0; i < fields.length; i++)
    {
        fields[i].disabled = true;
    }
    document.getElementById('board').classList.add('d-none');
}
function enableForm(){
    var fields = document.getElementById("form1").getElementsByTagName('*');
    for(var i = 0; i < fields.length; i++)
    {
        fields[i].disabled = false;
    }
    document.getElementById("submitBtn").disabled = false;
}
function enablePlayingArea(){
    var fields = document.getElementById("play").getElementsByTagName('*');
    for(var i = 0; i < fields.length; i++)
    {
        fields[i].disabled = false;
    }
}

function showAllPlayers() {        
    let showAllPlayersField = document.getElementById('showallplayers'),
        numQuestions = 0,
        percentCorrect = 0,
        allPlayersFieldVal = '';

    playersData.forEach(function (playerData, index) {       
        numQuestions = playerData.stats.correct + playerData.stats.incorrect,
        percentCorrect = (numQuestions != 0) ? (playerData.stats.correct / numQuestions * 100).toFixed(2) : 0,
        allPlayersFieldVal += 'Name: ' + playerData.firstName + ' ' + playerData.lastName
            + ', Age: ' +  playerData.age
            + ', Correct: ' + playerData.stats.correct 
            + ', Incorrect: ' + playerData.stats.incorrect 
            + ', Total Score: ' + playerData.stats.score + ' (' + percentCorrect + '%)' + '\n';
    });

    showAllPlayersField.value = '';
    showAllPlayersField.value = allPlayersFieldVal;
}

function showgender() {        
    let maleCount= 0,
        femaleCount = 0,
        numOfPersons = 0;

    playersData.forEach(function (playerData, index) {
        if(playerData.gender ==='male'){
            maleCount++;
        }
        if(playerData.gender ==='female'){
            femaleCount++;
        }        
        numOfPersons ++;
    });
    if(numOfPersons!=0){
        // Calculating percentage
        let mCount = (maleCount/numOfPersons)*100;
        let fCount = (femaleCount/numOfPersons)*100;    

        //changing image width 
        document.getElementById("img1").width = fCount;
        document.getElementById("img2").width = mCount;   

        //changing percentage values in table
        document.getElementById('f1').innerHTML = fCount.toFixed(2) + '%';
        document.getElementById('f2').innerHTML = mCount.toFixed(2) + '%'; 
    }     
}

function showAge() { //this is my issue       
    let v1= 0,
        v2= 0,
        v3 = 0,
        v4 = 0,
        numOfPersons = 0;

    playersData.forEach(function (playerData, index) {
        if(playerData.age < 20){
            v1++;
        }
        if(playerData.age >= 20  && playerData.age <=39){
            v2++;
        }  
        if(playerData.age >= 40  && playerData.age <=69){
            v3++;
        } 
        if(playerData.age > 69){
            v4++;
        }       
        numOfPersons++;
    });

    // Calculating percentage 
    if(numOfPersons!=0){
        let v1Count = (v1/numOfPersons)*100;
        let v2Count = (v2/numOfPersons)*100;
        let v3Count = (v3/numOfPersons)*100;
        let v4Count = (v4/numOfPersons)*100;    

    //changing image width 
        document.getElementById("img3").width = v1Count;
        document.getElementById("img4").width = v2Count; 
        document.getElementById("img5").width = v3Count;
        document.getElementById("img6").width = v4Count;   

    //changing percentage values in table
        document.getElementById('f3').innerHTML = v1Count.toFixed(2) + '%';
        document.getElementById('f4').innerHTML = v2Count.toFixed(2) + '%';  
        document.getElementById('f5').innerHTML = v3Count.toFixed(2) + '%';
        document.getElementById('f6').innerHTML = v4Count.toFixed(2) + '%'; 
    }
}





