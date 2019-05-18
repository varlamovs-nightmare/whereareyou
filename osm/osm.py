from osmapi import OsmApi
import pprint
import re

Api = OsmApi()
pp = pprint.PrettyPrinter(indent=4)

min_lon, min_lat, max_lon, max_lat = 60.5945351426,56.8549239909,60.6177094284,56.8619861177

def remove_duplicates(l):
    return [dict(t) for t in {tuple(d.items()) for d in l}]

def get_objects_from_square(min_lon, min_lat, max_lon, max_lat):
    return Api.Map(min_lon, min_lat, max_lon, max_lat)
 
def filter_streets(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'highway' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))

def filter_buildings(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'building' in o['data']['tag']
    and 'building:levels' in o['data']['tag'], objects))

def filter_amenities(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'lat' in o['data']
    and 'lon' in o['data']
    and 'amenity' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))

def convert_building_type(building_type):
    if building_type == 'dormitory':
        return 'dormitory'
    if building_type == 'garage':
        return 'garage'
    if building_type == 'apartments':
        return 'apartments'
    else:
        return 'building'

def filter_vehicles(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'vehicle' in o['data']['tag']
    and 'route' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))  

def convert_vehicle_type(vehicle_type):
    if vehicle_type == 'bus':
        return 'bus'
    if vehicle_type == 'tram':
        return 'tram'
    if vehicle_type == 'trolleybus':
        return 'trolleybus'
    if vehicle_type == 'train':
        return 'train'
    else:
        return 'unknown'   

def describe_objects(min_lat, min_lon, max_lat, max_lon):
    objects = get_objects_from_square(min_lon, min_lat, max_lon, max_lat)
    streets = [
      {'name': x['data']['tag']['name']} for x in filter_streets(objects)
    ]
    buildings = [
      {'building_type': convert_building_type(x['data']['tag']['building']),
       'levels': x['data']['tag']['building:levels']} for x in filter_buildings(objects)
    ]
    vehicles = [
      {'vehicle_type': convert_vehicle_type(x['data']['tag']['route']),
       'name': re.split(r'\.', x['data']['tag']['name'].replace(':', '.'))[0]} for x in filter_vehicles(objects)
    ]
    amenities = [
      {'name': x['data']['tag']['name'],
       'type': x['data']['tag']['amenity'],
       'lat': x['data']['lat'],
       'lon': x['data']['lon']} for x in filter_amenities(objects)]
    return {'center': {'lat': (min_lat + max_lat) / 2, 'lon': (min_lon + max_lon) / 2},
            'streets': remove_duplicates(streets),
            'vehicles': remove_duplicates(vehicles),
            'buildings': buildings,
            'amenities': amenities}


if __name__ == '__main__':
    objects = describe_objects(min_lat, min_lon, max_lat, max_lon)
    pp.pprint(objects)