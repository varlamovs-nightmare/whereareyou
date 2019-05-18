from osmapi import OsmApi
import pprint
import re

Api = OsmApi()
pp = pprint.PrettyPrinter(indent=4)

min_lon, min_lat, max_lon, max_lat = 30.3830262851,59.9141077326,30.4079171848,59.9222065257

def remove_duplicates(l):
    return [dict(t) for t in {tuple(d.items()) for d in l}]

def get_objects_from_square(min_lon, min_lat, max_lon, max_lat):
    return Api.Map(min_lon, min_lat, max_lon, max_lat)
 
def filter_streets(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'highway' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))

def filter_waterways(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'waterway' in o['data']['tag']
    and 'river' in o['data']['tag']['waterway']
    and 'name' in o['data']['tag'], objects))    

def filter_sightseeings(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and
    (('tourism' in o['data']['tag']
      and ('attraction' in o['data']['tag']['tourism']
          or 'artwork' in o['data']['tag']['tourism']
          or 'resort' in o['data']['tag']['tourism']
          or 'viewpoint' in o['data']['tag']['tourism']
          or 'museum' in o['data']['tag']['tourism']))
      or
      (('historic' in o['data']['tag']
        and ('memorial' in o['data']['tag']['historic']
          or 'monument' in o['data']['tag']['historic']
          or 'yes' in o['data']['tag']['historic']
          or 'building' in o['data']['tag']['historic']))))
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

def filter_districts(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'type' in o['data']['tag']
    and (o['data']['tag']['type'] == 'boundary' or 'boundary' in o['data']['tag'])
    and 'name' in o['data']['tag']
    and 'район' in o['data']['tag']['name'], objects))        

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
    sightseeings = [
      {'name': x['data']['tag']['name']} for x in filter_sightseeings(objects)
    ]
    districts = [
      {'name': x['data']['tag']['name']} for x in filter_districts(objects)
    ]
    rivers = [
      {'name': x['data']['tag']['name']} for x in filter_waterways(objects)
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
            'sightseeings': sightseeings,
            'districts': districts,
            'rivers': remove_duplicates(rivers),
            'amenities': amenities}


if __name__ == '__main__':
    objects = describe_objects(min_lat, min_lon, max_lat, max_lon)
    pp.pprint(objects)