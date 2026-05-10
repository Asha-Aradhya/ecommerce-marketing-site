const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
];

function levenshtein(source: string, target: string): number {
  if (source.length === 0) return target.length;
  if (target.length === 0) return source.length;

  const matrix: number[][] = [];
  for (let row = 0; row <= target.length; row++) {
    matrix[row] = [row];
  }
  for (let column = 0; column <= source.length; column++) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= target.length; row++) {
    for (let column = 1; column <= source.length; column++) {
      if (target.charAt(row - 1) === source.charAt(column - 1)) {
        matrix[row][column] = matrix[row - 1][column - 1];
      } else {
        matrix[row][column] = Math.min(
          matrix[row - 1][column - 1] + 1,
          matrix[row][column - 1] + 1,
          matrix[row - 1][column] + 1,
        );
      }
    }
  }

  return matrix[target.length][source.length];
}

export function suggestEmail(email: string): string | null {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return null;

  const localPart = email.slice(0, atIndex);
  const typedDomain = email.slice(atIndex + 1).toLowerCase();
  if (typedDomain.length < 4) return null;

  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const popularDomain of POPULAR_DOMAINS) {
    if (typedDomain === popularDomain) return null;
    const distance = levenshtein(typedDomain, popularDomain);
    if (distance > 0 && distance <= 2 && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = popularDomain;
    }
  }

  return bestMatch ? `${localPart}@${bestMatch}` : null;
}
