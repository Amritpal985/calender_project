import { SYLLABUS_SUBJECTS } from './subjects'

/**
 * A practical starting outline for SSC CGL (Tier 1 + Tier 2 core topics).
 * Seeded once per account the first time the syllabus page is opened.
 * Topics can be edited / deleted / added from the UI afterwards.
 */
export const DEFAULT_SYLLABUS: Record<string, string[]> = {
  'Quantitative Aptitude': [
    'Number System & HCF/LCM',
    'Percentages',
    'Profit, Loss & Discount',
    'Simple & Compound Interest',
    'Ratio & Proportion',
    'Mixtures & Alligation',
    'Averages',
    'Time & Work',
    'Pipes & Cisterns',
    'Time, Speed & Distance',
    'Boats & Streams',
    'Algebra',
    'Geometry',
    'Mensuration (2D & 3D)',
    'Trigonometry',
    'Heights & Distances',
    'Data Interpretation',
    'Statistics',
  ],
  Reasoning: [
    'Analogy',
    'Classification (Odd One Out)',
    'Number & Alphabet Series',
    'Coding–Decoding',
    'Blood Relations',
    'Direction Sense',
    'Order & Ranking',
    'Syllogism',
    'Venn Diagrams',
    'Seating Arrangements',
    'Puzzles',
    'Mirror & Water Image',
    'Paper Folding & Cutting',
    'Embedded Figures',
    'Mathematical Operations',
    'Dice & Cubes',
    'Word Formation',
    'Statement & Conclusions',
  ],
  English: [
    'Reading Comprehension',
    'Cloze Test',
    'Spotting Errors',
    'Sentence Improvement',
    'Fill in the Blanks',
    'Idioms & Phrases',
    'One Word Substitution',
    'Synonyms & Antonyms',
    'Spelling Errors',
    'Active & Passive Voice',
    'Direct & Indirect Speech',
    'Para Jumbles',
    'Homonyms / Confusable Words',
    'Sentence Rearrangement',
  ],
  'General Awareness': [
    'Ancient History',
    'Medieval History',
    'Modern History',
    'Indian Polity & Constitution',
    'Geography',
    'Economics & Budget',
    'Physics',
    'Chemistry',
    'Biology',
    'Static GK',
    'Current Affairs',
    'Government Schemes',
    'Sports & Awards',
    'Art & Culture',
    'Computer Awareness',
  ],
}

export const SEED_SUBJECTS = SYLLABUS_SUBJECTS.map((s) => s.name)

export function buildSeedRows(userId: string) {
  const rows: {
    user_id: string
    subject: string
    topic: string
    sort_order: number
  }[] = []
  for (const subject of SEED_SUBJECTS) {
    ;(DEFAULT_SYLLABUS[subject] ?? []).forEach((topic, index) => {
      rows.push({ user_id: userId, subject, topic, sort_order: index })
    })
  }
  return rows
}
