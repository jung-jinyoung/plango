// 데모용 초기 데이터. 실제 서비스에서는 로그인한 사용자의 DB 데이터로 대체됩니다.
// goalId가 있는 항목은 목표 진행률 데모용으로 오늘 날짜에만 추가한 것이며,
// 과거 날짜에는 가짜 데이터를 넣지 않습니다.
export function seedTodosForToday() {
  return [
    { title: '기획서 초안 정리', estimatedMinutes: 60, deadlineMinutes: null, goalId: 'g-week-1' },
    { title: '팀 회의 자료 준비', estimatedMinutes: 45, deadlineMinutes: 11 * 60 },
    { title: '운동 30분', estimatedMinutes: 30, deadlineMinutes: null },
    {
      title: '캠페인 배너 시안 검토',
      estimatedMinutes: 20,
      deadlineMinutes: null,
      goalId: 'g-week-1',
      done: true,
    },
    {
      title: 'MVP 로그인 화면 와이어프레임',
      estimatedMinutes: 30,
      deadlineMinutes: null,
      goalId: 'g-week-2',
      done: true,
    },
  ]
}
