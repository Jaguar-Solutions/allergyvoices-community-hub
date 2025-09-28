/**
 * Shared scoring calculation for restaurant questionnaires
 * Used in both submission form and admin panel
 */

export interface ScoringData {
  hasAllergenMenu: string;
  staffTraining: string;
  equipmentCleaning: string;
  dedicatedPrepArea: string;
  guestDisclosure: string;
  allergyPointOfContact: string;
  dedicatedPrep: string;
  allergenMenuLink?: string;
  allergenFreeOptions: string[];
}

export interface ScoreResult {
  score: number;
  grade: string;
}

/**
 * Calculate score and grade for restaurant questionnaire
 * @param data - Restaurant questionnaire data
 * @returns Object with score (0-25) and grade
 */
export function calculateScore(data: ScoringData): ScoreResult {
  let score = 0;
  
  // Yes/Always = 2 points, Sometimes = 1 point, No/Never = 0 points
  if (data.hasAllergenMenu === 'Yes') score += 2;
  if (data.staffTraining === 'Yes') score += 2;
  if (data.staffTraining === 'Some staff') score += 1;
  if (data.equipmentCleaning === 'Always') score += 2;
  if (data.equipmentCleaning === 'Sometimes') score += 1;
  if (data.dedicatedPrepArea === 'Yes') score += 2;
  if (data.dedicatedPrepArea === 'Sometimes') score += 1;
  if (data.guestDisclosure === 'Always') score += 2;
  if (data.guestDisclosure === 'Sometimes') score += 1;
  if (data.allergyPointOfContact === 'Yes') score += 2;
  if (data.dedicatedPrep === 'Yes') score += 2;
  if (data.dedicatedPrep === 'Some') score += 1;
  
  // Bonus points
  if (data.allergenMenuLink) score += 2;
  score += data.allergenFreeOptions.length;
  
  // Determine grade
  let grade = 'Needs Improvement';
  if (score >= 16) grade = 'Gold';
  else if (score >= 10) grade = 'Silver';
  else if (score >= 5) grade = 'Bronze';
  
  return { score, grade };
}

/**
 * Get color classes for grade badges
 */
export function getGradeColors(grade: string) {
  return {
    'Gold': 'bg-green-100 text-green-800 border-green-200',
    'Silver': 'bg-gray-100 text-gray-800 border-gray-200',
    'Bronze': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Needs Improvement': 'bg-red-100 text-red-800 border-red-200'
  }[grade] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get icon for grade
 */
export function getGradeIcon(grade: string) {
  switch (grade) {
    case 'Gold': return '🥇';
    case 'Silver': return '🥈';
    case 'Bronze': return '🥉';
    case 'Needs Improvement': return '⚠️';
    default: return '❓';
  }
}
