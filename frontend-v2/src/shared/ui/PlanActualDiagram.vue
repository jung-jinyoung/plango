<template>
  <!-- 소개용 도식 — 실제 데이터가 아니라 "계획을 지우지 않고 실제와 나란히" 한 장면만 그린다.
       타임라인(ScheduleTimeline)의 시각 언어를 그대로 따르되 크게 단순화했다. -->
  <figure class="diagram" aria-label="계획 1시간 옆에 실제 1시간 45분이 나란히 남은 타임라인 예시">
    <div class="grid">
      <div class="hour" style="--row: 0"><span>09:00</span></div>
      <div class="hour" style="--row: 1"><span>10:00</span></div>
      <div class="hour" style="--row: 2"><span>11:00</span></div>
      <div class="hour" style="--row: 3"><span>12:00</span></div>

      <div class="ghost" style="--top: 0; --height: 1">
        <b>계획</b>
        <small>1시간</small>
      </div>
      <div class="real" style="--top: 0; --height: 1.75">
        <b>논문 결과표 초안</b>
        <small>1시간 45분</small>
        <span class="delta">+45분</span>
      </div>

      <div class="now" style="--top: 2.4">
        <span>지금</span>
      </div>

      <div class="planned" style="--top: 2.6; --height: 1">
        <b>그래프 다듬기</b>
        <small>1시간 예상</small>
      </div>
    </div>

    <figcaption class="legend">
      <i><span class="sw sw-ghost" />원래 계획</i>
      <i><span class="sw sw-real" />실제</i>
      <i><span class="sw sw-now" />지금</i>
    </figcaption>
  </figure>
</template>

<style scoped>
.diagram {
  --hour: 76px;
  margin: 0;
  background: var(--surface-card);
  border-radius: var(--radius-card);
  padding: 28px 24px 20px;
}
.grid {
  position: relative;
  height: calc(var(--hour) * 3.65);
  margin-left: 52px;
}
.hour {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--row) * var(--hour));
  border-top: 1px solid var(--border);
}
.hour span {
  position: absolute;
  left: -52px;
  top: -8px;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.ghost,
.real,
.planned {
  position: absolute;
  top: calc(var(--top) * var(--hour) + 2px);
  height: calc(var(--height) * var(--hour) - 4px);
  border-radius: var(--radius-block);
  padding: 10px 12px;
  overflow: hidden;
}
.ghost {
  left: 0;
  width: 34%;
  border: 1.5px dashed var(--text-muted);
  color: var(--text-muted);
}
.real {
  left: calc(34% + 8px);
  right: 0;
  background: var(--cat-blue-tint);
  color: var(--cat-blue-deep);
}
.planned {
  left: 0;
  right: 0;
  background: var(--cat-blue-tint);
  color: var(--cat-blue-deep);
}
b {
  display: block;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.ghost b {
  font-size: 13px;
  font-weight: 600;
}
small {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}
.delta {
  display: inline-block;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
}
/* 현재 시각 바 — 로즈 허용 위치(CLAUDE.md 7절). 플라밍고는 히어로 로고와 겹치지 않도록 넣지 않는다 */
.now {
  position: absolute;
  left: -52px;
  right: 0;
  top: calc(var(--top) * var(--hour));
  border-top: 2px solid var(--rose-500);
  z-index: 1;
}
.now span {
  position: absolute;
  left: 0;
  top: -9px;
  padding-right: 6px;
  background: var(--surface-card);
  font-size: 12px;
  font-weight: 700;
  color: var(--rose-600);
}
.legend {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.legend i {
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: normal;
  font-size: 12px;
  color: var(--text-muted);
}
.sw {
  width: 16px;
  height: 10px;
  border-radius: 3px;
}
.sw-ghost {
  border: 1.5px dashed var(--text-muted);
}
.sw-real {
  background: var(--cat-blue-tint);
}
.sw-now {
  height: 0;
  border-top: 2px solid var(--rose-500);
  border-radius: 0;
}
</style>
