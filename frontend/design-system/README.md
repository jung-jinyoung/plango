# Design System

Figma와 실제 구현(`src/css/tokens.css`, `src/components/ui/*`)을 대조해 정리하는 공식 디자인 시스템 문서 위치입니다. (`docs/`는 개인 기획 메모 전용이라 gitignore 처리되어 있고, 이 폴더와는 별개입니다.)

## 구성

- [`tokens.md`](./tokens.md) — 색상/radius/그림자/타이포그래피 토큰. Figma `Plango Tokens` 변수 컬렉션과 동일하게 유지
- [`components.md`](./components.md) — 컴포넌트가 실제로 어떤 브랜드 컬러를 쓰는지 grep 기반으로 정리한 매핑

## 현재 상태

Figma MCP(원격 서버) 연결까지는 완료했고, 파일 `6Y0lN0gTKRi3kPE85yNox4`의 페이지 `72:2`에 색상/그림자/타이포그래피를 Figma Variables·Styles로 실제 생성했다. 이후 단계(Foundations 문서 페이지, 컴포넌트×컬러 시각화)는 **Figma MCP 호출 한도**(팀 좌석이 View — 월 6회)로 중단된 상태라, 같은 내용을 이 폴더의 마크다운으로 먼저 정리해뒀다. 좌석이 Dev/Full로 바뀌거나 월 한도가 리셋되면 `components.md` 하단의 재개 문구로 이어서 Figma 페이지에 시각화할 수 있다.
