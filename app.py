from random import shuffle, random

from bottle import get, post, run, request
import uuid
from geo import distance, move_coordinate
from street_predictor import parse_summary

from osm.osm import describe_objects

min_lat, max_lat, min_lon, max_lon = 56.807556, 56.847826, 60.570744, 60.657791


class Game:
    def __init__(self, game_id, current_coordinates):
        self.id = game_id
        self.current_coordinates = current_coordinates
        self.is_finished = False
        self.answer_coordinates = None
        self.distance = None
        self.tips = []
        self.shown_tips = []

    def move(self, direction, value=100):
        if direction == 'north':
            self.current_coordinates = move_coordinate(self.current_coordinates[0], value), self.current_coordinates[1]
        elif direction == 'south':
            self.current_coordinates = move_coordinate(self.current_coordinates[0], -value), self.current_coordinates[1]
        elif direction == 'east':
            self.current_coordinates = self.current_coordinates[0], move_coordinate(self.current_coordinates[1], value)
        elif direction == 'west':
            self.current_coordinates = self.current_coordinates[0], move_coordinate(self.current_coordinates[1], -value)


def add_tips(game):
    radius = 0.0025
    coordinate = game.current_coordinates
    near_objects = describe_objects(coordinate[0] - radius, coordinate[1] - radius, coordinate[0] + radius,
                                    coordinate[1] + radius)

    for o in near_objects['amenities']:
        game.tips.append(f'Рядом с вами находится {o["name"]}')

    for s in near_objects['streets']:

        success, summary = parse_summary(
            s['name'].replace('улица', '').replace('проспект', '').replace('переулок', '').strip())

        if success:
            game.tips.append(f'Недалеко есть улица, имя которой дал(а) {summary}')

    buildings = near_objects['buildings']

    if len(buildings) > 0:
        game.tips.append(
            'Вы рядом с ' + convert_building_type(buildings[0]['building_type']) + ' высотой в ' + buildings[0][
                'levels'] + ' этажей')

    shuffle(game.tips)


def convert_building_type(building_type):
    if building_type == 'dormitory':
        return 'общежитием'
    if building_type == 'garage':
        return 'гаражом'
    if building_type == 'apartments':
        return 'жилым домом'
    else:
        return 'зданием'


def show_tips(game, count):
    not_shown_tips = [tip for tip in game.tips if tip not in game.shown_tips]

    for i in range(min(len(not_shown_tips), count)):
        game.shown_tips.append(not_shown_tips[i])


def create_test_game():
    lat = min_lat + (max_lat - min_lat) * random()
    lon = min_lon + (max_lon - min_lon) * random()

    test_game = Game('test', (lat, lon))
    add_tips(test_game)
    show_tips(test_game, 20)

    return test_game


games = {'test': create_test_game()}


@get('/api/games')
def get_games():
    return {
        "games": [{"game_id": g.id, "coordinates": g.current_coordinates if g.is_finished else None} for g in
                  games.values()]
    }


@post('/api/games')
def post_game():
    game_id = str(uuid.uuid4())

    lat = min_lat + (max_lat - min_lat) * random()
    lon = min_lon + (max_lon - min_lon) * random()

    game = Game(game_id, (lat, lon))
    games[game_id] = game

    return {
        "game_id": game_id,
        "min_lat": min_lat,
        "max_lat": max_lat,
        "min_lon": min_lon,
        "max_lon": max_lon
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


@post('/api/games/<game_id>/move')
def get_game(game_id):
    game = games[game_id]

    direction = request.json['direction']

    game.move(direction)

    game.tips = []

    add_tips(game)

    game.shown_tips.append('Вы переместились на 100 м на ' + direction)

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
