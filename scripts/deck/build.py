import base64, json, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
shots = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
tpl = (root / 'scripts/deck/deck.template.html').read_text()
def b64(p): return base64.b64encode(p.read_bytes()).decode()
f = root / 'src/fonts'
rep = {
 '%%NUNITO400%%': b64(f/'nunito-latin-400-normal.woff2'),
 '%%NUNITO700%%': b64(f/'nunito-latin-700-normal.woff2'),
 '%%CAVEAT600%%': b64(f/'caveat-latin-600-normal.woff2'),
 '%%DEVA400%%': b64(f/'noto-sans-devanagari-devanagari-400-normal.woff2'),
 '%%DEVA700%%': b64(f/'noto-sans-devanagari-devanagari-700-normal.woff2'),
}
m = {p.stem: 'data:image/jpeg;base64,' + b64(p) for p in sorted(shots.glob('*.jpg'))}
rep['%%SHOTS%%'] = json.dumps(m)
people = sorted(pathlib.Path(sys.argv[4]).glob('*.jpg')) if len(sys.argv) > 4 and sys.argv[4] != '-' else []
rep['%%PEOPLE%%'] = json.dumps(['data:image/jpeg;base64,' + b64(p) for p in people])
art = pathlib.Path(sys.argv[5]) if len(sys.argv) > 5 else None
rep['%%ART%%'] = json.dumps({q.stem: 'data:image/jpeg;base64,' + b64(q) for q in sorted(art.glob('*.jpg'))} if art else {})
for k, v in rep.items(): tpl = tpl.replace(k, v)
out.write_text(tpl)
print(out, round(len(tpl)/1e6, 2), 'MB')

if len(sys.argv) > 3:
    full = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + tpl + '</body></html>'
    pathlib.Path(sys.argv[3]).write_text(full)
    print(sys.argv[3])
