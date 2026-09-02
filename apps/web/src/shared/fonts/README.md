# 웹폰트 — Pretendard Variable (서브셋)

`PretendardVariable.woff2` 는 **원본이 아니라 서브셋**이다. 원본 2,010 KB → **491 KB (76% 감소)**.

## 왜 서브셋인가

원본은 한글 음절 11,172자 전체 + 키릴 254 + 그리스 121 + 히라가나·가타카나 184 를 담아 2 MB 였고,
`preload: true` 라 **모든 페이지가 첫 요청에 이걸 받았다**. 모바일 총 전송량 4.7~5.1 MB 중 40% 가
이 파일 하나(2026-09-02 Lighthouse 실측, LCP 지연의 최대 단일 원인).

## 무엇을 담았나

- **한글**: KS X 1001 완성형 2,350자 + 종성 없는 음절 399자(조어에 흔함) = 2,400자
- 라틴(기본·확장), 통화, 문장부호, 화살표, 수학기호, 원문자, 도형, 기타 기호, 전각, 한글 호환 자모
- 가변축 `wght 45~930` **유지** (Tailwind 의 font-normal ~ font-bold 전부 정상)

## 무엇을 뺐나 — 그리고 왜 안전한가

희귀 한글 음절 8,772자, 키릴 254, 그리스 121, 라틴 추가 256, 히라가나·가타카나 184.

집행 전 실사용 텍스트로 검증했다(운영 HTML 24개 페이지 + RSS 30건, 한글 2.6만 글자·문자 813종):

| 검사 | 결과 |
| --- | --- |
| 서브셋에서 빠진 실사용 문자 | **1종** (`햏`, 출현 1회 = 0.008%) |
| 일본어·키릴·그리스·한자 등장 | **0종** (원본에 한자는 애초에 없음) |

빠진 글자는 `fonts.ts` 의 fallback 스택(Apple SD Gothic Neo·Noto Sans KR 등)으로 렌더된다.
글자 모양이 살짝 다를 수 있으나 **깨지지 않는다**.

## 재생성 방법

상품 제목에 희귀 음절이 늘어 폴백이 눈에 띄면 범위를 넓혀 다시 만든다.

```bash
# 1) 원본 받기 (이 레포엔 없음 — 서브셋만 커밋한다)
curl -LO https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2

# 2) 도구 (전역 오염 피하려면 venv)
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli

# 3) 한글 범위 파일 생성 — KS X 1001 완성형 2,350자 + 종성 없는 399자
/tmp/fontenv/bin/python - <<'PY'
syl=[]
for hi in range(0xB0,0xC9):
    for lo in range(0xA1,0xFF):
        try: ch=bytes([hi,lo]).decode('euc-kr')
        except UnicodeDecodeError: continue
        if 0xAC00<=ord(ch)<=0xD7A3: syl.append(ch)
ext=set(syl) | {chr(0xAC00+i*28) for i in range(19*21)}   # 종성 없는 음절
open('/tmp/hangul.txt','w',encoding='utf-8').write(''.join(sorted(ext)))
print(len(ext), '자')
PY

# 4) 서브셋
/tmp/fontenv/bin/pyftsubset PretendardVariable.woff2 \
  --output-file=apps/web/src/shared/fonts/PretendardVariable.woff2 --flavor=woff2 \
  --text-file=/tmp/hangul.txt \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F,U+02C6-02DC,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2100-214F,U+2150-218F,U+2190-21FF,U+2200-22FF,U+2300-23FF,U+2460-24FF,U+25A0-25FF,U+2600-26FF,U+2700-27BF,U+3000-303F,U+3130-318F,U+FE30-FE4F,U+FF00-FFEF" \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk' --no-hinting --desubroutinize
```

## 하지 않은 것

**유니코드 범위 분할**(`unicode-range` 로 조각 5개, 첫 화면 454 KB + 나머지 지연 로드)은
커버리지 손실이 0 이라 더 좋지만, `next/font/local` 이 `unicodeRange` 를 지원하지 않는다
(`src` 배열은 `path`/`weight`/`style` 만 받고, `declarations` 는 전체 @font-face 공통).
직접 `@font-face` 를 쓰면 preload·`adjustFontFallback` 메트릭 조정을 수동 관리해야 해서 보류했다.
폴백이 실제로 문제가 되면 그때 검토한다.
