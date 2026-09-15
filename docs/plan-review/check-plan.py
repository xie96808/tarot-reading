#!/usr/bin/env python3
"""Documentation/source checks only. No application or production deployment tests."""
import argparse, hashlib, json, re, struct, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = '8973a0022f85c3c168f69079ef0df1a3752593f204d5dc47644bb2a5e9e68aa6'
ZIP_HASH = '3b54ec3ae4e4c86081a452c3f145d20f598c260150c4493c34be9e4086919b28'

def jpeg_size(data):
    assert data[:2] == b'\xff\xd8'
    i = 2
    while i < len(data):
        assert data[i] == 255
        while data[i] == 255: i += 1
        marker = data[i]; i += 1
        if marker in (0xD8, 0xD9): continue
        n = struct.unpack('>H', data[i:i+2])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack('>HH', data[i+3:i+7])
            return width, height
        i += n
    raise AssertionError('JPEG dimensions not found')

def run():
    ap = argparse.ArgumentParser()
    ap.add_argument('--mode', choices=['baseline','modified'], required=True)
    ap.add_argument('--document', type=Path, required=True)
    args = ap.parse_args()
    data = args.document.read_bytes(); text = data.decode()
    assert hashlib.sha256((ROOT/'docs/history/design.original-2026-09-16.md').read_bytes()).hexdigest() == ORIGINAL
    assert hashlib.sha256((ROOT/'RWS_78_aligned.zip').read_bytes()).hexdigest() == ZIP_HASH
    assert '烛下塔罗' in text and 'tarot.xieyw.top' in text and '无 LLM' in text
    print('PASS original backup and artwork SHA-256 unchanged')
    print('PASS brand/domain/no-LLM constraints retained')
    if args.mode == 'baseline':
        assert hashlib.sha256(data).hexdigest() == ORIGINAL
        for phrase in ['624 * 8', 'Math.floor(rng() * (i + 1))', '120–220', 'Disallow: /r/']:
            assert phrase in text, phrase
        print('CONFIRMED baseline has fixed random pool, float mapping, shared length budget, robots disallow')
        print('BASELINE SOURCE CHECKS COMPLETE (not application tests)')
        return
    assert len(re.findall(r'^```', text, re.M)) % 2 == 0
    headings = [int(n) for n in re.findall(r'^## (\d+)\.', text, re.M)]
    assert headings == list(range(16)), headings
    majors = re.findall(r'^\| `([0-2][0-9]_[^`]+)` \| [^|]+ \| [^|]+ \| (?:air|water|earth|fire) \| [^|]+ \|$',text,re.M)
    ranks = ['01_ace']+[str(n).zfill(2) for n in range(2,11)]+['page','knight','queen','king']
    expected = set(majors)|{f'{s}_{r}' for s in ['cups','pents','swords','wands'] for r in ranks}
    assert len(majors) == 22 and len(expected) == 78
    with zipfile.ZipFile(ROOT/'RWS_78_aligned.zip') as z:
        faces = [n for n in z.namelist() if n.startswith('RWS_78/aligned/') and n.endswith('.jpg')]
        assert {Path(n).stem for n in faces} == expected
        assert len(faces) == 78
        assert {jpeg_size(z.read(n)) for n in faces} == {(800,1280)}
        print('PASS document card mapping = ZIP: 22 majors + 56 minors; all 78 images 800x1280')
    contracts=['operationId','uniformInt','1024 字节','lexiconVersion','deckVersion',
        'R1_REPEAT','R2_TENSION','R3_TURN','R4_BRIDGE','Referrer-Policy: no-referrer',
        'private, no-store','个人留笺','默认未选','M0','M5','不能只用估算表当验收',
        '不是本轮已通过的测试结果','HTTP/ACME','同平台构建','上一']
    for value in contracts: assert value in text, value
    refs=re.findall(r'§(\d+)(?:\.(\d+))?',text)
    subheads=set(re.findall(r'^### (\d+\.\d+)',text,re.M))
    for section,sub in refs:
        assert int(section) in headings
        if sub: assert section+'.'+sub in subheads
    print('PASS 16 top-level sections, closed code fences, section references and core contracts')
    print(f'DOCUMENT_SHA256 {hashlib.sha256(data).hexdigest()}')
    print('MODIFIED DOCUMENT CHECKS COMPLETE (browser/production tests remain pending)')

if __name__ == '__main__': run()
