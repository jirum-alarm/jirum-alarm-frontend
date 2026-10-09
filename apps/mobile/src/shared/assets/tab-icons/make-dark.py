"""탭 아이콘 PNG 의 다크 변형 — 회색 선을 디자인 토큰(packages/design-system/tokens.js) dark 값으로, 흰 속채움은 투명으로.
가장자리 안티앨리어싱(두 색 사이의 섞인 픽셀)은 두 원색 사이의 비율 t 를 구해 새 색 쌍에 같은 비율로 섞는다."""
import glob, itertools
from PIL import Image
H = lambda h: tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
SRC = {'#101828': ('#E4E7EC', 255), '#667085': ('#A2ABBA', 255), '#9EF22E': ('#84CC2A', 255),
       '#EB001C': ('#EB001C', 255), '#FFFFFF': ('#FFFFFF', 0)}
src = [(H(k), H(v[0]), v[1]) for k, v in SRC.items()]
def mapc(c):
    best = None
    for (a, ta, aa), (b, tb, ab) in itertools.combinations(src, 2):
        d = [b[i]-a[i] for i in range(3)]; L = sum(x*x for x in d)
        t = max(0, min(1, sum((c[i]-a[i])*d[i] for i in range(3)) / L))
        p = [a[i]+t*d[i] for i in range(3)]; e = sum((c[i]-p[i])**2 for i in range(3))
        if best is None or e < best[0]:
            best = (e, tuple(round(ta[i]+t*(tb[i]-ta[i])) for i in range(3)), aa+t*(ab-aa))
    return best[1], best[2]
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
for f in sorted(glob.glob("*@3x.png")):
    if '-dark' in f: continue
    im = Image.open(f).convert('RGBA'); px = im.load(); cache = {}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            if (r, g, b) not in cache: cache[(r, g, b)] = mapc((r, g, b))
            rgb, alpha = cache[(r, g, b)]
            px[x, y] = (*rgb, round(a * alpha / 255))
    out = f.replace('@3x', '-dark@3x'); im.save(out); print(out)
