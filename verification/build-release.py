#!/usr/bin/env python3
"""Build only the production site and Vadim's release instructions."""
import hashlib
import json
import re
import subprocess
import tempfile
import zipfile
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

BASE = Path(__file__).resolve().parents[1]
SITE = BASE / 'site'
ARCHIVE = BASE / 'eRanker-ready-for-Vadim-intake-first-2026-10-26.zip'
files = sorted(p for p in SITE.rglob('*') if p.is_file())
assert files and all(not p.is_symlink() for p in files)
assert all(not any(part.startswith('.') for part in p.relative_to(SITE).parts) for p in files)
for p in files:
    if p.suffix in {'.html', '.js', '.mjs', '.css'}:
        text = p.read_text()
        for forbidden in ['Payment simulated', 'Payment is simulated', 'Private preview', 'Website preview (no payment)', 'Website flow test', 'test2000@gmail.com']:
            assert forbidden.lower() not in text.lower(), (p, forbidden)
    assert p.name not in {'flow-preview.html', 'callback-fixture.html'}

flow = (SITE / 'test-flow.mjs').read_text()
assert "export const PAYMENT_LINK_ID = '10567449'" in flow
assert 'const url = await saveAndCreateCheckout(data, { pageUri: location.href });' in flow
assert 'location.assign(url);' in flow
assert "payments-na1.hubspot.com" in flow
assert "location.replace(url)" in flow
assert "10567449" in (BASE / 'README-FOR-VADIM.md').read_text()
assert 'https://eranker.net/payment-complete.html?checkout=complete' in (BASE / 'README-FOR-VADIM.md').read_text()
assert 'google-site-verification=aPfDsdoCKlJ0JflkrOH8D5vjZQ8HWZhVo7k8hIPHPYc' in (BASE / 'DNS-FOR-VADIM.txt').read_text()

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.ids = []
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        for key in ['src', 'href', 'poster']:
            if attrs.get(key):
                self.refs.append(attrs[key])

refs_checked = 0
html_count = 0
for p in files:
    if p.suffix == '.html':
        html_count += 1
        text = p.read_text()
        assert text.count('GTM-WLTZBCJ4') == 2, p
        assert '<!-- Google Tag Manager -->' in text.split('</head>')[0], p
        assert re.search(r'<body[^>]*>\s*<!-- Google Tag Manager \(noscript\) -->', text), p
        doc = Document()
        doc.feed(text)
        assert not [key for key, count in Counter(doc.ids).items() if count > 1], p
        for value in doc.refs:
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            target = (SITE / unquote(url.path.lstrip('/'))) if url.path.startswith('/') else p.parent / unquote(url.path)
            target = target.resolve()
            assert target.is_relative_to(SITE.resolve()), (p, value)
            if target.is_dir():
                target = target / 'index.html'
            assert target.is_file(), (p, value)
            refs_checked += 1
    if p.suffix in {'.js', '.mjs'}:
        subprocess.run(['node', '--check', str(p)], check=True, capture_output=True)

matrix = json.loads((BASE / 'verification/release-responsive.json').read_text())
assert len(matrix) == 56
assert len({r['path'] for r in matrix}) == 7
assert {r['width'] for r in matrix} == {320, 360, 390, 430, 768, 1024, 1440, 1920}
assert all(not r['overflow'] and not r['brokenLoadedImages'] and not r['simulatedCopy'] and not any(i['outside'] for i in r['inputs']) for r in matrix)

contents = {str(Path('site') / p.relative_to(SITE)): p.read_bytes() for p in files}
for name in ['README-FOR-VADIM.md', 'DNS-FOR-VADIM.txt']:
    contents[name] = (BASE / name).read_bytes()
manifest = ''.join(f'{hashlib.sha256(data).hexdigest()}  {name}\n' for name, data in sorted(contents.items()))
contents['RELEASE-MANIFEST.sha256'] = manifest.encode()
temp_archive = ARCHIVE.with_suffix('.zip.tmp')
with zipfile.ZipFile(temp_archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name, data in sorted(contents.items()):
        z.writestr(name, data)
with zipfile.ZipFile(temp_archive) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(contents)
    with tempfile.TemporaryDirectory(prefix='eranker-release-verify-') as temp:
        z.extractall(temp)
        for name, data in contents.items():
            assert (Path(temp) / name).read_bytes() == data, name
temp_archive.replace(ARCHIVE)
receipt = {
    'archive': ARCHIVE.name,
    'bytes': ARCHIVE.stat().st_size,
    'files': len(contents),
    'sha256': hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),
    'source_equality': True,
    'status': 'ready_for_vadim_publication',
    'payment': 'native HubSpot checkout 10567449; no simulation',
    'test_fixtures_in_release': False,
    'dns_instructions_included': True,
    'production_callback_change_required': True,
    'html_pages_with_gtm': html_count,
    'local_references_checked': refs_checked,
    'responsive_page_size_combinations': len(matrix),
    'zip_crc_and_extracted_hashes': 'passed'
}
(BASE / 'verification/package.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
