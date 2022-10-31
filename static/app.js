let gameOver = false;
let score = 0;
/** Checks validity of word and updates game score
 * 
 * Return message based on response from the server -
 * valid word = "ok"
 * word not on board = "not-on-board"
 * word not in dictionary = "not-a-word"
 * 
 * display the response to the user & points from word
 */

async function handleSubmit(evt) {
    evt.preventDefault();
    const $word = $('#form-input');
    let word = $word.val();
    let points = word.length;
    // stop execution if no word is entered
    if (!word) return;

    try {
        const response = await axios.get("/validate-word", {params: {word: word}});
        const result = response.data.result;
        if (result === "not-word"){
            showMessage(`${word} is not a valid word.`, 'err')
        } else if (result == "not-on-board") {
            showMessage(`${word} is not on the board.`, 'err')
        } else {
            showMessage(`Added: ${word} +${points}`, 'ok')
            //update score with points from word
            score += points;
            //update score in DOM
            updateScore(score);
        }

    //catch errors
    } catch (err) {
        console.error("handleSubmit failed", err);
    }
    //clear input and focus
    $word.val("").focus();
}

//listener for the input form submission
$("#word-form").on('submit', handleSubmit);

//update DOM with message to user
function showMessage(msg) {
    $(".msg").html("").append(`<p>${msg}</p>`);
}

//update DOM with current score
function updateScore(score){
    $(".score").html(`${score}`);
}

//handles game timer
function startTimer() {
    let sec = 10;
    
        setInterval(() => {
            //if game ends, stop the timer
            if(!gameOver) {
            $("#timer").html(`Time Remaining: ${sec}`);
            sec--;
            //if timer reaches 0, call endGame function
            if (sec == -1) {
                endGame();
            }
        }
        }, 1000);
}

function startGame() {
    startTimer();
}

function hideComponents() {
    $('.display-area').hide()
    $('.form').hide()
    $('.score-display').hide()
    $('.timer').hide()
}

//remove input form, display 'game over' and final score
async function endGame() {
    gameOver = true;
    hideComponents();
    showMessage(`Game Over! Final Score: ${score}`);

    // post request with game score
    try {
        const response = await axios.post("/stats", {score: score});
        if(response.data.newRecord){
            showMessage(`Game Over! New High Score is ${score}!`);
        }
    } catch (err) {
        console.error("endGame failed", err);
    }
}

//start the game timer after the DOM loads
document.addEventListener('DOMContentLoaded', () => {
    startGame();
})

