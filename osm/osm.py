from osmapi import OsmApi
import pprint

Api = OsmApi()

min_lon, min_lat, max_lon, max_lat = 60.5906827939,56.8322320824,60.5942769539,56.834157283


def get_objects_from_square(min_lon, min_lat, max_lon, max_lat):
    objects = Api.Map(min_lon, min_lat, max_lon, max_lat)
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'lat' in o['data']
    and 'lon' in o['data']
    and 'amenity' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))
 

def describe_objects(min_lon, min_lat, max_lon, max_lat):
    objects =  [
      {'name': x['data']['tag']['name'],
       'lat': x['data']['lat'],
      'lon': x['data']['lon']} for x in get_objects_from_square(min_lon, min_lat, max_lon, max_lat)]
    return {'center': {'lat': (min_lat + max_lat) / 2, 'lon': (min_lon + max_lon) / 2},
            'objects': objects}


objects = describe_objects(min_lon, min_lat, max_lon, max_lat)
print(objects)