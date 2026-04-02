/**
 * Logic for calculating results based on Swiss-style or German-style language module grading.
 */
export function calculateResult(moduleScores, level) {
  const scores = Object.values(moduleScores).filter(s => s !== null && s !== "" && !isNaN(s)).map(Number);
  
  if (scores.length === 0) {
    return { total: 0, average: 0, mention: "N/A", status: "ABSENT" };
  }

  const total = scores.reduce((a, b) => a + b, 0);
  const average = total / scores.length;
  
  let mention = "Insuffisant";
  if (average >= 18) mention = "Excellent";
  else if (average >= 16) mention = "Très Bien";
  else if (average >= 14) mention = "Bien";
  else if (average >= 12) mention = "Assez Bien";
  else if (average >= 10) mention = "Passable";

  let status = "AJOURNÉ";
  if (average >= 10) {
    status = scores.length >= 4 ? "ADMIS" : "PARTIEL";
  } else if (scores.length < 4) {
    status = "PARTIEL";
  }

  return {
    total: total.toFixed(2),
    average: average.toFixed(2),
    mention,
    status
  };
}

/**
 * Handles 'Gesamt' module logic where it encompasses multiple sub-modules.
 */
export function resolveGesamt(scores) {
  // Logic to expand Gesamt into the 4 core modules if needed
  return scores;
}
