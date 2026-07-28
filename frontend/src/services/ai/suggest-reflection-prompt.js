/*
 * 실제 AI 연동 지점. 지금은 오늘 일정 완료율 기반의 규칙 기반 목업이며,
 * 나중에 이 함수 내부만 실제 API 호출로 교체하면 됩니다. 시그니처(입력/출력 shape)는 유지하세요.
 *
 * @param {{ dailyIntent: string, schedules: Array<{completed: boolean}> }} input
 * @returns {Promise<string>}
 */
export function suggestReflectionPrompt(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildPrompt(input))
    }, 700)
  })
}

function truncate(text, max = 24) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function buildPrompt({ dailyIntent, schedules }) {
  const total = schedules.length
  const intentQuote = dailyIntent ? `"${truncate(dailyIntent)}"` : null

  if (total === 0) {
    return intentQuote
      ? `오늘 계획했던 ${intentQuote}를 향해 어떤 하루를 보내셨나요?`
      : '오늘 하루는 어떠셨나요? 기억에 남는 순간을 적어보세요.'
  }

  const done = schedules.filter((s) => s.completed).length
  const rate = Math.round((done / total) * 100)

  if (rate >= 80) {
    return intentQuote
      ? `${intentQuote} 계획대로 ${total}개 중 ${done}개를 완료했어요. 특히 잘 풀린 일은 무엇이었나요?`
      : `오늘 ${total}개 중 ${done}개를 완료했어요. 특히 잘 풀린 일은 무엇이었나요?`
  }
  if (rate <= 30) {
    return intentQuote
      ? `${intentQuote}를 계획했지만 오늘은 잘 안 풀린 하루였네요. 무엇이 발목을 잡았는지 적어보세요.`
      : '오늘은 계획대로 잘 안 풀린 하루였네요. 무엇이 발목을 잡았는지 적어보세요.'
  }
  return intentQuote
    ? `${intentQuote} 계획 중 ${done}/${total}개를 완료했어요. 다음엔 어떻게 하면 더 나아질지 생각해보세요.`
    : `오늘 ${done}/${total}개를 완료했어요. 다음엔 어떻게 하면 더 나아질지 생각해보세요.`
}
