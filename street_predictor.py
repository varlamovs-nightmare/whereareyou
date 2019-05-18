import re
import wikipedia as w

w.set_lang('ru')


def parse_summary(query='str'):
    #print('query: ' + query)
    try:
        summary = w.summary(query)
        full_description = re.split(r'\) —', summary)[1]
        description = re.split(r'\.', full_description)[0]
        return True, description.strip()
    except Exception:
        return False, ''

if __name__ == '__main__':
    print(parse_summary('Бебеля'))
