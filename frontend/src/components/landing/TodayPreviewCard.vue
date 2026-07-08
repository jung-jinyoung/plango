<template>
  <div
    class="today-card neu-raised"
    role="img"
    aria-label="오늘 하루 계획 미리보기: 할 일 목록과 AI가 추천한 시간대별 일정"
  >
    <div class="today-head">
      <span class="today-date">오늘 · 7월 7일 (화)</span>
      <span class="ai-chip">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
          />
        </svg>
        AI 추천
      </span>
    </div>

    <div class="todo-row done">
      <span class="todo-check done"></span>
      <span>기획서 초안 정리</span>
    </div>
    <div class="todo-row">
      <span class="todo-check"></span>
      <span>팀 회의 자료 준비</span>
    </div>
    <div class="todo-row">
      <span class="todo-check"></span>
      <span>운동 30분</span>
    </div>

    <div class="ai-note neu-sunken">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--p-lavender)"
        stroke-width="2.2"
        style="flex-shrink: 0; margin-top: 2px"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5h8c0-2 1-3 1-5a5 5 0 0 0-5-5Z" />
        <path d="M9 19h6M10 22h4" />
      </svg>
      <span>마감이 임박한 "팀 회의 자료"를 오전으로, "운동"은 저녁 여유 시간에 배치했어요.</span>
    </div>

    <div class="timeline">
      <div class="tl-row">
        <span class="tl-time">09:00</span>
        <div class="tl-block rose">팀 회의 자료 준비</div>
      </div>
      <div class="tl-row">
        <span class="tl-time">13:00</span>
        <div class="tl-block blue">기획서 초안 정리</div>
      </div>
      <div class="tl-row">
        <span class="tl-time">19:00</span>
        <div class="tl-block green">운동 30분</div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.today-card {
  padding: 26px;
}
.today-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.today-date {
  font-weight: 700;
  font-size: 1.05rem;
}
.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
}
.todo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
}
.todo-check {
  width: 20px;
  height: 20px;
  border-radius: 7px;
  flex-shrink: 0;
  box-shadow: var(--p-shadow-sunken);
}
.todo-check.done {
  background: var(--p-green);
  box-shadow: none;
}
.todo-row span {
  font-size: 0.92rem;
  color: var(--p-ink-muted);
}
.todo-row.done span {
  color: var(--p-ink-faint);
  text-decoration: line-through;
}
.ai-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 16px 0;
  padding: 12px 14px;
  font-size: 0.83rem;
  color: var(--p-ink-muted);
}
.timeline {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tl-row {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 12px;
  align-items: center;
}
.tl-time {
  font-size: 0.75rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
}
.tl-block {
  padding: 11px 14px;
  border-radius: var(--p-radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
}
.tl-block.rose {
  background: color-mix(in srgb, var(--p-rose) 16%, var(--p-surface));
  color: var(--p-rose-ink);
}
.tl-block.blue {
  background: color-mix(in srgb, var(--p-blue) 14%, var(--p-surface));
  color: color-mix(in srgb, var(--p-blue) 70%, #05264d);
}
.tl-block.green {
  background: color-mix(in srgb, var(--p-green) 14%, var(--p-surface));
  color: color-mix(in srgb, var(--p-green) 65%, #063d24);
}
</style>
