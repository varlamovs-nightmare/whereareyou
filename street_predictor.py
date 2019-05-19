import re
import wikipedia as w
import json

cache = dict()

with open('streets-with-descriptions.txt', 'r', encoding='utf-8') as f:
    streets = json.loads(f.read())

    for kv in streets:
        if kv[0].strip():
            cache[kv[0].strip()] = True, kv[1].strip()
        else:
            cache[kv[0].strip()] = False, ''


def parse_summary(query='str', lang='ru'):
    if query in cache:
        return cache[query]

    try:
        w.set_lang(lang)
        summary = w.summary(query)

        full_description = re.split(r'\) —', summary)[-1]
        description = re.split(r'\.', full_description)[0]

        cache[query] = (True, description.strip())

        return True, description.strip()
    except Exception:
        cache[query] = (False, '')
        return False, ''


if __name__ == '__main__':
    print(parse_summary('Серова'))
