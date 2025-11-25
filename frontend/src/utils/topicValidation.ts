/**
 * Validates if a topic is algebra-related for the hackathon constraint
 */
export function isAlgebraTopic(topic: string): boolean {
  const algebraKeywords = [
    'algebra', 'algebraic', 'equation', 'equations', 'polynomial', 'polynomials',
    'quadratic', 'linear', 'factor', 'factoring', 'expression', 'expressions',
    'variable', 'variables', 'coefficient', 'coefficients', 'solve', 'solving',
    'system', 'systems', 'function', 'functions', 'graph', 'graphing',
    'inequality', 'inequalities', 'exponent', 'exponents', 'radical', 'radicals',
    'rational', 'irrational', 'binomial', 'trinomial', 'monomial', 'math', 'mathematics'
  ];

  const normalizedTopic = topic.toLowerCase().trim();
  
  return algebraKeywords.some(keyword => 
    normalizedTopic.includes(keyword)
  );
}

/**
 * Normalizes topic input for consistent processing
 */
export function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase();
}

/**
 * Gets a user-friendly error message for non-algebra topics
 */
export function getNonAlgebraMessage(topic: string): string {
  return `Great choice! For this hackathon demo, we're focusing on algebra topics. Try searching for "linear equations" or "quadratic functions" instead.`;
}