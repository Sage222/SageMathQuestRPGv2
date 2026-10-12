import { AgeGrade, DifficultyTier, MathCategory, MathQuestion } from '../types/game';

// Utility random helpers
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Generates 4 unique options including the correct answer
function buildOptions(correct: number | string, distractors: (number | string)[]): string[] {
  const correctStr = String(correct);
  const unique = new Set<string>([correctStr]);

  for (const d of distractors) {
    if (unique.size >= 4) break;
    const str = String(d);
    if (str !== correctStr && !unique.has(str)) {
      unique.add(str);
    }
  }

  // If still need options, add numeric offsets if correct is a number
  if (typeof correct === 'number' || !isNaN(Number(correct))) {
    const num = Number(correct);
    const offsets = [1, -1, 2, -2, 5, -5, 10, -10];
    for (const offset of offsets) {
      if (unique.size >= 4) break;
      const candidate = String(num + offset);
      if (candidate !== correctStr && !unique.has(candidate)) {
        unique.add(candidate);
      }
    }
  }

  let fallbackVal = 1;
  while (unique.size < 4) {
    unique.add(String(fallbackVal++));
  }

  return shuffle(Array.from(unique));
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  {
    level: 1,
    id: 'level_1',
    title: 'Novice Initiate',
    subtitle: 'Foundation Arithmetic',
    ageRange: 'Ages 8–9 (Grade 3)',
    sampleQuestion: '48 + 37 = ?  ·  7 × 8 = ?',
    description: 'Double-digit addition & subtraction with carrying, times tables 2 through 10, division sharing, number patterns, and perimeter.',
    topics: ['Addition & Subtraction Regrouping', 'Multiplication Tables (2-10)', 'Division Facts', 'Number Sequences', 'Perimeter of Shapes']
  },
  {
    level: 2,
    id: 'level_2',
    title: 'Apprentice Scholar',
    subtitle: 'Multi-Digit Operations & Basic Fractions',
    ageRange: 'Ages 9–10 (Grade 4)',
    sampleQuestion: '16 × 7 = ?  ·  2/5 + 2/5 = ?',
    description: 'Multi-digit multiplication, division with remainders, like-denominator fractions, area of rectangles, and prime number identification (<30).',
    topics: ['Multi-Digit Operations', 'Like Denominator Fractions', 'Area of Rectangles', 'Prime Numbers & Factors', 'Word Problem Math']
  },
  {
    level: 3,
    id: 'level_3',
    title: 'Adept Arithmancer',
    subtitle: 'Order of Operations & Fractions',
    ageRange: 'Ages 10–11 (Grade 5)',
    sampleQuestion: '8 + 4 × (6 - 2) = ?  ·  1/2 + 1/4 = ?',
    description: 'Order of operations (PEMDAS), unlike denominator fractions, multiplying fractions, percentages (10%, 25%, 50%), and triangle area.',
    topics: ['PEMDAS Precedence', 'Unlike Fractions (+, -, ×)', 'Decimals & Percentages', 'Triangle Area', 'Negative Numbers']
  },
  {
    level: 4,
    id: 'level_4',
    title: 'Master Algebrist',
    subtitle: 'Pre-Algebra & Exponents',
    ageRange: 'Ages 11–12 (Grades 6–7)',
    sampleQuestion: '3x + 12 = 33 ➔ x = ?  ·  4³ - 15 = ?',
    description: 'Two-step linear equations (ax + b = c), negative integer multiplication & division, exponents, square roots, and ratios/proportions.',
    topics: ['Two-Step Equations', 'Negative Integer Operations', 'Exponents & Square Roots', 'Ratios & Proportions', 'Algebraic Expressions']
  },
  {
    level: 5,
    id: 'level_5',
    title: 'Grand Arch-Mage',
    subtitle: 'Advanced Algebra & Pythagorean Geometry',
    ageRange: 'Ages 13–14 (Grades 8–9)',
    sampleQuestion: '4(x - 3) = 28  ·  c = √(6² + 8²) = ?',
    description: 'Linear equations with parentheses, the Pythagorean Theorem (a² + b² = c²), negative integer powers, and two-variable evaluations.',
    topics: ['Multi-Step Parenthesis Equations', 'Pythagorean Theorem', 'Powers with Negative Bases', 'Two-Variable Substitution', 'Coordinate Geometry']
  }
];

// ============================================================
// LEVEL 1: Novice Initiate (Ages 8-9 / Grade 3)
// ============================================================
function generateLevel1Question(preferredCategory?: MathCategory): MathQuestion {
  const type = pickRandom(['add', 'sub', 'mult_basic', 'div_basic', 'pattern', 'perim']);
  const id = `lvl1_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (type === 'add') {
    const a = randInt(18, 75);
    const b = randInt(14, 68);
    const ans = a + b;
    return {
      id,
      gradeAge: 'level_1',
      category: 'arithmetic',
      categoryLabel: 'Addition (Regrouping)',
      prompt: 'Cast an Axiom Strike! Combine the magical energy numbers:',
      displayEquation: `${a} + ${b} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + 10, ans - 1, ans + 2, a + b - 10]),
      hint: `Add the ones digits first: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}.`,
      explanation: `${a} + ${b} = ${ans}`,
      steps: [`Add ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`, `Add tens with carry: ${ans}`],
      difficulty: 1
    };
  }

  if (type === 'sub') {
    const a = randInt(40, 95);
    const b = randInt(15, a - 10);
    const ans = a - b;
    return {
      id,
      gradeAge: 'level_1',
      category: 'arithmetic',
      categoryLabel: 'Subtraction (Borrowing)',
      prompt: 'Pierce the enemy guard! Calculate the remaining defense:',
      displayEquation: `${a} - ${b} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + 10, ans - 10, ans + 2, ans - 2]),
      hint: `Subtract tens first: ${a} - ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, then subtract ${b % 10}.`,
      explanation: `${a} - ${b} = ${ans}`,
      steps: [`Subtract tens: ${a} - ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}`, `Subtract ones: ${ans}`],
      difficulty: 2
    };
  }

  if (type === 'mult_basic') {
    const a = randInt(2, 9);
    const b = randInt(3, 9);
    const ans = a * b;
    return {
      id,
      gradeAge: 'level_1',
      category: 'arithmetic',
      categoryLabel: 'Times Tables (2–9)',
      prompt: `Summon ${a} enchanted arrows, each dealing ${b} damage:`,
      displayEquation: `${a} × ${b} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + a, ans - b, a * (b - 1), ans + 2]),
      hint: `Think of ${a} equal groups of ${b}.`,
      explanation: `${a} × ${b} = ${ans}`,
      steps: [`${a} groups of ${b} equals ${ans}`],
      difficulty: 2
    };
  }

  if (type === 'div_basic') {
    const b = randInt(2, 8);
    const q = randInt(2, 9);
    const a = b * q;
    return {
      id,
      gradeAge: 'level_1',
      category: 'arithmetic',
      categoryLabel: 'Division Facts',
      prompt: `Distribute ${a} health potions equally among ${b} party members:`,
      displayEquation: `${a} ÷ ${b} = ?`,
      correctAnswer: String(q),
      options: buildOptions(q, [q + 1, q - 1, q + 2, b]),
      hint: `What number multiplied by ${b} equals ${a}?`,
      explanation: `${a} ÷ ${b} = ${q} because ${b} × ${q} = ${a}`,
      steps: [`${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}`],
      difficulty: 2
    };
  }

  if (type === 'perim') {
    const w = randInt(3, 10);
    const l = randInt(w, 12);
    const ans = 2 * (w + l);
    return {
      id,
      gradeAge: 'level_1',
      category: 'geometry',
      categoryLabel: 'Perimeter of Rectangle',
      prompt: `Calculate the perimeter boundary around the courtyard (width ${w}m, length ${l}m):`,
      displayEquation: `Perimeter = 2 × (${w} + ${l}) = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [w * l, w + l, ans + 4, ans - 2]),
      hint: `Add all four sides: ${w} + ${l} + ${w} + ${l}`,
      explanation: `Perimeter = 2 × (${w} + ${l}) = ${ans} meters.`,
      steps: [`${w} + ${l} = ${w + l}`, `2 × ${w + l} = ${ans}`],
      difficulty: 2
    };
  }

  // Pattern
  const s = randInt(3, 12);
  const step = randInt(3, 6);
  const ans = s + step * 3;
  return {
    id,
    gradeAge: 'level_1',
    category: 'arithmetic',
    categoryLabel: 'Number Sequences',
    prompt: 'Complete the ancient glyph pattern:',
    displayEquation: `${s}, ${s + step}, ${s + step * 2}, [ ? ]`,
    correctAnswer: String(ans),
    options: buildOptions(ans, [ans + step, ans - 1, ans + 2, ans - step]),
    hint: `Notice each number increases by +${step}.`,
    explanation: `Add ${step} to the last number: ${s + step * 2} + ${step} = ${ans}.`,
    steps: [`Difference between numbers is +${step}`, `${s + step * 2} + ${step} = ${ans}`],
    difficulty: 2
  };
}

// ============================================================
// LEVEL 2: Apprentice Scholar (Ages 9-10 / Grade 4)
// ============================================================
function generateLevel2Question(preferredCategory?: MathCategory): MathQuestion {
  const type = pickRandom(['mult_twodigit', 'fraction_like', 'area_rect', 'prime_id', 'div_remainder']);
  const id = `lvl2_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (type === 'mult_twodigit') {
    const a = randInt(12, 24);
    const b = randInt(4, 8);
    const ans = a * b;
    return {
      id,
      gradeAge: 'level_2',
      category: 'arithmetic',
      categoryLabel: 'Multi-Digit Multiplication',
      prompt: `Inscribe ${a} runes upon ${b} shields:`,
      displayEquation: `${a} × ${b} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + 10, ans - b, (a + 2) * b, ans - 10]),
      hint: `Multiply ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, then add ${(a % 10) * b}.`,
      explanation: `${a} × ${b} = ${ans}`,
      steps: [`${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}`, `${a % 10} × ${b} = ${(a % 10) * b}`, `Sum: ${ans}`],
      difficulty: 3
    };
  }

  if (type === 'fraction_like') {
    const denom = pickRandom([5, 6, 8, 10]);
    const n1 = randInt(1, denom - 3);
    const n2 = randInt(1, denom - n1 - 1);
    const sum = n1 + n2;
    return {
      id,
      gradeAge: 'level_2',
      category: 'fractions',
      categoryLabel: 'Fractions (Common Denominators)',
      prompt: 'Combine the matching alchemical fractions:',
      displayEquation: `${n1}/${denom} + ${n2}/${denom} = ?`,
      correctAnswer: `${sum}/${denom}`,
      options: buildOptions(`${sum}/${denom}`, [`${sum}/${denom * 2}`, `${sum + 1}/${denom}`, `${n1}/${denom}`, `${sum}/${denom + 1}`]),
      hint: 'When denominators match, add only the top numerators!',
      explanation: `(${n1} + ${n2})/${denom} = ${sum}/${denom}`,
      steps: [`Denominators are identical (${denom})`, `Add numerators: ${n1} + ${n2} = ${sum}`, `Result: ${sum}/${denom}`],
      difficulty: 3
    };
  }

  if (type === 'area_rect') {
    const w = randInt(5, 12);
    const l = randInt(6, 15);
    const ans = w * l;
    return {
      id,
      gradeAge: 'level_2',
      category: 'geometry',
      categoryLabel: 'Area of Rectangle',
      prompt: `Determine the area of the spell platform (width = ${w}m, length = ${l}m):`,
      displayEquation: `Area = ${w} × ${l} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [2 * (w + l), ans + w, ans - l, (w + 1) * l]),
      hint: 'Area = length × width.',
      explanation: `Area = ${w} × ${l} = ${ans} square meters.`,
      steps: [`Multiply dimensions: ${w} × ${l} = ${ans}`],
      difficulty: 3
    };
  }

  if (type === 'prime_id') {
    const primes = [11, 13, 17, 19, 23, 29, 31];
    const composites = [12, 14, 15, 16, 18, 20, 21, 25, 27];
    const targetPrime = pickRandom(primes);
    const distractors = shuffle(composites).slice(0, 3);
    return {
      id,
      gradeAge: 'level_2',
      category: 'arithmetic',
      categoryLabel: 'Prime Number Identification',
      prompt: 'Which of the following numbers is a pure PRIME number (divisible only by 1 and itself)?',
      displayEquation: `Select the Prime: [ ? ]`,
      correctAnswer: String(targetPrime),
      options: shuffle([String(targetPrime), ...distractors.map(String)]),
      hint: 'A prime number cannot be factored into any numbers other than 1 and itself.',
      explanation: `${targetPrime} is prime because its only factors are 1 and ${targetPrime}.`,
      steps: [`Test divisibility for each option`, `${targetPrime} has no divisors other than 1 and itself.`],
      difficulty: 3
    };
  }

  // Division with remainder
  const d = randInt(3, 7);
  const q = randInt(4, 9);
  const rem = randInt(1, d - 1);
  const total = d * q + rem;
  return {
    id,
    gradeAge: 'level_2',
    category: 'arithmetic',
    categoryLabel: 'Division with Remainder',
    prompt: `Divide ${total} crystals among ${d} shrines. How many does each shrine receive?`,
    displayEquation: `${total} ÷ ${d} = [ ? ] (Remainder ${rem})`,
    correctAnswer: String(q),
    options: buildOptions(q, [q + 1, q - 1, q + rem, d]),
    hint: `${d} × ${q} = ${d * q}, plus remainder ${rem} = ${total}.`,
    explanation: `${total} ÷ ${d} = ${q} with remainder ${rem}.`,
    steps: [`Find multiple: ${d} × ${q} = ${d * q}`, `Difference: ${total} - ${d * q} = ${rem}`, `Quotient: ${q}`],
    difficulty: 3
  };
}

// ============================================================
// LEVEL 3: Adept Arithmancer (Ages 10-11 / Grade 5)
// ============================================================
function generateLevel3Question(preferredCategory?: MathCategory): MathQuestion {
  const type = pickRandom(['pemdas', 'unlike_frac', 'percent', 'triangle_area', 'mult_frac']);
  const id = `lvl3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (type === 'pemdas') {
    const a = randInt(5, 14);
    const b = randInt(3, 7);
    const c = randInt(2, 5);
    const ans = a + b * c;
    return {
      id,
      gradeAge: 'level_3',
      category: 'arithmetic',
      categoryLabel: 'Order of Operations (PEMDAS)',
      prompt: 'Dispel the Chaos Ward using the Law of Precedence (PEMDAS):',
      displayEquation: `${a} + ${b} × ${c} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [(a + b) * c, ans + b, a * b + c, ans - 2]),
      hint: `Multiplication takes precedence over addition! Calculate ${b} × ${c} first.`,
      explanation: `${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = ${ans}.`,
      steps: [`Step 1 (Multiply): ${b} × ${c} = ${b * c}`, `Step 2 (Add): ${a} + ${b * c} = ${ans}`],
      difficulty: 4
    };
  }

  if (type === 'unlike_frac') {
    const pairs = [
      { n1: 1, d1: 2, n2: 1, d2: 4, ans: '3/4' },
      { n1: 1, d1: 3, n2: 1, d2: 6, ans: '1/2' },
      { n1: 2, d1: 5, n2: 1, d2: 10, ans: '1/2' },
      { n1: 1, d1: 4, n2: 3, d2: 8, ans: '5/8' },
      { n1: 2, d1: 3, n2: 1, d2: 6, ans: '5/6' }
    ];
    const p = pickRandom(pairs);
    return {
      id,
      gradeAge: 'level_3',
      category: 'fractions',
      categoryLabel: 'Fractions (Unlike Denominators)',
      prompt: 'Harmonize the two harmonic crystals into a simplified fraction:',
      displayEquation: `${p.n1}/${p.d1} + ${p.n2}/${p.d2} = ?`,
      correctAnswer: p.ans,
      options: buildOptions(p.ans, ['2/6', '3/8', '2/5', '1/4', '7/8']),
      hint: 'Find a common denominator first, convert numerators, and simplify.',
      explanation: `Convert to common denominator: result simplifies to ${p.ans}.`,
      steps: ['Find common denominator', 'Add converted numerators', `Simplify: ${p.ans}`],
      difficulty: 5
    };
  }

  if (type === 'percent') {
    const pct = pickRandom([10, 20, 25, 50, 75]);
    const base = randInt(2, 8) * (pct === 25 || pct === 75 ? 4 : 10);
    const ans = Math.round((pct / 100) * base);
    return {
      id,
      gradeAge: 'level_3',
      category: 'fractions',
      categoryLabel: 'Percentages',
      prompt: `Calculate the tribute tax: What is ${pct}% of ${base} gold?`,
      displayEquation: `${pct}% of ${base} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + 10, ans - 5, Math.round(base / 2), ans * 2]),
      hint: `${pct}% = ${pct}/100. For example 50% = 1/2, 25% = 1/4.`,
      explanation: `(${pct} ÷ 100) × ${base} = ${ans}`,
      steps: [`Convert percentage to fraction/decimal`, `Multiply by ${base} = ${ans}`],
      difficulty: 4
    };
  }

  if (type === 'triangle_area') {
    const b = randInt(4, 14);
    const h = randInt(3, 10);
    const baseVal = (b * h) % 2 === 0 ? b : b + 1;
    const ans = (baseVal * h) / 2;
    return {
      id,
      gradeAge: 'level_3',
      category: 'geometry',
      categoryLabel: 'Triangle Area',
      prompt: `Unseal the Triangle Shrine: Area = (base × height) ÷ 2 with base = ${baseVal}m and height = ${h}m:`,
      displayEquation: `Area = (${baseVal} × ${h}) ÷ 2 = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [baseVal * h, ans + 6, ans - 4, baseVal + h]),
      hint: 'Multiply base times height, then divide in half!',
      explanation: `(${baseVal} × ${h}) ÷ 2 = ${ans} sq meters.`,
      steps: [`${baseVal} × ${h} = ${baseVal * h}`, `${baseVal * h} ÷ 2 = ${ans}`],
      difficulty: 4
    };
  }

  // Fraction multiplication
  const a = randInt(1, 3);
  const b = 4;
  const c = 2;
  const d = 5;
  const numAns = a * c;
  const denAns = b * d;
  return {
    id,
    gradeAge: 'level_3',
    category: 'fractions',
    categoryLabel: 'Multiplying Fractions',
    prompt: 'Multiply the fractional mana streams:',
    displayEquation: `(${a}/${b}) × (${c}/${d}) = ?`,
    correctAnswer: `${numAns}/${denAns}`,
    options: buildOptions(`${numAns}/${denAns}`, [`${a + c}/${b + d}`, `${numAns}/${b}`, `${a * d}/${b * c}`, `${numAns + 2}/${denAns}`]),
    hint: 'Multiply numerator by numerator, and denominator by denominator!',
    explanation: `(${a} × ${c}) / (${b} × ${d}) = ${numAns}/${denAns}`,
    steps: [`Numerator: ${a} × ${c} = ${numAns}`, `Denominator: ${b} × ${d} = ${denAns}`, `Result: ${numAns}/${denAns}`],
    difficulty: 4
  };
}

// ============================================================
// LEVEL 4: Master Algebrist (Ages 11-12 / Grades 6-7)
// ============================================================
function generateLevel4Question(preferredCategory?: MathCategory): MathQuestion {
  const type = pickRandom(['twostep_linear', 'negative_arith', 'exponents', 'squareroot', 'ratio']);
  const id = `lvl4_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (type === 'twostep_linear') {
    const xVal = randInt(2, 9);
    const a = randInt(2, 5);
    const b = randInt(4, 16);
    const c = a * xVal + b;
    return {
      id,
      gradeAge: 'level_4',
      category: 'equations',
      categoryLabel: 'Two-Step Linear Equations',
      prompt: 'Solve for the unknown variable x to breach the rune:',
      displayEquation: `${a}x + ${b} = ${c}`,
      correctAnswer: String(xVal),
      options: buildOptions(xVal, [xVal + 2, xVal - 1, xVal + 3, Math.abs(c - b)]),
      hint: `Subtract ${b} from both sides: ${a}x = ${c - b}. Then divide by ${a}.`,
      explanation: `${a}x + ${b} = ${c} ➔ ${a}x = ${c - b} ➔ x = ${xVal}`,
      steps: [`Subtract ${b} from both sides: ${a}x = ${c - b}`, `Divide by ${a}: x = ${c - b} ÷ ${a} = ${xVal}`],
      difficulty: 6
    };
  }

  if (type === 'negative_arith') {
    const a = -randInt(3, 8);
    const b = -randInt(3, 7);
    const c = randInt(4, 15);
    const ans = a * b - c;
    return {
      id,
      gradeAge: 'level_4',
      category: 'prealgebra',
      categoryLabel: 'Negative Integer Operations',
      prompt: 'Negative × Negative = Positive! Solve the equation:',
      displayEquation: `(${a}) × (${b}) - ${c} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [-(a * b) - c, ans + 10, -ans, (a * b) + c]),
      hint: `(${a}) × (${b}) = +${a * b}. Then subtract ${c}.`,
      explanation: `(${a}) × (${b}) = ${a * b}. ${a * b} - ${c} = ${ans}.`,
      steps: [`Negative times negative is positive: (${a}) × (${b}) = ${a * b}`, `Subtract: ${a * b} - ${c} = ${ans}`],
      difficulty: 6
    };
  }

  if (type === 'exponents') {
    const base = pickRandom([2, 3, 4, 5]);
    const exp = base === 2 ? randInt(3, 5) : base === 3 ? randInt(2, 4) : 2;
    const ans = Math.pow(base, exp);
    return {
      id,
      gradeAge: 'level_4',
      category: 'exponents_roots',
      categoryLabel: 'Exponents & Powers',
      prompt: 'Channel exponential energy to strike:',
      displayEquation: `${base}^${exp} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [base * exp, ans + base, ans - 4, Math.pow(base, exp - 1)]),
      hint: `${base}^${exp} means ${base} multiplied by itself ${exp} times.`,
      explanation: `${base}^${exp} = ${ans}`,
      steps: [`Multiply ${base} by itself ${exp} times = ${ans}`],
      difficulty: 6
    };
  }

  if (type === 'squareroot') {
    const root = randInt(6, 15);
    const sq = root * root;
    return {
      id,
      gradeAge: 'level_4',
      category: 'exponents_roots',
      categoryLabel: 'Square Roots',
      prompt: 'Extract the fundamental root of the Celestial Core:',
      displayEquation: `√${sq} = ?`,
      correctAnswer: String(root),
      options: buildOptions(root, [root + 2, root - 1, Math.floor(sq / 2), root + 3]),
      hint: `What number squared (${root} × ${root}) equals ${sq}?`,
      explanation: `√${sq} = ${root} because ${root}² = ${sq}.`,
      steps: [`${root} × ${root} = ${sq}, so √${sq} = ${root}`],
      difficulty: 6
    };
  }

  // Ratio / Proportion
  const r1 = randInt(2, 5);
  const r2 = randInt(3, 7);
  const mult = randInt(3, 6);
  const given = r1 * mult;
  const ans = r2 * mult;
  return {
    id,
    gradeAge: 'level_4',
    category: 'prealgebra',
    categoryLabel: 'Ratios & Proportions',
    prompt: `Solve the ratio proportion: ${r1} : ${r2} = ${given} : x:`,
    displayEquation: `${r1}/${r2} = ${given}/x  ➔  x = ?`,
    correctAnswer: String(ans),
    options: buildOptions(ans, [ans + r2, ans - r1, given + r2, ans * 2]),
    hint: `Notice ${given} is ${mult} times ${r1}. Multiply ${r2} by ${mult}.`,
    explanation: `${given} ÷ ${r1} = ${mult}. So x = ${r2} × ${mult} = ${ans}.`,
    steps: [`Find scale factor: ${given} ÷ ${r1} = ${mult}`, `Multiply: ${r2} × ${mult} = ${ans}`],
    difficulty: 6
  };
}

// ============================================================
// LEVEL 5: Grand Arch-Mage (Ages 13-14 / Grades 8-9)
// ============================================================
function generateLevel5Question(preferredCategory?: MathCategory): MathQuestion {
  const type = pickRandom(['pythagoras', 'parenthesis_eq', 'power_neg', 'two_var_sub', 'fraction_eq']);
  const id = `lvl5_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (type === 'pythagoras') {
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 6, b: 8, c: 10 },
      { a: 5, b: 12, c: 13 },
      { a: 9, b: 12, c: 15 },
      { a: 8, b: 15, c: 17 }
    ];
    const tr = pickRandom(triples);
    return {
      id,
      gradeAge: 'level_5',
      category: 'geometry',
      categoryLabel: 'Pythagorean Theorem',
      prompt: `Cast Pythagorean Cleave! Calculate hypotenuse c with legs a = ${tr.a} and b = ${tr.b}:`,
      displayEquation: `c = √(${tr.a}² + ${tr.b}²) = ?`,
      correctAnswer: String(tr.c),
      options: buildOptions(tr.c, [tr.a + tr.b, tr.c + 2, tr.c - 1, tr.c * 2]),
      hint: `a² + b² = ${tr.a * tr.a} + ${tr.b * tr.b} = ${tr.c * tr.c}. √${tr.c * tr.c} = c.`,
      explanation: `${tr.a}² + ${tr.b}² = ${tr.a * tr.a + tr.b * tr.b} = ${tr.c * tr.c} ➔ c = ${tr.c}`,
      steps: [`${tr.a}² = ${tr.a * tr.a}`, `${tr.b}² = ${tr.b * tr.b}`, `Sum = ${tr.c * tr.c}`, `√${tr.c * tr.c} = ${tr.c}`],
      difficulty: 8
    };
  }

  if (type === 'parenthesis_eq') {
    const xVal = randInt(3, 11);
    const mult = randInt(2, 5);
    const sub = randInt(2, 6);
    const rhs = mult * (xVal - sub);
    return {
      id,
      gradeAge: 'level_5',
      category: 'equations',
      categoryLabel: 'Linear Equations with Parentheses',
      prompt: 'Disintegrate the Null Void Barrier! Solve for x:',
      displayEquation: `${mult}(x - ${sub}) = ${rhs}`,
      correctAnswer: String(xVal),
      options: buildOptions(xVal, [xVal + 2, xVal - 2, xVal + 3, rhs - mult]),
      hint: `Divide both sides by ${mult} first: x - ${sub} = ${rhs / mult}. Then add ${sub}.`,
      explanation: `${mult}(x - ${sub}) = ${rhs} ➔ x - ${sub} = ${rhs / mult} ➔ x = ${xVal}`,
      steps: [`Divide both sides by ${mult}: x - ${sub} = ${rhs / mult}`, `Add ${sub}: x = ${rhs / mult} + ${sub} = ${xVal}`],
      difficulty: 8
    };
  }

  if (type === 'power_neg') {
    const base = pickRandom([-2, -3]);
    const exp = 3; // negative cubed = negative
    const plus = randInt(15, 35);
    const ans = Math.pow(base, exp) + plus;
    return {
      id,
      gradeAge: 'level_5',
      category: 'exponents_roots',
      categoryLabel: 'Powers with Negative Bases',
      prompt: 'Remember: A negative number raised to an ODD power remains negative!',
      displayEquation: `(${base})³ + ${plus} = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [Math.abs(Math.pow(base, exp)) + plus, ans + 6, -ans, ans - 10]),
      hint: `(${base})³ = (${base}) × (${base}) × (${base}) = ${Math.pow(base, exp)}. Then add ${plus}.`,
      explanation: `(${base})³ = ${Math.pow(base, exp)}. ${Math.pow(base, exp)} + ${plus} = ${ans}.`,
      steps: [`Evaluate power: (${base})³ = ${Math.pow(base, exp)}`, `Add: ${Math.pow(base, exp)} + ${plus} = ${ans}`],
      difficulty: 8
    };
  }

  if (type === 'two_var_sub') {
    const x = randInt(2, 4);
    const y = randInt(-3, 3);
    const ans = 2 * (x * x) + 3 * y;
    return {
      id,
      gradeAge: 'level_5',
      category: 'equations',
      categoryLabel: 'Two-Variable Algebraic Evaluation',
      prompt: `If x = ${x} and y = ${y}, evaluate the arcane expression:`,
      displayEquation: `2x² + 3y = ?`,
      correctAnswer: String(ans),
      options: buildOptions(ans, [ans + 4, ans - 4, 2 * x + 3 * y, ans + 10]),
      hint: `Substitute x = ${x}: 2(${x}²) = ${2 * x * x}. Then add 3(${y}) = ${3 * y}.`,
      explanation: `2(${x}²) + 3(${y}) = ${2 * x * x} + (${3 * y}) = ${ans}`,
      steps: [`Compute 2(${x}²) = ${2 * x * x}`, `Compute 3(${y}) = ${3 * y}`, `Sum: ${2 * x * x} + (${3 * y}) = ${ans}`],
      difficulty: 8
    };
  }

  // Fractional coefficient equation: (2/3)x + 4 = 16 ➔ (2/3)x = 12 ➔ x = 18
  const mult2 = 2;
  const den2 = 3;
  const xAns = randInt(3, 9) * den2;
  const k = randInt(3, 8);
  const rhs2 = (mult2 * xAns) / den2 + k;
  return {
    id,
    gradeAge: 'level_5',
    category: 'equations',
    categoryLabel: 'Equations with Rational Coefficients',
    prompt: 'Solve for x across the rational coefficient plane:',
    displayEquation: `(${mult2}/${den2})x + ${k} = ${rhs2}`,
    correctAnswer: String(xAns),
    options: buildOptions(xAns, [xAns + 3, xAns - 3, rhs2 - k, xAns * 2]),
    hint: `Subtract ${k}: (${mult2}/${den2})x = ${rhs2 - k}. Then multiply by ${den2}/${mult2}.`,
    explanation: `(${mult2}/${den2})x = ${rhs2 - k} ➔ x = (${rhs2 - k} × ${den2}) ÷ ${mult2} = ${xAns}`,
    steps: [`Subtract ${k} from both sides: (${mult2}/${den2})x = ${rhs2 - k}`, `Multiply by reciprocal: x = ${xAns}`],
    difficulty: 9
  };
}

// Master router mapping all 5 levels (plus legacy aliases)
export function generateQuestion(
  grade: AgeGrade,
  preferredCategory?: MathCategory,
  playerLevel: number = 1
): MathQuestion {
  let effectiveLevel: number = 3;

  if (grade === 'level_1' || grade === 'apprentice') {
    effectiveLevel = 1;
  } else if (grade === 'level_2') {
    effectiveLevel = 2;
  } else if (grade === 'level_3' || grade === 'scholar') {
    effectiveLevel = 3;
  } else if (grade === 'level_4') {
    effectiveLevel = 4;
  } else if (grade === 'level_5' || grade === 'archmage') {
    effectiveLevel = 5;
  } else if (grade === 'dynamic') {
    if (playerLevel <= 2) effectiveLevel = 1;
    else if (playerLevel <= 4) effectiveLevel = 2;
    else if (playerLevel <= 7) effectiveLevel = 3;
    else if (playerLevel <= 10) effectiveLevel = 4;
    else effectiveLevel = 5;
  }

  switch (effectiveLevel) {
    case 1:
      return generateLevel1Question(preferredCategory);
    case 2:
      return generateLevel2Question(preferredCategory);
    case 3:
      return generateLevel3Question(preferredCategory);
    case 4:
      return generateLevel4Question(preferredCategory);
    case 5:
    default:
      return generateLevel5Question(preferredCategory);
  }
}
