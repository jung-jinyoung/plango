# 디자인 토큰

소스: `src/css/tokens.css`, `src/css/quasar.variables.scss`. Figma에는 `Plango Tokens` 변수 컬렉션(1 mode: `Value`)으로 동일하게 생성해뒀다 (`docs/figma-design-system` 세션, Figma MCP 호출 한도로 Phase 1까지만 완료 — 아래 표가 그 시점의 소스 오브 트루스).

## 색상

| 이름 | Hex | CSS 변수 | 용도(scope) |
|---|---|---|---|
| bg | `#f2f3f5` | `--p-bg` | 배경 |
| surface | `#f8f9fa` | `--p-surface` | 배경(카드/표면) |
| ink | `#20232a` | `--p-ink` | 본문 텍스트 |
| ink-muted | `#5b6270` | `--p-ink-muted` | 보조 텍스트 |
| ink-faint | `#8c919c` | `--p-ink-faint` | 희미한 텍스트(placeholder 등) |
| rose | `#d9738c` | `--p-rose` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| rose-ink | `#a34a63` | `--p-rose-ink` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| lavender | `#7a6bc9` | `--p-lavender` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| lavender-ink | `#4b3b8c` | `--p-lavender-ink` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| green | `#10b981` | `--p-green` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| green-ink | `#0b7a57` | `--p-green-ink` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| blue | `#3b82f6` | `--p-blue` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| blue-ink | `#1d4ed8` | `--p-blue-ink` | 브랜드/카테고리 — 배경/텍스트/테두리 |
| amber | `#e8a23d` | `--p-amber` | 카테고리 색상(8번째 슬롯) + Quasar `$warning` 시맨틱 슬롯 겸용 |
| amber-ink | `#a66d1f` | `--p-amber-ink` | 카테고리 색상 |
| teal | `#1ca9b0` | `--p-teal` | 카테고리 색상(2026-07 추가) |
| teal-ink | `#0f7a80` | `--p-teal-ink` | 카테고리 색상 |
| plum | `#a855c9` | `--p-plum` | 카테고리 색상(2026-07 추가) |
| plum-ink | `#7a3a94` | `--p-plum-ink` | 카테고리 색상 |
| slate | `#64748b` | `--p-slate` | 카테고리 색상(2026-07 추가, 중성/저채도 슬롯) |
| slate-ink | `#3f4a5a` | `--p-slate-ink` | 카테고리 색상 |
| negative | `#dc2626` | 없음(`$negative`, Quasar SCSS 전용) | **선언만 됨, 커스텀 컴포넌트 미사용** |
| focus-ring | = blue | `--p-focus-ring` | 포커스 아웃라인 전용 (blue와 동일 값) |

> 카테고리 색상 슬롯은 2026-07-10부로 4개(rose/blue/green/lavender)에서 8개(+amber/teal/plum/slate)로 확장됐다 — 백엔드 `categories` 리소스가 최대 8개까지 지원하는 데 맞춰 1:1 매핑. 아래 Figma 반영 상태는 4색 시점 스냅샷이라 재동기화가 필요하다.

## Radius

| 이름 | 값 | CSS 변수 |
|---|---|---|
| xs | 8px | `--p-radius-xs` |
| sm | 11px | `--p-radius-sm` |
| md | 18px | `--p-radius-md` |
| lg | 26px | `--p-radius-lg` |

## 그림자 (뉴모픽, 이중 그림자 레시피)

| 이름 | CSS 변수 | 레시피 |
|---|---|---|
| raised | `--p-shadow-raised` | `8px 8px 18px rgba(148,157,178,.35), -8px -8px 18px rgba(255,255,255,.9)` |
| raised-hover | `--p-shadow-raised-hover` | `5px 5px 12px rgba(148,157,178,.35), -5px -5px 12px rgba(255,255,255,.9)` |
| raised-sm | `--p-shadow-raised-sm` | `4px 4px 9px rgba(148,157,178,.32), -4px -4px 9px rgba(255,255,255,.85)` |
| sunken | `--p-shadow-sunken` | `inset 3px 3px 7px rgba(148,157,178,.3), inset -3px -3px 7px rgba(255,255,255,.85)` |
| pressed | `--p-shadow-pressed` | `inset 5px 5px 11px rgba(148,157,178,.42), inset -5px -5px 11px rgba(255,255,255,.75)` |

## 타이포그래피

폰트: **Pretendard Variable** (fallback: -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, sans-serif). 코드에는 중앙화된 type scale이 없고 컴포넌트마다 개별 rem 값을 씀 — 아래는 실제 사용 빈도를 조사해서 새로 정리한 스케일이다(코드에 이미 존재하던 공식 스케일이 아님, 원한다면 앞으로 컴포넌트 CSS를 이 스케일로 마이그레이션할 수 있음).

| 이름 | 크기 | Weight | 비고 |
|---|---|---|---|
| display | 3.5rem (56px) | 800 | 랜딩 히어로, 1회성 |
| heading-lg | 1.5rem (24px) | 700 | |
| heading-md | 1.15rem (18.4px) | 700 | |
| heading-sm | 1.02rem (16.3px) | 700 | 카드/섹션 제목, 코드에서 가장 흔한 heading 크기(7회) |
| body | 0.9rem (14.4px) | 400(기본) | 코드에서 가장 흔한 본문 크기(0.88~0.92rem 군집, 31회) |
| body-sm | 0.85rem (13.6px) | 400(기본) | 두 번째로 흔한 본문 크기(0.8~0.85rem 군집, 36회) |
| caption | 0.72rem (11.5px) | 600 | 배지/메타 텍스트 |

Figma에는 원격 MCP 서버가 로컬 폰트를 못 읽어서 **Noto Sans KR**로 대체 생성했다 (Pretendard는 Google Fonts/Figma 클라우드 카탈로그에 없음 — 시각적 근사치일 뿐 동일 폰트 아님).

## Figma 반영 상태

- ✅ 색상 14개(위 표, focus-ring 포함) — Figma 변수로 생성·바인딩 완료
- ✅ Radius 4개 — Figma 변수로 생성 완료
- ✅ 그림자 5종 — Figma Effect Style로 생성 완료
- ✅ 타이포그래피 7종 — Figma Text Style로 생성 완료 (Noto Sans KR)
- ⏸ Foundations 문서 페이지(스와치/스펙시멘 시각화), 컴포넌트별 매핑 시각화 — Figma MCP 호출 한도(팀 좌석이 View, 월 6회)로 중단. 재개 방법은 `components.md` 하단 참고.
