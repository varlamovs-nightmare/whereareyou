from bottle import get, post, run, request
import uuid
from geo import distance

from osm.osm import describe_objects


class Game:
    def __init__(self, game_id, current_coordinates):
        self.id = game_id
        self.current_coordinates = current_coordinates
        self.is_finished = False
        self.answer_coordinates = None
        self.distance = None
        self.tips = []
        self.shown_tips = []


def add_tips(game):
    radius = 0.0025
    cooridnate = game.current_coordinates
    objects = describe_objects(cooridnate[0] - radius, cooridnate[1] - radius, cooridnate[0] + radius,
                               cooridnate[1] + radius)

    for o in objects['amenities']:
        game.tips.append(f'Рядом с вами находится {o["name"]}')


def show_tips(game, count):
    not_shown_tips = [tip for tip in game.tips if tip not in game.shown_tips]

    for i in range(min(len(not_shown_tips), count)):
        game.shown_tips.append(not_shown_tips[i])


test_game = Game('test', (56.832469, 60.605989))
add_tips(test_game)
show_tips(test_game, 2)
games = {'test': test_game}


@get('/api/games')
def get_games():
    return {
        "games": [{"game_id": g.id, "coordinates": g.current_coordinates if g.is_finished else None} for g in
                  games.values()]
    }


@post('/api/games')
def post_game():
    game_id = str(uuid.uuid4())

    game = Game(game_id, (56.832469, 60.605989))
    games[game_id] = game

    return {
        "game_id": game_id
    }


@get('/api/games/<game_id>')
def get_game(game_id):
    game = games[game_id]

    return {
        "id": game_id
    }


@get('/api/games/<game_id>/tips')
def get_game(game_id):
    game = games[game_id]

    return {'tips': game.shown_tips}


@post('/api/games/<game_id>/ask-tip')
def get_game(game_id):
    game = games[game_id]

    show_tips(game, 1)
    return {'tips': game.shown_tips}


@post('/api/games/<game_id>/finish')
def finish_game(game_id):
    game = games[game_id]

    if game.is_finished:
        return {
            "right_coordinates": game.current_coordinates,
            "distance": game.distance
        }

    answer = request.json

    answer_coordinates = (answer["latitude"], answer["longitude"])

    d = distance(game.current_coordinates, answer_coordinates)

    game.is_finished = True
    game.answer_coordinates = answer_coordinates
    game.distance = d

    return {
        "right_coordinates": game.current_coordinates,
        "distance": d
    }


run(host='localhost', port=8080, debug=True, server='paste')
