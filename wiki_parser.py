import json
from street_predictor import parse_summary

result = {}

with open('c:\docs\streets.txt', 'r', encoding='utf-8') as f:
    for l in f:
        street = l.strip()
        print(street)
        success, summary = parse_summary(street)
        if success:
            result[street] = summary

with open('c:\docs\streets-with-descriptions.txt', 'w+', encoding='utf-8') as f:
    f.write(json.dumps(result, indent=4, ensure_ascii=False))
