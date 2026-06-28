export type Category = {
  slug: string;
  name: string;
  /** Tailwind-friendly accent color (hex) used for cards & headers */
  color: string;
  emoji: string;
  /** Signature "Guess the ___" tag shown on every quiz card in this category */
  tag: string;
};

export type VisualMode = "question-image" | "answer-images" | "both";

export function usesQuestionImages(mode?: VisualMode): boolean {
  return mode === "question-image" || mode === "both";
}

export function usesAnswerImages(mode?: VisualMode): boolean {
  return mode === "answer-images" || mode === "both";
}

export type Question = {
  id: string;
  text: string;
  answers: string[];
  /** index into answers[] */
  correct: number;
  /** Wikipedia search term when it differs from display text (e.g. "Flag of France") */
  imageQuery?: string;
  /** Per-answer Wikipedia search terms (parallel to answers[]) */
  answerImageQueries?: string[];
};

export type Badge = "AI" | "HARD" | "EASY" | "PLAYED";

export type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string; // category slug
  emoji: string;
  color: string; // cover accent
  plays: number;
  author: string;
  rating: number; // 0-5
  badge?: Badge;
  /** When set, QuizPlayer fetches Wikipedia images for questions and/or answers */
  visualMode?: VisualMode;
  questions: Question[];
};

export const categories: Category[] = [
  { slug: "art-and-literature", name: "Art & Literature", color: "#ff6b6b", emoji: "🎨", tag: "Guess the Author" },
  { slug: "entertainment", name: "Entertainment", color: "#b15bff", emoji: "🎬", tag: "Guess the Movie" },
  { slug: "geography", name: "Geography", color: "#4d8dff", emoji: "🌍", tag: "Guess the City" },
  { slug: "history", name: "History", color: "#c98a3a", emoji: "🏛️", tag: "Guess the President" },
  { slug: "languages", name: "Languages", color: "#00a76d", emoji: "💬", tag: "Guess the Word" },
  { slug: "science-and-nature", name: "Science & Nature", color: "#1fb6a6", emoji: "🔬", tag: "Guess the Element" },
  { slug: "sports", name: "Sports", color: "#ff9f43", emoji: "⚽", tag: "Guess the Footballer" },
  { slug: "trivia", name: "Trivia", color: "#ffc24b", emoji: "🧠", tag: "Guess the Answer" },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

function q(
  id: string,
  text: string,
  answers: string[],
  correct: number,
): Question {
  return { id, text, answers, correct };
}

function vq(
  id: string,
  text: string,
  answers: string[],
  correct: number,
  imageQuery?: string,
  answerImageQueries?: string[],
): Question {
  return { id, text, answers, correct, imageQuery, answerImageQueries };
}

export const quizzes: Quiz[] = [
  {
    id: "world-capitals",
    title: "World Capitals",
    description: "Do you know your capital cities? Prove it.",
    category: "geography",
    emoji: "🗺️",
    color: "#4d8dff",
    plays: 18420,
    author: "GlobeTrotter",
    rating: 4.4,
    questions: [
      q("wc1", "What is the capital of Australia?", ["Sydney", "Canberra", "Melbourne", "Perth"], 1),
      q("wc2", "What is the capital of Canada?", ["Toronto", "Vancouver", "Ottawa", "Montreal"], 2),
      q("wc3", "What is the capital of Egypt?", ["Cairo", "Alexandria", "Giza", "Luxor"], 0),
      q("wc4", "What is the capital of Brazil?", ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], 2),
      q("wc5", "What is the capital of Japan?", ["Osaka", "Kyoto", "Tokyo", "Nagoya"], 2),
    ],
  },
  {
    id: "space-explorers",
    title: "Space & The Solar System",
    description: "A journey through the planets and beyond.",
    category: "science-and-nature",
    emoji: "🚀",
    color: "#1fb6a6",
    plays: 12030,
    author: "StarGazer",
    rating: 4.1,
    questions: [
      q("sp1", "Which planet is closest to the Sun?", ["Venus", "Mercury", "Mars", "Earth"], 1),
      q("sp2", "What is the largest planet in our solar system?", ["Saturn", "Neptune", "Jupiter", "Uranus"], 2),
      q("sp3", "What force keeps planets in orbit around the Sun?", ["Magnetism", "Gravity", "Friction", "Inertia"], 1),
      q("sp4", "How many moons does Earth have?", ["0", "1", "2", "3"], 1),
      q("sp5", "Which planet is known as the Red Planet?", ["Jupiter", "Venus", "Mars", "Mercury"], 2),
    ],
  },
  {
    id: "movie-mania",
    title: "Movie Mania",
    description: "Test your knowledge of blockbuster films.",
    category: "entertainment",
    emoji: "🎞️",
    color: "#b15bff",
    plays: 25110,
    author: "ReelDeal",
    rating: 4.3,
    badge: "PLAYED",
    questions: [
      q("mm1", "Which film features a character named Jack Dawson?", ["Titanic", "The Notebook", "Avatar", "Inception"], 0),
      q("mm2", "What kind of animal is Simba?", ["Tiger", "Lion", "Leopard", "Cheetah"], 1),
      q("mm3", "In which city is the movie 'Lost in Translation' set?", ["Seoul", "Beijing", "Tokyo", "Bangkok"], 2),
      q("mm4", "Which director is known for 'Jaws' and 'E.T.'?", ["George Lucas", "Steven Spielberg", "Ridley Scott", "James Cameron"], 1),
      q("mm5", "What color is the rabbit in 'Alice in Wonderland' famously late?", ["A blue caterpillar", "A white rabbit", "A purple cat", "A green frog"], 1),
    ],
  },
  {
    id: "ancient-history",
    title: "Ancient Civilizations",
    description: "From pharaohs to philosophers.",
    category: "history",
    emoji: "🏺",
    color: "#c98a3a",
    plays: 9870,
    author: "TimeKeeper",
    rating: 3.9,
    badge: "HARD",
    questions: [
      q("ah1", "The Great Pyramid was built in which country?", ["Greece", "Egypt", "Italy", "Iraq"], 1),
      q("ah2", "Who was the first Roman emperor?", ["Julius Caesar", "Nero", "Augustus", "Caligula"], 2),
      q("ah3", "Which ancient civilization invented democracy?", ["Romans", "Greeks", "Persians", "Egyptians"], 1),
      q("ah4", "The Colosseum is located in which modern city?", ["Athens", "Cairo", "Rome", "Istanbul"], 2),
      q("ah5", "Hieroglyphs were a writing system used by the ancient...?", ["Mayans", "Egyptians", "Chinese", "Vikings"], 1),
    ],
  },
  {
    id: "classic-novels",
    title: "Classic Novels",
    description: "Great works of literature through the ages.",
    category: "art-and-literature",
    emoji: "📚",
    color: "#ff6b6b",
    plays: 7600,
    author: "PageTurner",
    rating: 4.0,
    questions: [
      q("cn1", "Who wrote 'Romeo and Juliet'?", ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], 1),
      q("cn2", "'Moby Dick' is a story primarily about hunting what?", ["A shark", "A whale", "A giant squid", "A pirate"], 1),
      q("cn3", "Who wrote 'Pride and Prejudice'?", ["Jane Austen", "Emily Brontë", "Virginia Woolf", "Louisa May Alcott"], 0),
      q("cn4", "In which novel would you find the character Sherlock Holmes?", ["Dracula", "A Study in Scarlet", "Frankenstein", "Great Expectations"], 1),
      q("cn5", "Who is the author of 'The Old Man and the Sea'?", ["John Steinbeck", "Ernest Hemingway", "F. Scott Fitzgerald", "Herman Melville"], 1),
    ],
  },
  {
    id: "world-languages",
    title: "Hello Around the World",
    description: "Greetings and words from many languages.",
    category: "languages",
    emoji: "🌐",
    color: "#00a76d",
    plays: 5430,
    author: "Polyglot",
    rating: 4.2,
    badge: "EASY",
    questions: [
      q("wl1", "How do you say 'hello' in Spanish?", ["Bonjour", "Ciao", "Hola", "Hallo"], 2),
      q("wl2", "'Arigato' means 'thank you' in which language?", ["Korean", "Japanese", "Thai", "Chinese"], 1),
      q("wl3", "Which language has the most native speakers worldwide?", ["English", "Spanish", "Mandarin Chinese", "Hindi"], 2),
      q("wl4", "'Merci' is 'thank you' in which language?", ["Italian", "French", "Portuguese", "German"], 1),
      q("wl5", "In which language would you say 'Guten Tag'?", ["Dutch", "Swedish", "German", "Danish"], 2),
    ],
  },
  {
    id: "sports-legends",
    title: "Sports Legends",
    description: "Champions, records and iconic moments.",
    category: "sports",
    emoji: "🏆",
    color: "#ff9f43",
    plays: 14200,
    author: "MVP",
    rating: 4.0,
    questions: [
      q("sl1", "How many players are on a standard soccer team on the field?", ["9", "10", "11", "12"], 2),
      q("sl2", "In which sport would you perform a 'slam dunk'?", ["Tennis", "Basketball", "Volleyball", "Hockey"], 1),
      q("sl3", "How often are the Summer Olympic Games held?", ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], 2),
      q("sl4", "In tennis, what is a score of zero called?", ["Nil", "Love", "Duck", "Blank"], 1),
      q("sl5", "Which sport uses a shuttlecock?", ["Squash", "Badminton", "Table tennis", "Cricket"], 1),
    ],
  },
  {
    id: "general-trivia",
    title: "General Knowledge Mix",
    description: "A little bit of everything to keep you sharp.",
    category: "trivia",
    emoji: "🧩",
    color: "#ffc24b",
    plays: 31050,
    author: "QuizWhiz",
    rating: 4.5,
    questions: [
      q("gt1", "How many continents are there on Earth?", ["5", "6", "7", "8"], 2),
      q("gt2", "What is the chemical symbol for gold?", ["Go", "Gd", "Au", "Ag"], 2),
      q("gt3", "How many sides does a hexagon have?", ["5", "6", "7", "8"], 1),
      q("gt4", "What is the largest mammal in the world?", ["Elephant", "Blue whale", "Giraffe", "Hippopotamus"], 1),
      q("gt5", "Which is the smallest prime number?", ["0", "1", "2", "3"], 2),
    ],
  },
  {
    id: "human-body",
    title: "The Human Body",
    description: "How well do you know yourself?",
    category: "science-and-nature",
    emoji: "🫀",
    color: "#1fb6a6",
    plays: 8900,
    author: "DocBytes",
    rating: 3.8,
    badge: "AI",
    questions: [
      q("hb1", "How many bones are in the adult human body?", ["106", "206", "306", "406"], 1),
      q("hb2", "Which organ pumps blood around the body?", ["Lungs", "Liver", "Heart", "Kidney"], 2),
      q("hb3", "How many lungs does a human have?", ["1", "2", "3", "4"], 1),
      q("hb4", "What is the largest organ of the human body?", ["Brain", "Liver", "Skin", "Heart"], 2),
      q("hb5", "Which vitamin do we mainly get from sunlight?", ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], 2),
    ],
  },
  {
    id: "famous-landmarks",
    title: "Famous Landmarks",
    description: "Wonders and icons from across the globe.",
    category: "geography",
    emoji: "🗽",
    color: "#4d8dff",
    plays: 11320,
    author: "Wanderer",
    rating: 4.1,
    visualMode: "question-image",
    questions: [
      vq("fl1", "In which country is this landmark?", ["Italy", "France", "Spain", "Belgium"], 1, "Eiffel Tower"),
      vq("fl2", "In which country is this landmark?", ["Japan", "India", "China", "Mongolia"], 2, "Great Wall of China"),
      vq("fl3", "In which US city is this landmark?", ["Boston", "New York", "Washington", "Chicago"], 1, "Statue of Liberty"),
      vq("fl4", "In which country is this landmark?", ["Pakistan", "India", "Iran", "Nepal"], 1, "Taj Mahal"),
      vq("fl5", "In which country is this landmark?", ["Mexico", "Chile", "Peru", "Bolivia"], 2, "Machu Picchu"),
    ],
  },
  {
    id: "famous-painters",
    title: "Famous Painters",
    description: "Masterpieces and the artists behind them.",
    category: "art-and-literature",
    emoji: "🖼️",
    color: "#ff6b6b",
    plays: 6240,
    author: "Curator",
    rating: 4.2,
    questions: [
      q("fp1", "Who painted the Mona Lisa?", ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Rembrandt"], 1),
      q("fp2", "'The Starry Night' was painted by?", ["Claude Monet", "Salvador Dalí", "Vincent van Gogh", "Henri Matisse"], 2),
      q("fp3", "Which artist famously cut off part of his own ear?", ["Pablo Picasso", "Vincent van Gogh", "Michelangelo", "Andy Warhol"], 1),
      q("fp4", "Who painted the ceiling of the Sistine Chapel?", ["Raphael", "Donatello", "Michelangelo", "Caravaggio"], 2),
      q("fp5", "Salvador Dalí is most associated with which art movement?", ["Cubism", "Surrealism", "Impressionism", "Pop Art"], 1),
    ],
  },
  {
    id: "music-legends",
    title: "Music Legends",
    description: "From rock anthems to pop royalty.",
    category: "entertainment",
    emoji: "🎵",
    color: "#b15bff",
    plays: 19880,
    author: "VinylVibes",
    rating: 4.4,
    questions: [
      q("ml1", "Which band performed 'Bohemian Rhapsody'?", ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"], 1),
      q("ml2", "Who is known as the 'King of Pop'?", ["Elvis Presley", "Michael Jackson", "Prince", "Justin Timberlake"], 1),
      q("ml3", "How many strings does a standard guitar have?", ["4", "5", "6", "7"], 2),
      q("ml4", "Which instrument has 88 keys?", ["Organ", "Piano", "Accordion", "Harpsichord"], 1),
      q("ml5", "'Like a Rolling Stone' is a classic song by?", ["David Bowie", "Bob Dylan", "Bruce Springsteen", "Neil Young"], 1),
    ],
  },
  {
    id: "flags-of-the-world",
    title: "Flags of the World",
    description: "197 countries — random flags every game, no repeats.",
    category: "geography",
    emoji: "🚩",
    color: "#4d8dff",
    plays: 10240,
    author: "GlobeTrotter",
    rating: 4.0,
    visualMode: "question-image",
    // Questions are generated client-side from the full country pool.
    questions: [],
  },
  {
    id: "world-war-two",
    title: "World War II",
    description: "The conflict that reshaped the modern world.",
    category: "history",
    emoji: "⚔️",
    color: "#c98a3a",
    plays: 13760,
    author: "TimeKeeper",
    rating: 4.3,
    badge: "HARD",
    questions: [
      q("ww1", "In which year did World War II end?", ["1943", "1945", "1947", "1950"], 1),
      q("ww2", "Which attack brought the United States into the war?", ["Battle of Britain", "Pearl Harbor", "D-Day", "Fall of Berlin"], 1),
      q("ww3", "The D-Day landings took place on the beaches of?", ["Sicily", "Normandy", "Dunkirk", "Anzio"], 1),
      q("ww4", "Who was British Prime Minister for most of WWII?", ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"], 1),
      q("ww5", "Atomic bombs were dropped on Hiroshima and which other city?", ["Tokyo", "Nagasaki", "Osaka", "Kyoto"], 1),
    ],
  },
  {
    id: "words-and-alphabets",
    title: "Words & Alphabets",
    description: "Letters, greetings and language trivia.",
    category: "languages",
    emoji: "🔤",
    color: "#00a76d",
    plays: 4980,
    author: "Polyglot",
    rating: 4.1,
    questions: [
      q("wa1", "How many letters are in the English alphabet?", ["24", "25", "26", "27"], 2),
      q("wa2", "'Ciao' is a casual greeting from which language?", ["Spanish", "Italian", "Portuguese", "Romanian"], 1),
      q("wa3", "Which alphabet is used to write Russian?", ["Latin", "Cyrillic", "Greek", "Arabic"], 1),
      q("wa4", "'Sí' means 'yes' in which language?", ["French", "Spanish", "German", "Dutch"], 1),
      q("wa5", "What do you call a word borrowed from another language?", ["A cognate", "A loanword", "A synonym", "An idiom"], 1),
    ],
  },
  {
    id: "animal-kingdom",
    title: "Animal Kingdom",
    description: "Creatures great and small.",
    category: "science-and-nature",
    emoji: "🐾",
    color: "#1fb6a6",
    plays: 15670,
    author: "WildWatch",
    rating: 4.4,
    badge: "EASY",
    visualMode: "question-image",
    questions: [
      vq("ak1", "What animal is this?", ["White rhino", "African elephant", "Hippopotamus", "Giraffe"], 1, "African elephant"),
      vq("ak2", "What animal is this?", ["Ant", "Spider", "Beetle", "Centipede"], 1, "Spider"),
      vq("ak3", "What animal is this?", ["Flying squirrel", "Bat", "Sugar glider", "Colugo"], 1, "Bat"),
      vq("ak4", "What animal is this?", ["Tiger", "Lion", "Leopard", "Cheetah"], 1, "Lion"),
      vq("ak5", "What animal is this?", ["Eagle", "Penguin", "Swan", "Falcon"], 1, "Penguin"),
    ],
  },
  {
    id: "the-olympics",
    title: "The Olympics",
    description: "Going for gold through Olympic history.",
    category: "sports",
    emoji: "🥇",
    color: "#ff9f43",
    plays: 9120,
    author: "MVP",
    rating: 4.2,
    questions: [
      q("ol1", "How often are the Summer Olympic Games held?", ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], 2),
      q("ol2", "In which country did the Olympic Games originate?", ["Italy", "Greece", "Egypt", "China"], 1),
      q("ol3", "How many rings are on the Olympic flag?", ["4", "5", "6", "7"], 1),
      q("ol4", "Which medal is awarded for first place?", ["Silver", "Gold", "Bronze", "Platinum"], 1),
      q("ol5", "A marathon is approximately how many kilometres?", ["21 km", "32 km", "42 km", "50 km"], 2),
    ],
  },
  {
    id: "food-and-drink",
    title: "Food & Drink",
    description: "A tasty tour of the world's kitchens.",
    category: "trivia",
    emoji: "🍕",
    color: "#ffc24b",
    plays: 21340,
    author: "QuizWhiz",
    rating: 4.3,
    questions: [
      q("fd1", "Which fruit is traditionally used to make wine?", ["Apples", "Grapes", "Cherries", "Plums"], 1),
      q("fd2", "Sushi originally comes from which country?", ["China", "Japan", "Thailand", "Korea"], 1),
      q("fd3", "What is the main ingredient in guacamole?", ["Tomato", "Avocado", "Pea", "Cucumber"], 1),
      q("fd4", "Which spice is the most expensive by weight?", ["Cinnamon", "Saffron", "Vanilla", "Cardamom"], 1),
      q("fd5", "Which pasta is shaped like short tubes?", ["Penne", "Spaghetti", "Fusilli", "Ravioli"], 0),
    ],
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === id);
}

export function getQuizzesByCategory(slug: string): Quiz[] {
  return quizzes.filter((quiz) => quiz.category === slug);
}

export function getFeaturedQuizzes(limit = 8): Quiz[] {
  return [...quizzes].sort((a, b) => b.plays - a.plays).slice(0, limit);
}

export function getByRating(): Quiz[] {
  return [...quizzes].sort((a, b) => b.rating - a.rating);
}

export function getAiQuizzes(): Quiz[] {
  const ai = quizzes.filter((q) => q.badge === "AI");
  // pad with others so the row always feels full
  const rest = quizzes.filter((q) => q.badge !== "AI");
  return [...ai, ...rest];
}

export function getRandomSelection(seed = 7): Quiz[] {
  return [...quizzes].sort(
    (a, b) =>
      ((a.id.charCodeAt(0) * seed) % 13) - ((b.id.charCodeAt(0) * seed) % 13),
  );
}

/** Homepage row definitions */
export const homeRows: { title: string; quizzes: Quiz[] }[] = [
  { title: "Recently published", quizzes: [...quizzes].reverse() },
  { title: "Best rating right now", quizzes: getByRating() },
  { title: "Popular right now", quizzes: getFeaturedQuizzes(quizzes.length) },
  { title: "Random selection", quizzes: getRandomSelection() },
];
