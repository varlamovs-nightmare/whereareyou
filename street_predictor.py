import re
import wikipedia as w

w.set_lang('ru')

cache = dict()


def parse_summary(query='str'):
    if query in cache:
        return cache[query]

    try:
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
