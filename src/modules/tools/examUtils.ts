export function getShuffledQuestionOrder(
  examId: string,
  questions: { id: number }[]
) {
  const storageKey = `simulator_${examId}_question_order`;
  const savedOrder = localStorage.getItem(storageKey);
  if (savedOrder) {
    const savedIds = JSON.parse(savedOrder);
    return savedIds
      .map((id: number) => questions.find((q) => q.id === id))
      .filter(Boolean);
  }
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  localStorage.setItem(storageKey, JSON.stringify(shuffled.map((q) => q.id)));
  return shuffled;
}
