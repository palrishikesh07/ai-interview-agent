export function validateInterviewInput(
  topic: string,
  answer: string
) {
  if (!topic?.trim()) {
    return false;
  }

  if (!answer?.trim()) {
    return false;
  }

  return true;
}