// 데모용 초기 데이터. 실제 서비스에서는 로그인한 사용자의 DB 데이터로 대체됩니다.
// goalId가 있는 항목은 목표 진행률(달성률 내림차순 정렬) 데모용으로 오늘 날짜에만
// 추가한 것이며, 과거 날짜에는 가짜 데이터를 넣지 않습니다.
//
// 아래 goalId는 로컬 백엔드(localhost:8000)에 미리 만들어둔 주간 목표 UUID다 —
// "블로그 글쓰기"(rose) 100%, "운동 루틴 만들기"(teal) 50%, "독서 목표"(amber) 0%
// 순으로 진행률이 갈리도록 구성해 정렬 확인용 데모로 쓴다. 해당 목표가 백엔드에서
// 삭제되면 goalId가 아무 목표와도 매칭되지 않아 단순히 태그 없는 할 일로 표시된다.
export function seedTodosForToday() {
  return [
    { title: '팀 회의 자료 준비', estimatedMinutes: 45, deadlineMinutes: 11 * 60 },
    { title: '운동 30분', estimatedMinutes: 30, deadlineMinutes: null },
    {
      title: '글감 아이디어 정리',
      estimatedMinutes: 40,
      deadlineMinutes: null,
      goalId: '2bd10dd6-4a52-44ef-8b0d-f160d50b83e4', // 글감 리서치 (블로그 글쓰기)
      done: true,
    },
    {
      title: '레퍼런스 글 3개 스크랩',
      estimatedMinutes: 20,
      deadlineMinutes: null,
      goalId: '2bd10dd6-4a52-44ef-8b0d-f160d50b83e4', // 글감 리서치 (블로그 글쓰기)
      done: true,
    },
    {
      title: '홈트 3분할 루틴 정리',
      estimatedMinutes: 30,
      deadlineMinutes: null,
      goalId: 'bdec2fb9-d063-4b3b-81cb-967bb0b27489', // 홈트 루틴 정리 (운동 루틴 만들기)
      done: true,
    },
    {
      title: '유튜브 홈트 영상 스크랩',
      estimatedMinutes: 15,
      deadlineMinutes: null,
      goalId: 'bdec2fb9-d063-4b3b-81cb-967bb0b27489', // 홈트 루틴 정리 (운동 루틴 만들기)
    },
    {
      title: '이번 달 읽을 책 목록 정리',
      estimatedMinutes: 20,
      deadlineMinutes: null,
      goalId: '4adaa2f5-3808-410d-9298-f93d617ceeb1', // 책 목록 정리 (독서 목표)
    },
  ]
}
