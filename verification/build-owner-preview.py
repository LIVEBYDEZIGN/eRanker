"""Build only the existing owner-private walkthrough. Never package this dist for customers."""
from pathlib import Path
import shutil
import re

root = Path(__file__).resolve().parents[1]
source = root / 'site'
target = root.parent / 'paid-flow-verification-2026-10-26' / 'dist'
for path in source.rglob('*'):
    if not path.is_file():
        continue
    output = target / path.relative_to(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, output)
    if output.suffix == '.html':
        text = output.read_text()
        # Normal script guards already block analytics off the public domain.
        # Remove the noscript iframe too, so private tests never report visits.
        text = re.sub(r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->', '', text, flags=re.S)
        output.write_text(text)

flow = target / 'test-flow.mjs'
text = flow.read_text()
assert text.count('location.assign(url);') == 1
text = text.replace('location.assign(url);', """// This one change exists only in the owner-private build.
        if (location.hostname !== 'eranker-paid-flow-check-20261026.eranker.chatgpt.site') throw new Error('private-only');
        location.assign('payment-complete.html?checkout=complete&email=' + encodeURIComponent(data.email));""")
flow.write_text(text)

checkout = target / 'checkout.html'
text = checkout.read_text()
marker = '<section class="intake-card" aria-labelledby="checkout-title">'
assert text.count(marker) == 1
text = text.replace(marker, marker + '<p style="font-size:12px;color:var(--muted);margin-bottom:20px">Private preview · Payment is simulated. No charge.</p>', 1)
checkout.write_text(text)
complete = target / 'payment-complete.html'
text = complete.read_text().replace('Payment complete · Receipt sent by email', 'Payment simulated · No charge')
complete.write_text(text)
assert 'location.assign(url);' in (source / 'test-flow.mjs').read_text()
assert 'Private preview' not in (source / 'checkout.html').read_text()
print('Owner preview prepared: actual HubSpot save, payment omitted, automatic WhatsApp; analytics off.')
