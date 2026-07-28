/*
 * 실제 AI 연동 지점. 지금은 목표·어제 실행 데이터 기반의 규칙 기반 목업이며,
 * 나중에 이 함수 내부만 실제 API 호출로 교체하면 됩니다. 시그니처(입력/출력 shape)는 유지하세요.
 *
 * @param {{ topGoalTitle: string|null, yesterdayRate: number|null, weakCategoryName: string|null }} input
 * @returns {Promise<string>}
 */
export function suggestDailyIntent(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildSuggestion(input))
    }, 700)
  })
}

function buildSuggestion({ topGoalTitle, yesterdayRate, weakCategoryName }) {
  if (weakCategoryName) {
    return `어제 "${weakCategoryName}" 관련 일정을 많이 못 채웠어요. 오늘은 이 부분부터 챙겨보는 건 어때요?`
  }
  if (yesterdayRate != null && yesterdayRate >= 80) {
    return topGoalTitle
      ? `어제처럼 좋은 흐름이에요. 오늘도 "${topGoalTitle}"에 집중해보는 건 어떨까요?`
      : '어제처럼 좋은 흐름을 오늘도 이어가 볼까요?'
  }
  if (topGoalTitle) {
    return `"${topGoalTitle}" 목표를 위해 오늘 무엇을 할지 적어보세요.`
  }
  return '오늘 하루를 어떻게 보낼지 가볍게 적어보세요.'
}
