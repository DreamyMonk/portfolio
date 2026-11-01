// Data-engineering memes, drawn with type and emoji (no image assets).

export type Meme =
  | { kind: 'drake'; no: string; yes: string }
  | { kind: 'brain'; steps: string[] }
  | { kind: 'fine'; caption: string; sub: string }
  | { kind: 'butterfly'; who: string; thing: string; question: string }
  | { kind: 'simply'; top: string; bottom: string }
  | { kind: 'distracted'; me: string; shiny: string; loyal: string }
  | { kind: 'afraid'; setup: string; punch: string }
  | { kind: 'quote'; text: string; by: string };

export type MemeId = 'drake' | 'fine' | 'brain' | 'butterfly' | 'simply' | 'distracted' | 'afraid' | 'proverb';

// Each meme is a hidden easter egg; the comment says what unlocks it.
export const memes: { id: MemeId; format: string; meme: Meme }[] = [
  {
    // unlock: clear & rerun any task
    id: 'drake',
    format: 'drake.png',
    meme: { kind: 'drake', no: 'Reading the error message', yes: 'Re-running the DAG until it turns green' },
  },
  {
    // unlock: type “fine”
    id: 'fine',
    format: 'this_is_fine.gif',
    meme: { kind: 'fine', caption: 'This is fine.', sub: 'me at 3:07am, three DAGs failing, coffee still brewing' },
  },
  {
    // unlock: click the tech-stack ticker
    id: 'brain',
    format: 'expanding_brain.jpg',
    meme: {
      kind: 'brain',
      steps: ['data.csv', 'data.parquet', 'an Iceberg lakehouse', 'final_FINAL_v3_USE_THIS.xlsx, emailed every Monday'],
    },
  },
  {
    // unlock: click the Bash skill tag
    id: 'butterfly',
    format: 'is_this_a_pigeon.jpg',
    meme: {
      kind: 'butterfly',
      who: 'the CTO',
      thing: 'a cron job calling a bash script calling a Python script',
      question: 'Is this a data platform?',
    },
  },
  {
    // unlock: terminal: select * from prod
    id: 'simply',
    format: 'one_does_not_simply.jpg',
    meme: { kind: 'simply', top: 'One does not simply', bottom: 'SELECT * from a 4 TB table' },
  },
  {
    // unlock: click the Postgres skill tag
    id: 'distracted',
    format: 'distracted_engineer.jpg',
    meme: {
      kind: 'distracted',
      me: 'me',
      shiny: 'the new database of the week',
      loyal: 'Postgres, quietly working since 2012',
    },
  },
  {
    // unlock: type “null”
    id: 'afraid',
    format: 'too_afraid_to_ask.jpg',
    meme: {
      kind: 'afraid',
      setup: 'NULL = NULL returns NULL. I have been writing SQL for five years',
      punch: 'and at this point I’m too afraid to ask',
    },
  },
  {
    // unlock: click the Kafka skill tag
    id: 'proverb',
    format: 'ancient_proverb.txt',
    meme: {
      kind: 'quote',
      text: 'There are only two hard problems in distributed systems:\n2. Exactly-once delivery\n1. Guaranteed order of messages\n2. Exactly-once delivery',
      by: 'every streaming engineer, eventually',
    },
  },
];

/** Short jokes for task logs, the terminal and the rubber duck. */
export const oneLiners = [
  'it works on my machine 🤷',
  'this is fine 🔥',
  'SELECT * FROM prod — no LIMIT, YOLO',
  "it's never DNS. it's timezones. it's always timezones.",
  'the data is correct. the dashboard is wrong. (the data is wrong.)',
  'LGTM 👍 (did not read the 4,000-line SQL diff)',
  'a data lake without governance is just a data swamp 🐊',
  'my code has no bugs, only undocumented features',
];

export const duckTips = [
  'Have you checked the timezone?',
  'Is it NULL? It’s always NULL.',
  'Check your join keys for duplicates.',
  'Did you try turning the DAG off and on again?',
  'Quack. (It’s schema drift.)',
  'Read the error message. Out loud. To me.',
];

export const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
