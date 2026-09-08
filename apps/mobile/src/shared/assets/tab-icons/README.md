# 탭 아이콘

`@3x`(72×72 RGBA) PNG 만 둔다. 네이티브 탭바(`createNativeBottomTabNavigator`)는
컴포넌트가 아니라 **이미지**를 받으므로 SVG 아이콘과 별도로 필요하다.
JS 탭바(iOS 26 미만·Android)는 `shared/components/icons` 의 SVG 를 쓴다.

## 알림 점(`alert-dot`, `alert-fill-dot`)은 생성물이다

미읽음 표시를 **아이콘에 그려 넣은** 변형이다. 손으로 그리지 말고 아래로 재생성한다.

왜 뱃지가 아닌가:
- iOS 26 시스템 뱃지(`badgeValue`)는 **크기를 줄일 수 없다**(지름 ~20pt). web·JS 탭바의
  8pt 점보다 훨씬 커서 "너무 크다"는 지적을 받았다.
- 빈 문자열을 주면 iOS 에선 **뱃지가 아예 안 뜬다** — `react-native-screens` 문서의
  "빈 문자열 = 작은 점"은 **Android 전용** 동작이다(실측 확인).

규격은 web `shared/ui/layout/BottomNav.tsx` 와 JS 탭바 `badgeDot` 과 같다:
지름 8pt · `#EB001C` · 아이콘 박스 우상단.

```bash
cd apps/mobile && python3 - <<'PY'
from PIL import Image, ImageDraw
import os
D = 'src/shared/assets/tab-icons'
DOT_D, CX, CY, COLOR = 24, 60, 12, (0xEB, 0x00, 0x1C, 255)  # @3x: 8pt=24px
for src, dst in [('alert@3x.png', 'alert-dot@3x.png'),
                 ('alert-fill@3x.png', 'alert-fill-dot@3x.png')]:
    im = Image.open(os.path.join(D, src)).convert('RGBA')
    assert im.size == (72, 72), im.size
    d = ImageDraw.Draw(im)
    r = DOT_D // 2
    d.ellipse([CX - r, CY - r, CX + r, CY + r], fill=COLOR)
    im.save(os.path.join(D, dst))
PY
```

원본(`alert@3x.png`·`alert-fill@3x.png`)이 바뀌면 **반드시 다시 돌린다.**
