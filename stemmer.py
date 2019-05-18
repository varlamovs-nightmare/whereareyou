import snowballstemmer
stemmer = snowballstemmer.stemmer('russian');
import sys, re
bad_characters_regex = re.compile(r'[^a-zа-я0-9-+,.;"\'()/!?\s]')
punctuation_regex = re.compile(r'[-+,.;"\'()/!?]')
many_spaces_regex = re.compile(r' +')

def normalize(line):
    result = line.lower()
    result = result.replace('ё', 'е')
    result = re.sub(punctuation_regex, ' \g<0> ', result)
    result = re.sub(bad_characters_regex, ' ', result)
    result = re.sub(many_spaces_regex, ' ', result)

    return result.strip()


def stemming(word):
    return stemmer.stemWord(word)

def text_stemming(text):
    normilized_text = normalize(text)
    return ' '.join(stemmer.stemWords(normilized_text.split()))
