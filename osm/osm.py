from osmapi import OsmApi
import pprint

Api = OsmApi()
pp = pprint.PrettyPrinter(indent=4)

min_lon, min_lat, max_lon, max_lat = 60.6180181933,56.8111736629,60.6251850558,56.8146972763

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

def describe_objects(min_lat, min_lon, max_lat, max_lon):
    objects = get_objects_from_square(min_lon, min_lat, max_lon, max_lat)
    streets = [
      {'name': x['data']['tag']['name']} for x in filter_streets(objects)
    ]
    buildings = [
      {'building_type': convert_building_type(x['data']['tag']['building']),
       'levels': x['data']['tag']['building:levels']} for x in filter_buildings(objects)
    ]
    amenities = [
      {'name': x['data']['tag']['name'],
       'type': x['data']['tag']['amenity'],
       'lat': x['data']['lat'],
       'lon': x['data']['lon']} for x in filter_amenities(objects)]
    return {'center': {'lat': (min_lat + max_lat) / 2, 'lon': (min_lon + max_lon) / 2},
            'streets': remove_duplicates(streets),
            'buildings': buildings,
            'amenities': amenities}


if __name__ == '__main__':
    objects = describe_objects(min_lat, min_lon, max_lat, max_lon)
    pp.pprint(objects)