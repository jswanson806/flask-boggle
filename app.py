from crypt import methods
from boggle import Boggle
from flask import Flask, render_template, session, jsonify, request


app = Flask(__name__)
app.config['SECRET_KEY'] = 'abc123'
app.config['TESTING'] = True
app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']
boggle_game = Boggle()



@app.route('/')
def generate_board():
    """Shows game board"""
    board = boggle_game.make_board()
    session['board'] = board
    times_played = session.get('times_played', 0)
    high_score = session.get('high_score', 0)
    return render_template('base.html', board=board, 
                            times_played=times_played,
                            high_score=high_score)

@app.route('/validate-word')
def validate_word():
    """Checks if word is in dictionary"""
    word = request.args["word"]
    board = session['board']
    response = boggle_game.check_valid_word(board, word)
    return jsonify({'result': response})


@app.route('/stats', methods=["POST"])
def update_stats():
    """Updates player stats"""

    # get the game score from axios request
    score = request.json['score']
    
    # get current high_score and times_played, default 0
    high_score = session.get('high_score', 0)
    times_played = session.get('times_played', 0)
    
    # update high_score stat
    session['high_score'] = max(score, high_score)
    # update times_played stat
    session['times_played'] = times_played + 1

    # return new high score if applicable
    return jsonify(newRecord=score > high_score)
