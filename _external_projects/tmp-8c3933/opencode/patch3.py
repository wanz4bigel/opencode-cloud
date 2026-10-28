import io
J = '/home/runner/bali-wisata/assets/js/app.js'
s = io.open(J, encoding='utf-8').read()
koord = [
 ('50, y: 69.3', '50.5, y: 65.4'),
 ('57.2, y: 78.7', '59.2, y: 77.1'),
 ('33, y: 62,', '33, y: 60.7,'),
 ('40, y: 56.8', '41, y: 56.8'),
 ('52, y: 60.4', '52.8, y: 58.2'),
 ('51.2, y: 52.9', '51.5, y: 53.5'),
 ('58.5, y: 42.1', '57.5, y: 50.4'),
 ('39.2, y: 43.6', '39.2, y: 46.8'),
 ('30, y: 38.4', '33, y: 43.9'),
 ('70, y: 56.8', '69, y: 57.1'),
 ('78.2, y: 52.9', '78.2, y: 53.6'),
 ('84.8, y: 43.2', '85.2, y: 43.6'),
 ('76.2, y: 61.1', '74.2, y: 61.1'),
 ('7.2, y: 54.6', '7, y: 53.6'),
]
miss = []
for a, b in koord:
    if a in s:
        s = s.replace(a, b, 1)
    else:
        miss.append(a)
io.open(J, 'w', encoding='utf-8').write(s)
print('MISSING:', miss)
