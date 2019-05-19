import os
from random import shuffle, random
from bottle import get, post, run, request, static_file, response
import uuid
from geo import distance, move_coordinate
from street_predictor import parse_summary
from string_formats import choose_numeral_form

from osm.osm import describe_objects

from yandex import get_text_by_coordinates
from stemmer import stemming

import itertools
import bottle
import re

cities = {
    "Екатеринбург": (56.807556, 56.847826, 60.570744, 60.657791, 'ru'),
    "Новосибирск": (55.014014, 55.074232, 82.876859, 82.979521, 'ru'),
    "Пермь": (57.965700, 58.030282, 56.158590, 56.306500, 'ru'),
    "Ижевск": (56.838417, 56.874474, 53.189986, 53.243514, 'ru'),
    "Казань": (55.770257, 55.830138, 49.088112, 49.181250, 'ru'),
    "Самара": (53.171396, 53.299662, 50.066118, 50.288368, 'ru'),
    "Санкт-Петербург": (59.896114, 59.993548, 30.231423, 30.413881, 'ru'),
    "Лондон": (51.464854, 51.575864, -0.181617, 0.012276, 'en')
}

move_distance = 300


class Game:
    def __init__(self, game_id, current_coordinates, lang):
        self.id = game_id
        self.current_coordinates = current_coordinates
        self.is_finished = False
        self.answer_coordinates = None
        self.distance = None
        self.tips = []
        self.shown_tips = []
        self.route = [current_coordinates]
        self.score = 0
        self.lang = lang

    def move(self, direction, value=move_distance):
        if direction == 'north':
            self.current_coordinates = move_coordinate(self.current_coordinates[0], value), self.current_coordinates[1]
        elif direction == 'south':
            self.current_coordinates = move_coordinate(self.current_coordinates[0], -value), self.current_coordinates[1]
        elif direction == 'east':
            self.current_coordinates = self.current_coordinates[0], move_coordinate(self.current_coordinates[1], value)
        elif direction == 'west':
            self.current_coordinates = self.current_coordinates[0], move_coordinate(self.current_coordinates[1], -value)

        self.route.append(self.current_coordinates)


def add_tips(game):
    radius = 0.0025
    coordinate = game.current_coordinates
    near_objects = describe_objects(coordinate[0] - radius, coordinate[1] - radius, coordinate[0] + radius,
                                    coordinate[1] + radius)

    for o in near_objects['amenities']:
        direction = get_direction(coordinate, (o['lat'], o['lon']))
        game.tips.append(f'На {convert_direction(direction)}е от вас находится {o["name"]}')

    for o in near_objects['rivers']:
        game.tips.append(f'Рядом с вами протекает {o["name"]} 🌊')

    for d in near_objects['districts']:
        success, district_tip = create_district_tip(d["name"])

        if success:
            game.tips.append('В зоне вашей видимости несколько районов. Один из них' + district_tip)

    for s in near_objects['streets']:
        success, summary = parse_summary(
            s['name'].replace('улица', '').replace('проспект', '').replace('переулок', '').strip(), game.lang)

        if success and summary and 'улица' not in summary and not re.search(stemming(s['name']), stemming(summary),
                                                                            re.IGNORECASE):
            game.tips.append(
                f'{summary[0].capitalize() + summary[1:]}. Это как-то связано с названием ближайшей улицы 🤔')

    buildings = near_objects['buildings']

    if len(buildings) > 0:
        game.tips.append(
            'Вы рядом ' + convert_building_type(buildings[0]['building_type']) + ' высотой в ' + buildings[0][
                'levels'] + choose_numeral_form(buildings[0]['levels'], ' этаж', ' этажа', ' этажей'))

    for v in itertools.islice(near_objects['vehicles'], 3):
        if v['vehicle_type'] == 'train':
            game.tips.append(f'Мимо пронесся поезд 🚂')
        else:
            game.tips.append(f'Мимо как раз проезжает полупустой {v["name"]}. Можно успеть')

    for s in near_objects['sightseeings']:
        type = convert_sightseeing_type(s['type'])
        direction = get_direction(coordinate, (s['lat'], s['lon']))
        game.tips.append(
            f'Кстати, неподалеку на {convert_direction(direction)}е есть ' + (
                type if type else 'интересный туристический объект') + ': ' + s["name"])

    shuffle(game.tips)


def get_direction(my_coordinates, object_coordinates):
    dlat = object_coordinates[0] - my_coordinates[0]
    dlon = object_coordinates[1] - my_coordinates[1]

    if abs(dlat) < abs(dlon):
        return 'east' if dlon > 0 else 'west'

    return 'north' if dlat > 0 else 'south'


def convert_building_type(building_type):
    if building_type == 'dormitory':
        return 'с общежитием'
    if building_type == 'garage':
        return 'с гаражом'
    if building_type == 'apartments':
        return 'с жилым домом'
    else:
        return 'со зданием 🏢'


def convert_direction(direction):
    if direction == 'north':
        return 'север'
    if direction == 'south':
        return 'юг'
    if direction == 'east':
        return 'восток'
    if direction == 'west':
        return 'запад'
    return ''


def convert_sightseeing_type(type):
    if type == 'memorial':
        return 'памятник'
    if type == 'attraction':
        return None
    if type == 'artwork':
        return None
    if type == 'resort':
        return None
    if type == 'viewpoint':
        return None
    if type == 'museum':
        return None
    if type == 'yes':
        return None
    if type == 'building':
        return None
    return None


districts_tips = {
    'кировский': ' назван в честь Сергея Мироновича, фамилия которого послужила названием еще и для города',
    'ленинский': ' назвали в честь Ильича. Все знают Ильича ☭',
    'октябрьский': ' заставляет задуматься о чем-то между сентябрем и ноябрем',
    'чкаловский': ', если судить по названию, имеет некоторое отношение к лётчикам',
    'железнодорожный': ' наверняка расположил внутри себя вокзал, ну или паровозное депо'
}


def create_district_tip(district_name):
    for district_key, district_tip in districts_tips.items():
        if district_key in district_name.lower():
            return (True, district_tip)
    return (False, '')


def show_tips(game, count):
    not_shown_tips = [tip for tip in game.tips if tip not in game.shown_tips]

    for i in range(min(len(not_shown_tips), count)):
        game.shown_tips.append(not_shown_tips[i])


def create_test_game():
    min_lat, max_lat, min_lon, max_lon, lang = cities['Екатеринбург']

    lat = min_lat + (max_lat - min_lat) * random()
    lon = min_lon + (max_lon - min_lon) * random()

    test_game = Game('test', (lat, lon), lang)
    # add_tips(test_game)
    # show_tips(test_game, 2)

    return test_game


games = {'test': create_test_game()}


# the decorator
def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers[
            'Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)

    return _enable_cors


def count_score(game):
    dist = distance(game.current_coordinates, game.answer_coordinates)

    return 100_000 / (1 + dist)


@get('/api/games')
@enable_cors
def get_games():
    return {
        "games": [{"game_id": g.id, "coordinates": g.current_coordinates if g.is_finished else None} for g in
                  games.values()]
    }


@post('/api/games')
def post_game():
    game_id = str(uuid.uuid4())
    city_id = request.json['city'] or 'Екатеринбург'
    if city_id not in cities:
        return bottle.HTTPResponse(status=404, body='city not found')

    min_lat, max_lat, min_lon, max_lon, lang = cities[city_id]

    lat = min_lat + (max_lat - min_lat) * random()
    lon = min_lon + (max_lon - min_lon) * random()

    game = Game(game_id, (lat, lon), lang)
    games[game_id] = game

    add_tips(game)
    show_tips(game, 2)

    return {
        "game_id": game_id,
        "min_lat": min_lat,
        "max_lat": max_lat,
        "min_lon": min_lon,
        "max_lon": max_lon
    }


@get('/api/games/<game_id>')
@enable_cors
def get_game(game_id):
    if not game_id in games:
        return bottle.HTTPResponse(status=404, body='game not found')

    game = games[game_id]

    return {
        "id": game_id
    }


@get('/api/games/<game_id>/tips')
@enable_cors
def get_tips(game_id):
    game = games[game_id]

    has_more = len([tip for tip in game.tips if tip not in game.shown_tips]) > 0

    return {'tips': game.shown_tips, 'hasMore': has_more}


@post('/api/games/<game_id>/ask-tip')
@enable_cors
def get_tip(game_id):
    if not game_id in games:
        return bottle.HTTPResponse(status=404, body='game not found')

    game = games[game_id]

    show_tips(game, 1)

    has_more = len([tip for tip in game.tips if tip not in game.shown_tips]) > 0

    return {'tips': game.shown_tips, 'hasMore': has_more}


@post('/api/games/<game_id>/move/<direction>')
@enable_cors
def move(game_id, direction):
    if not game_id in games:
        return bottle.HTTPResponse(status=404, body='game not found')

    game = games[game_id]

    if not direction:
        return bottle.HTTPResponse(status=400, body='direction is required')

    game.move(direction)

    game.tips = []

    add_tips(game)

    game.shown_tips.append(f'Вы переместились на {move_distance}м на {convert_direction(direction)}')

    show_tips(game, 1)

    has_more = len([tip for tip in game.tips if tip not in game.shown_tips]) > 0

    return {'tips': game.shown_tips, 'hasMore': has_more}


@post('/api/games/<game_id>/finish/<latitude>/<longitude>')
@enable_cors
def finish_game(game_id, latitude, longitude):
    if not game_id in games:
        return bottle.HTTPResponse(status=404, body='game not found')

    game = games[game_id]

    answer_coordinates = (float(latitude), float(longitude))

    d = distance(game.current_coordinates, answer_coordinates)

    if not game.is_finished:
        game.is_finished = True
        game.answer_coordinates = answer_coordinates
        game.distance = d
        game.score = count_score(game)

    return {
        "right_coordinates": game.current_coordinates,
        "distance": d,
        "address": get_text_by_coordinates(game.current_coordinates),
        "route": game.route,
        "score": game.score
    }


@get('/api/cities')
@enable_cors
def get_cities():
    return {"cities": list(cities.keys())}


@get('/')
@enable_cors
def index():
    return static_file('index.html', "build")


@get('/static/css/<staticFile>')
@enable_cors
def static_css(staticFile):
    return static_file(staticFile, "build/static/css")


@get('/static/js/<staticFile>')
@enable_cors
def static_js(staticFile):
    return static_file(staticFile, "build/static/js")


@get('/static/media/<staticFile>')
@enable_cors
def static_media(staticFile):
    return static_file(staticFile, "build/static/media")

@get('/<whatever:path>')
@enable_cors
def index(whatever):
    return static_file('index.html', "build")

application = bottle.default_app()
from paste import httpserver

if os.environ.get('APP_LOCATION') == 'heroku':
    httpserver.serve(application, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
else:
    httpserver.serve(application, host='localhost', port=8080, threadpool_workers=20, request_queue_size=20)
