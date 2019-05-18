from osmapi import OsmApi
import pprint

Api = OsmApi()
pp = pprint.PrettyPrinter(indent=4)

min_lon, min_lat, max_lon, max_lat = 60.6212975275,56.8312958592,60.6300522578,56.8366839585

def remove_duplicates(l):
    return [dict(t) for t in {tuple(d.items()) for d in l}]

def get_objects_from_square(min_lon, min_lat, max_lon, max_lat):
    return Api.Map(min_lon, min_lat, max_lon, max_lat)
 
def filter_streets(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'highway' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))

def filter_amenities(objects):
    return list(filter(lambda o: 
    o['data']['tag'] != {}
    and 'lat' in o['data']
    and 'lon' in o['data']
    and 'amenity' in o['data']['tag']
    and 'name' in o['data']['tag'], objects))

def describe_objects(min_lon, min_lat, max_lon, max_lat):
    objects = get_objects_from_square(min_lon, min_lat, max_lon, max_lat)
    streets = [
      {'name': x['data']['tag']['name']} for x in filter_streets(objects)
    ]

    amenities = [
      {'name': x['data']['tag']['name'],
       'type': x['data']['tag']['amenity'],
       'lat': x['data']['lat'],
       'lon': x['data']['lon']} for x in filter_amenities(objects)]
    return {'center': {'lat': (min_lat + max_lat) / 2, 'lon': (min_lon + max_lon) / 2},
            'streets': remove_duplicates(streets),
            'amenities': remove_duplicates(amenities)}


objects = describe_objects(min_lon, min_lat, max_lon, max_lat)
pp.pprint(objects)