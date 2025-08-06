export function getShuffledOptions(
  examId: string,
  questionId: number,
  options: { id: number }[]
) {
  const storageKey = `simulator_${examId}_q${questionId}_option_order`;
  const savedOrder = localStorage.getItem(storageKey);
  if (savedOrder) {
    const savedIds = JSON.parse(savedOrder);
    return savedIds
      .map((id: number) => options.find((o) => o.id === id))
      .filter(Boolean);
  }

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  localStorage.setItem(storageKey, JSON.stringify(shuffled.map((o) => o.id)));
  return shuffled;
}
