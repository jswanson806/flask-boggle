
/** Checks validity of word and updates game score
 * 
 * Return message based on response from the server -
 * valid word = "ok"
 * word not on board = "not-on-board"
 * word not in dictionary = "not-a-word"
 * 
 * display the response to the user & points from word
 */
class BoggleGame{
    constructor(boardId, sec = 60) {
    this.sec = sec;
    this.displayTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);
    
    this.timer = setInterval(this.countDown.bind(this), 1000);

    //listener for the input form submission
    $("#word-form", this.board).on('submit', this.handleSubmit.bind(this));
    
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $('#form-input', this.board);
        let word = $word.val();
        let points = word.length;
        // stop execution if no word is entered
        if (!word) return;

        if(this.words.has(word)) {
            this.showMessage(`Already found '${word}'`, 'err');
            return;
        }

        try {
            const response = await axios.get("/validate-word", {params: {word: word}});
            const result = response.data.result;
            if (result === "not-word"){
                this.showMessage(`${word} is not a valid word.`, 'err')
            } else if (result == "not-on-board") {
                this.showMessage(`${word} is not on the board.`, 'err')
            } else {
                
                //update score with points from word
                this.score += points;
                this.words.add(word);
                //update score in DOM
                this.updateScore();
                this.showMessage(`Added: ${word} +${points}`, 'ok')
            }

        //catch errors
        } catch (err) {
            console.error("handleSubmit failed", err);
        }
        //clear input and focus
        $word.val("").focus();
    }


    //update DOM with message to user
    showMessage(msg, cls) {
        $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
    }

    //update DOM with current score
    updateScore(){
        $(".score", this.board).html(`${this.score}`);
    }

    //handles game timer
    displayTimer() {    
        $("#timer", this.board).text(`Time Remaining: ${this.sec}`);
            
    }

    async countDown() {
        this.sec -= 1;
        this.displayTimer();

        if (this.sec === 0) {
            clearInterval(this.timer);
            await this.endGame();
        }
    }

    

    hideComponents() {
        $('.display-area', this.board).hide()
        $('.form', this.board).hide()
        $('.score-display', this.board).hide()
        $('.timer', this.board).hide()
    }

    //remove input form, display 'game over' and final score
    async endGame() {
        this.hideComponents();
        this.showMessage(`Game Over! Final Score: ${this.score}`);

        // post request with game score
        const response = await axios.post("/stats", {score: 
                                                    this.score});

        if(response.data.newRecord){
            this.showMessage(`Game Over! New High Score is ${this.score}!`);
        }
    }


}

