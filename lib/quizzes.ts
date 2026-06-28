import { Quiz } from "./types";

export const CATEGORIES = [
  "All",
  "Featured",
  "Science",
  "History",
  "Geography",
  "Math",
  "Pop Culture",
  "Sports",
  "Languages",
  "Fun",
] as const;

export const quizzes: Quiz[] = [
  {
    id: "general-knowledge",
    title: "General Knowledge Quiz",
    description: "Test your knowledge across a variety of topics!",
    creator: "Kahoot Academy",
    questionCount: 10,
    plays: 2847593,
    category: "Featured",
    tags: ["trivia", "general"],
    coverGradient: "linear-gradient(135deg, #46178f 0%, #864cbf 100%)",
    coverIcon: "🧠",
    isFree: true,
    questions: [
      {
        id: "q1",
        text: "What is the capital of France?",
        timeLimit: 20,
        answers: [
          { text: "London", color: "red", correct: false },
          { text: "Paris", color: "blue", correct: true },
          { text: "Berlin", color: "yellow", correct: false },
          { text: "Madrid", color: "green", correct: false },
        ],
      },
      {
        id: "q2",
        text: "Which planet is known as the Red Planet?",
        timeLimit: 20,
        answers: [
          { text: "Venus", color: "red", correct: false },
          { text: "Jupiter", color: "blue", correct: false },
          { text: "Mars", color: "yellow", correct: true },
          { text: "Saturn", color: "green", correct: false },
        ],
      },
      {
        id: "q3",
        text: "What is 7 × 8?",
        timeLimit: 15,
        answers: [
          { text: "54", color: "red", correct: false },
          { text: "56", color: "blue", correct: true },
          { text: "58", color: "yellow", correct: false },
          { text: "64", color: "green", correct: false },
        ],
      },
      {
        id: "q4",
        text: "Who painted the Mona Lisa?",
        timeLimit: 20,
        answers: [
          { text: "Van Gogh", color: "red", correct: false },
          { text: "Picasso", color: "blue", correct: false },
          { text: "Da Vinci", color: "yellow", correct: true },
          { text: "Rembrandt", color: "green", correct: false },
        ],
      },
      {
        id: "q5",
        text: "What is the largest ocean on Earth?",
        timeLimit: 20,
        answers: [
          { text: "Atlantic", color: "red", correct: false },
          { text: "Indian", color: "blue", correct: false },
          { text: "Arctic", color: "yellow", correct: false },
          { text: "Pacific", color: "green", correct: true },
        ],
      },
    ],
  },
  {
    id: "science-facts",
    title: "Amazing Science Facts",
    description: "Explore the wonders of science with fun facts!",
    creator: "Science Hub",
    questionCount: 8,
    plays: 1523847,
    category: "Science",
    tags: ["science", "facts"],
    coverGradient: "linear-gradient(135deg, #1368ce 0%, #45aaf2 100%)",
    coverIcon: "🔬",
    isFree: true,
    questions: [
      {
        id: "s1",
        text: "What is the chemical symbol for gold?",
        timeLimit: 20,
        answers: [
          { text: "Go", color: "red", correct: false },
          { text: "Gd", color: "blue", correct: false },
          { text: "Au", color: "yellow", correct: true },
          { text: "Ag", color: "green", correct: false },
        ],
      },
      {
        id: "s2",
        text: "How many bones are in the adult human body?",
        timeLimit: 20,
        answers: [
          { text: "186", color: "red", correct: false },
          { text: "206", color: "blue", correct: true },
          { text: "256", color: "yellow", correct: false },
          { text: "312", color: "green", correct: false },
        ],
      },
      {
        id: "s3",
        text: "What gas do plants absorb from the atmosphere?",
        timeLimit: 20,
        answers: [
          { text: "Oxygen", color: "red", correct: false },
          { text: "Nitrogen", color: "blue", correct: false },
          { text: "CO₂", color: "yellow", correct: true },
          { text: "Hydrogen", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "world-flags",
    title: "World Flags Quiz (Easy)",
    description: "Can you identify flags from around the world?",
    creator: "GeoMaster",
    questionCount: 12,
    plays: 987654,
    category: "Geography",
    tags: ["flags", "geography"],
    coverGradient: "linear-gradient(135deg, #e21b3c 0%, #ff6b6b 100%)",
    coverIcon: "🏳️",
    isFree: true,
    questions: [
      {
        id: "f1",
        text: "Which country has a flag with a red circle on white?",
        timeLimit: 20,
        answers: [
          { text: "China", color: "red", correct: false },
          { text: "Japan", color: "blue", correct: true },
          { text: "Korea", color: "yellow", correct: false },
          { text: "Vietnam", color: "green", correct: false },
        ],
      },
      {
        id: "f2",
        text: "How many stars are on the US flag?",
        timeLimit: 15,
        answers: [
          { text: "48", color: "red", correct: false },
          { text: "50", color: "blue", correct: true },
          { text: "52", color: "yellow", correct: false },
          { text: "13", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "emoji-quiz",
    title: "The Emoji Quiz 😀😜😬",
    description: "Guess the phrase from emojis!",
    creator: "FunZone",
    questionCount: 15,
    plays: 3245678,
    category: "Fun",
    tags: ["emoji", "fun"],
    coverGradient: "linear-gradient(135deg, #d89e00 0%, #f9ca24 100%)",
    coverIcon: "😀",
    isFree: true,
    questions: [
      {
        id: "e1",
        text: "🦁👑 — Which movie?",
        timeLimit: 20,
        answers: [
          { text: "Aladdin", color: "red", correct: false },
          { text: "Lion King", color: "blue", correct: true },
          { text: "Jungle Book", color: "yellow", correct: false },
          { text: "Tarzan", color: "green", correct: false },
        ],
      },
      {
        id: "e2",
        text: "🍕🇮🇹 — Which country?",
        timeLimit: 15,
        answers: [
          { text: "France", color: "red", correct: false },
          { text: "Spain", color: "blue", correct: false },
          { text: "Italy", color: "yellow", correct: true },
          { text: "Greece", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "history-mysteries",
    title: "History Mysteries",
    description: "Journey through time with historical trivia!",
    creator: "TimeTraveler",
    questionCount: 10,
    plays: 756432,
    category: "History",
    tags: ["history", "ancient"],
    coverGradient: "linear-gradient(135deg, #26890c 0%, #78e08f 100%)",
    coverIcon: "🏛️",
    isFree: true,
    questions: [
      {
        id: "h1",
        text: "In which year did World War II end?",
        timeLimit: 20,
        answers: [
          { text: "1943", color: "red", correct: false },
          { text: "1944", color: "blue", correct: false },
          { text: "1945", color: "yellow", correct: true },
          { text: "1946", color: "green", correct: false },
        ],
      },
      {
        id: "h2",
        text: "Who was the first President of the United States?",
        timeLimit: 20,
        answers: [
          { text: "Jefferson", color: "red", correct: false },
          { text: "Washington", color: "blue", correct: true },
          { text: "Lincoln", color: "yellow", correct: false },
          { text: "Adams", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "math-challenge",
    title: "Math Challenge",
    description: "Put your math skills to the test!",
    creator: "MathWiz",
    questionCount: 10,
    plays: 543210,
    category: "Math",
    tags: ["math", "numbers"],
    coverGradient: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
    coverIcon: "🔢",
    isFree: true,
    questions: [
      {
        id: "m1",
        text: "What is the square root of 144?",
        timeLimit: 15,
        answers: [
          { text: "10", color: "red", correct: false },
          { text: "11", color: "blue", correct: false },
          { text: "12", color: "yellow", correct: true },
          { text: "14", color: "green", correct: false },
        ],
      },
      {
        id: "m2",
        text: "What is π (pi) approximately?",
        timeLimit: 15,
        answers: [
          { text: "2.14", color: "red", correct: false },
          { text: "3.14", color: "blue", correct: true },
          { text: "4.14", color: "yellow", correct: false },
          { text: "3.41", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "pop-culture",
    title: "Pop Culture Trivia",
    description: "Movies, music, and celebrity gossip!",
    creator: "PopBuzz",
    questionCount: 12,
    plays: 1876543,
    category: "Pop Culture",
    tags: ["movies", "music"],
    coverGradient: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
    coverIcon: "🎬",
    isFree: true,
    questions: [
      {
        id: "p1",
        text: "Who sang 'Thriller'?",
        timeLimit: 20,
        answers: [
          { text: "Prince", color: "red", correct: false },
          { text: "Michael Jackson", color: "blue", correct: true },
          { text: "Elvis", color: "yellow", correct: false },
          { text: "Madonna", color: "green", correct: false },
        ],
      },
    ],
  },
  {
    id: "sports-legends",
    title: "Sports Legends",
    description: "Test your sports knowledge!",
    creator: "SportsFan",
    questionCount: 10,
    plays: 654321,
    category: "Sports",
    tags: ["sports", "olympics"],
    coverGradient: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
    coverIcon: "⚽",
    isFree: true,
    questions: [
      {
        id: "sp1",
        text: "How many players are on a soccer team?",
        timeLimit: 15,
        answers: [
          { text: "9", color: "red", correct: false },
          { text: "10", color: "blue", correct: false },
          { text: "11", color: "yellow", correct: true },
          { text: "12", color: "green", correct: false },
        ],
      },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}

export function formatPlays(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
