from yandex_geocoder import Client


def get_text_by_coordinates(coordinates):
    try:
        result = Client.request(f'{coordinates[1]}, {coordinates[0]}')
        return result['GeoObjectCollection']['featureMember'][0]['GeoObject']['name']
    except Exception as e:
        print(e)
        return None


