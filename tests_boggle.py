from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

class BoggleTestCase(TestCase):
    def test_homepage(self):
        """Test homepage and session data."""
        with app.test_client() as client:
            res = client.get('/')
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code, 200)
            self.assertIn('<h3>Make words!</h3>', html)
            self.assertIn('board', session)
            self.assertIsNone(session.get('high_score'))
            self.assertIsNone(session.get('times_played'))

    def test_ok_word(self):
        """Test word is in dictionary and on board response."""
        with app.test_client() as client:
            with client.session_transaction() as sessStorage:
                sessStorage['board'] = [["P", "L", "A", "Y", "S"],
                                        ["P", "L", "A", "Y", "S"],
                                        ["P", "L", "A", "Y", "S"],
                                        ["P", "L", "A", "Y", "S"],
                                        ["P", "L", "A", "Y", "S"]]

            res = client.get('/validate-word?word=play')
            
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json['result'], 'ok')
            
    def test_in_dictionary(self):
        """Test word is in dictionary response."""
        with app.test_client() as client:
            client.get('/')

            res = client.get('/validate-word?word=candle')

            self.assertEqual(res.json['result'], 'not-on-board')

    def test_not_word(self):
        """Test word is not a word response."""
        with app.test_client() as client:
            client.get('/')

            res = client.get('/validate-word?word=adhszdnzsn')

            self.assertEqual(res.json['result'], 'not-word')

            
            