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
  {
    id: "shakespeare-world",
    title: "Shakespeare & Drama",
    description: "The Bard's plays, quotes, and the stage.",
    category: "art-and-literature",
    emoji: "🎭",
    color: "#ff6b6b",
    plays: 5820,
    author: "PageTurner",
    rating: 4.1,
    questions: [
      q("sw1", "In which city was William Shakespeare born?", ["London", "Stratford-upon-Avon", "Oxford", "Cambridge"], 1),
      q("sw2", "Which play features the characters Romeo and Juliet?", ["Hamlet", "Macbeth", "Romeo and Juliet", "Othello"], 2),
      q("sw3", "'To be, or not to be' is a famous line from which play?", ["King Lear", "Hamlet", "The Tempest", "Twelfth Night"], 1),
      q("sw4", "Which Shakespeare play features three witches?", ["Julius Caesar", "Macbeth", "Richard III", "Henry V"], 1),
      q("sw5", "The Globe Theatre is most associated with which playwright?", ["Christopher Marlowe", "William Shakespeare", "Ben Jonson", "John Webster"], 1),
    ],
  },
  {
    id: "poetry-masters",
    title: "Poetry Masters",
    description: "Verses, poets, and literary classics.",
    category: "art-and-literature",
    emoji: "✒️",
    color: "#ff6b6b",
    plays: 4310,
    author: "Curator",
    rating: 3.9,
    questions: [
      q("pm1", "Who wrote 'The Raven'?", ["Emily Dickinson", "Edgar Allan Poe", "Walt Whitman", "Robert Frost"], 1),
      q("pm2", "'I wandered lonely as a cloud' is by which poet?", ["John Keats", "William Wordsworth", "Lord Byron", "Percy Shelley"], 1),
      q("pm3", "Who wrote 'Still I Rise'?", ["Maya Angelou", "Toni Morrison", "Alice Walker", "Audre Lorde"], 0),
      q("pm4", "A sonnet traditionally has how many lines?", ["12", "14", "16", "20"], 1),
      q("pm5", "Who wrote the epic poem 'Paradise Lost'?", ["John Milton", "Geoffrey Chaucer", "Samuel Taylor Coleridge", "Alexander Pope"], 0),
    ],
  },
  {
    id: "world-mythology",
    title: "World Mythology",
    description: "Gods, heroes, and legends from every culture.",
    category: "art-and-literature",
    emoji: "⚡",
    color: "#ff6b6b",
    plays: 6780,
    author: "PageTurner",
    rating: 4.3,
    questions: [
      q("wm1", "In Greek mythology, who is the king of the gods?", ["Poseidon", "Hades", "Zeus", "Apollo"], 2),
      q("wm2", "Thor is a god in which mythology?", ["Roman", "Norse", "Egyptian", "Celtic"], 1),
      q("wm3", "Anubis is associated with which ancient civilization?", ["Greek", "Roman", "Egyptian", "Mesopotamian"], 2),
      q("wm4", "Who flew too close to the sun with wax wings?", ["Perseus", "Icarus", "Theseus", "Hercules"], 1),
      q("wm5", "The Minotaur lived in a labyrinth on which island?", ["Crete", "Sicily", "Cyprus", "Rhodes"], 0),
    ],
  },
  {
    id: "tv-shows",
    title: "TV Shows & Series",
    description: "Binge-worthy hits from the small screen.",
    category: "entertainment",
    emoji: "📺",
    color: "#b15bff",
    plays: 16420,
    author: "ReelDeal",
    rating: 4.2,
    questions: [
      q("tv1", "Which series is set in the fictional town of Hawkins, Indiana?", ["Riverdale", "Stranger Things", "Twin Peaks", "Euphoria"], 1),
      q("tv2", "In 'Friends', how many main characters are there?", ["4", "5", "6", "7"], 2),
      q("tv3", "Which show features dragons and the Iron Throne?", ["The Witcher", "Game of Thrones", "Vikings", "The Last Kingdom"], 1),
      q("tv4", "'Breaking Bad' is primarily set in which US state?", ["California", "Texas", "New Mexico", "Arizona"], 2),
      q("tv5", "Which animated series follows the Simpson family?", ["Family Guy", "The Simpsons", "South Park", "Bob's Burgers"], 1),
    ],
  },
  {
    id: "animation-classics",
    title: "Animation Classics",
    description: "Pixar, Disney, and animated favorites.",
    category: "entertainment",
    emoji: "🎨",
    color: "#b15bff",
    plays: 12890,
    author: "VinylVibes",
    rating: 4.5,
    questions: [
      q("ac1", "Which film features a clownfish named Nemo?", ["Shark Tale", "Finding Nemo", "The Little Mermaid", "Moana"], 1),
      q("ac2", "Elsa and Anna are characters from which film?", ["Tangled", "Frozen", "Brave", "Encanto"], 1),
      q("ac3", "Woody and Buzz Lightyear appear in which franchise?", ["Toy Story", "Cars", "Monsters Inc.", "WALL-E"], 0),
      q("ac4", "Which studio created 'Spirited Away'?", ["Pixar", "DreamWorks", "Studio Ghibli", "Illumination"], 2),
      q("ac5", "Simba is the main character of which Disney film?", ["Aladdin", "The Lion King", "Tarzan", "Hercules"], 1),
    ],
  },
  {
    id: "blockbuster-franchises",
    title: "Blockbuster Franchises",
    description: "Marvel, Star Wars, and cinematic universes.",
    category: "entertainment",
    emoji: "🦸",
    color: "#b15bff",
    plays: 22100,
    author: "ReelDeal",
    rating: 4.4,
    questions: [
      q("bf1", "What is Iron Man's real name?", ["Steve Rogers", "Tony Stark", "Bruce Banner", "Clint Barton"], 1),
      q("bf2", "Which planet is Luke Skywalker from?", ["Coruscant", "Tatooine", "Naboo", "Hoth"], 1),
      q("bf3", "Who plays Jack Sparrow in 'Pirates of the Caribbean'?", ["Orlando Bloom", "Johnny Depp", "Geoffrey Rush", "Hugh Jackman"], 1),
      q("bf4", "Harry Potter attends which school of magic?", ["Beauxbatons", "Durmstrang", "Hogwarts", "Ilvermorny"], 2),
      q("bf5", "Which hero is known as the 'Dark Knight'?", ["Superman", "Batman", "Spider-Man", "Wolverine"], 1),
    ],
  },
  {
    id: "world-rivers",
    title: "Rivers & Lakes",
    description: "Great waterways and where they flow.",
    category: "geography",
    emoji: "🌊",
    color: "#4d8dff",
    plays: 7340,
    author: "Wanderer",
    rating: 4.0,
    questions: [
      q("wr1", "Which is the longest river in the world?", ["Amazon", "Nile", "Yangtze", "Mississippi"], 1),
      q("wr2", "The Amazon River flows mainly through which continent?", ["Africa", "Asia", "South America", "North America"], 2),
      q("wr3", "Which river runs through Paris?", ["Thames", "Rhine", "Seine", "Danube"], 2),
      q("wr4", "Lake Victoria is located in which region?", ["South America", "East Africa", "Central Asia", "Scandinavia"], 1),
      q("wr5", "The Danube flows into which sea?", ["Mediterranean", "Black Sea", "Red Sea", "Caspian Sea"], 1),
    ],
  },
  {
    id: "african-geography",
    title: "Africa Explorer",
    description: "Countries, capitals, and landmarks across Africa.",
    category: "geography",
    emoji: "🌍",
    color: "#4d8dff",
    plays: 6120,
    author: "GlobeTrotter",
    rating: 4.1,
    questions: [
      q("ag1", "What is the capital of Kenya?", ["Lagos", "Nairobi", "Addis Ababa", "Accra"], 1),
      q("ag2", "Which desert covers much of northern Africa?", ["Gobi", "Kalahari", "Sahara", "Atacama"], 2),
      q("ag3", "Mount Kilimanjaro is in which country?", ["Kenya", "Tanzania", "Ethiopia", "Uganda"], 1),
      q("ag4", "What is the capital of Egypt?", ["Cairo", "Alexandria", "Casablanca", "Tripoli"], 0),
      q("ag5", "Which African country is completely surrounded by South Africa?", ["Lesotho", "Botswana", "Namibia", "Zimbabwe"], 0),
    ],
  },
  {
    id: "european-cities",
    title: "European Cities",
    description: "Capitals, culture, and iconic destinations.",
    category: "geography",
    emoji: "🏰",
    color: "#4d8dff",
    plays: 8890,
    author: "GlobeTrotter",
    rating: 4.2,
    questions: [
      q("ec1", "What is the capital of France?", ["Lyon", "Marseille", "Paris", "Nice"], 2),
      q("ec2", "The Colosseum is in which city?", ["Athens", "Rome", "Madrid", "Vienna"], 1),
      q("ec3", "What is the capital of Germany?", ["Munich", "Hamburg", "Berlin", "Frankfurt"], 2),
      q("ec4", "Big Ben is located in which city?", ["Dublin", "London", "Edinburgh", "Cardiff"], 1),
      q("ec5", "What is the capital of Spain?", ["Barcelona", "Madrid", "Seville", "Valencia"], 1),
    ],
  },
  {
    id: "us-presidents",
    title: "US Presidents",
    description: "Leaders who shaped American history.",
    category: "history",
    emoji: "🇺🇸",
    color: "#c98a3a",
    plays: 10450,
    author: "TimeKeeper",
    rating: 4.0,
    questions: [
      q("up1", "Who was the first President of the United States?", ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"], 1),
      q("up2", "Which president issued the Emancipation Proclamation?", ["Andrew Jackson", "Abraham Lincoln", "Ulysses Grant", "Theodore Roosevelt"], 1),
      q("up3", "Who was president during most of World War II?", ["Herbert Hoover", "Franklin D. Roosevelt", "Harry Truman", "Dwight Eisenhower"], 1),
      q("up4", "Mount Rushmore is in which US state?", ["Montana", "South Dakota", "Wyoming", "Colorado"], 1),
      q("up5", "Which president resigned from office in 1974?", ["Lyndon Johnson", "Richard Nixon", "Gerald Ford", "Jimmy Carter"], 1),
    ],
  },
  {
    id: "medieval-europe",
    title: "Medieval Europe",
    description: "Knights, castles, and the Middle Ages.",
    category: "history",
    emoji: "🏰",
    color: "#c98a3a",
    plays: 7680,
    author: "TimeKeeper",
    rating: 3.8,
    questions: [
      q("me1", "What was a knight's code of honor called?", ["The Magna Carta", "Chivalry", "Feudalism", "The Crusade"], 1),
      q("me2", "The Black Death spread across Europe in which century?", ["12th", "13th", "14th", "15th"], 2),
      q("me3", "Joan of Arc fought for which country?", ["England", "France", "Spain", "Italy"], 1),
      q("me4", "What was the primary religion of medieval Europe?", ["Islam", "Christianity", "Judaism", "Buddhism"], 1),
      q("me5", "Castles often had a surrounding water barrier called a...?", ["Rampart", "Moat", "Parapet", "Drawbridge"], 1),
    ],
  },
  {
    id: "ancient-rome",
    title: "Ancient Rome",
    description: "Empire, emperors, and Roman life.",
    category: "history",
    emoji: "🏛️",
    color: "#c98a3a",
    plays: 9230,
    author: "TimeKeeper",
    rating: 4.2,
    questions: [
      q("ar1", "What language did the ancient Romans speak?", ["Greek", "Latin", "Italian", "French"], 1),
      q("ar2", "Who famously crossed the Rubicon river?", ["Augustus", "Julius Caesar", "Nero", "Marcus Aurelius"], 1),
      q("ar3", "The Colosseum was used primarily for what?", ["Markets", "Gladiator games", "Senate meetings", "Temples"], 1),
      q("ar4", "Which volcano destroyed Pompeii?", ["Etna", "Vesuvius", "Stromboli", "Krakatoa"], 1),
      q("ar5", "Romulus and Remus are legendary founders of which city?", ["Athens", "Rome", "Carthage", "Sparta"], 1),
    ],
  },
  {
    id: "french-phrases",
    title: "French Phrases",
    description: "Essential French words and expressions.",
    category: "languages",
    emoji: "🇫🇷",
    color: "#00a76d",
    plays: 5560,
    author: "Polyglot",
    rating: 4.0,
    questions: [
      q("fpf1", "What does 'Bonjour' mean?", ["Goodbye", "Hello", "Please", "Thank you"], 1),
      q("fpf2", "'Au revoir' means?", ["See you later", "Goodbye", "Good morning", "Excuse me"], 1),
      q("fpf3", "How do you say 'thank you' in French?", ["Merci", "Pardon", "S'il vous plaît", "Oui"], 0),
      q("fpf4", "'Oui' means?", ["No", "Yes", "Maybe", "Hello"], 1),
      q("fpf5", "What does 'Excusez-moi' mean?", ["Excuse me", "You're welcome", "I love you", "How are you"], 0),
    ],
  },
  {
    id: "word-origins",
    title: "Word Origins",
    description: "Etymology and where words come from.",
    category: "languages",
    emoji: "📖",
    color: "#00a76d",
    plays: 4890,
    author: "Polyglot",
    rating: 4.1,
    questions: [
      q("wo1", "The word 'alphabet' comes from Greek letters Alpha and...?", ["Omega", "Beta", "Gamma", "Delta"], 1),
      q("wo2", "'Kindergarten' is a word borrowed from which language?", ["French", "German", "Dutch", "Swedish"], 1),
      q("wo3", "The word 'robot' was popularized from which language?", ["English", "Czech", "Japanese", "Russian"], 1),
      q("wo4", "'Piano' is derived from which language?", ["Spanish", "Italian", "Portuguese", "Latin"], 1),
      q("wo5", "The study of word origins is called?", ["Syntax", "Etymology", "Phonetics", "Semantics"], 1),
    ],
  },
  {
    id: "language-families",
    title: "Language Families",
    description: "How the world's languages are related.",
    category: "languages",
    emoji: "🗣️",
    color: "#00a76d",
    plays: 4120,
    author: "Polyglot",
    rating: 3.9,
    questions: [
      q("lf1", "English belongs to which language family?", ["Romance", "Germanic", "Slavic", "Semitic"], 1),
      q("lf2", "Spanish and Italian belong to which family?", ["Germanic", "Romance", "Celtic", "Baltic"], 1),
      q("lf3", "Arabic and Hebrew are part of which family?", ["Indo-European", "Semitic", "Turkic", "Dravidian"], 1),
      q("lf4", "Hindi and Sanskrit belong to which family?", ["Sino-Tibetan", "Indo-European", "Afro-Asiatic", "Austronesian"], 1),
      q("lf5", "Mandarin Chinese belongs to which language family?", ["Sino-Tibetan", "Altaic", "Japonic", "Austroasiatic"], 0),
    ],
  },
  {
    id: "chemistry-basics",
    title: "Chemistry Basics",
    description: "Elements, atoms, and the periodic table.",
    category: "science-and-nature",
    emoji: "⚗️",
    color: "#1fb6a6",
    plays: 8450,
    author: "DocBytes",
    rating: 4.0,
    questions: [
      q("cb1", "What is the chemical symbol for water?", ["O2", "H2O", "CO2", "NaCl"], 1),
      q("cb2", "Which gas do plants absorb from the atmosphere?", ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], 2),
      q("cb3", "What is the chemical symbol for iron?", ["Ir", "In", "Fe", "I"], 2),
      q("cb4", "How many protons does a hydrogen atom have?", ["0", "1", "2", "3"], 1),
      q("cb5", "Table salt is primarily made of sodium and...?", ["Potassium", "Chlorine", "Calcium", "Magnesium"], 1),
    ],
  },
  {
    id: "weather-climate",
    title: "Weather & Climate",
    description: "Storms, seasons, and Earth's atmosphere.",
    category: "science-and-nature",
    emoji: "🌦️",
    color: "#1fb6a6",
    plays: 7210,
    author: "WildWatch",
    rating: 4.1,
    questions: [
      q("wcw1", "What instrument measures temperature?", ["Barometer", "Thermometer", "Anemometer", "Hygrometer"], 1),
      q("wcw2", "A tornado is a violently rotating column of...?", ["Water", "Air", "Sand", "Fire"], 1),
      q("wcw3", "Which layer of the atmosphere do we live in?", ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], 1),
      q("wcw4", "Rainbows are caused by light passing through...?", ["Dust", "Water droplets", "Smoke", "Ice only"], 1),
      q("wcw5", "The greenhouse effect is mainly linked to which gas?", ["Oxygen", "Carbon dioxide", "Helium", "Argon"], 1),
    ],
  },
  {
    id: "plant-life",
    title: "Plant Life",
    description: "Trees, flowers, and how plants grow.",
    category: "science-and-nature",
    emoji: "🌿",
    color: "#1fb6a6",
    plays: 6540,
    author: "WildWatch",
    rating: 4.2,
    badge: "EASY",
    questions: [
      q("pl1", "Which part of a plant absorbs water from the soil?", ["Leaves", "Roots", "Flowers", "Stem bark"], 1),
      q("pl2", "Photosynthesis mainly occurs in which part of a plant?", ["Roots", "Leaves", "Seeds", "Fruit"], 1),
      q("pl3", "Which gas do plants release during photosynthesis?", ["Carbon dioxide", "Oxygen", "Nitrogen", "Methane"], 1),
      q("pl4", "An apple tree produces which type of reproductive structure?", ["Spores", "Flowers", "Cones only", "Bulbs"], 1),
      q("pl5", "Which tree is known for its maple syrup?", ["Oak", "Maple", "Pine", "Willow"], 1),
    ],
  },
  {
    id: "football-world",
    title: "Football World",
    description: "Soccer stars, rules, and World Cup history.",
    category: "sports",
    emoji: "⚽",
    color: "#ff9f43",
    plays: 18760,
    author: "MVP",
    rating: 4.3,
    questions: [
      q("fw1", "How long is a standard professional soccer match?", ["80 min", "90 min", "100 min", "120 min"], 1),
      q("fw2", "Which country has won the most FIFA World Cups?", ["Germany", "Brazil", "Italy", "Argentina"], 1),
      q("fw3", "What card means a player must leave the field?", ["Yellow", "Red", "Green", "Blue"], 1),
      q("fw4", "The offside rule applies in which sport?", ["Rugby", "Football (soccer)", "Cricket", "Hockey"], 1),
      q("fw5", "Which trophy is awarded at the FIFA World Cup?", ["Stanley Cup", "World Cup Trophy", "Ashes", "Ryder Cup"], 1),
    ],
  },
  {
    id: "basketball-nba",
    title: "Basketball & NBA",
    description: "Hoops, legends, and court trivia.",
    category: "sports",
    emoji: "🏀",
    color: "#ff9f43",
    plays: 14320,
    author: "MVP",
    rating: 4.2,
    questions: [
      q("bn1", "How many points is a free throw worth?", ["1", "2", "3", "4"], 0),
      q("bn2", "How many players from each team are on court at once?", ["4", "5", "6", "7"], 1),
      q("bn3", "Which country invented basketball?", ["Canada", "United States", "England", "France"], 1),
      q("bn4", "A shot made from behind the arc is worth how many points?", ["2", "3", "4", "5"], 1),
      q("bn5", "The NBA is primarily based in which country?", ["Canada", "United States", "Spain", "Australia"], 1),
    ],
  },
  {
    id: "tennis-champions",
    title: "Tennis Champions",
    description: "Grand Slams, rules, and court legends.",
    category: "sports",
    emoji: "🎾",
    color: "#ff9f43",
    plays: 9680,
    author: "MVP",
    rating: 4.1,
    questions: [
      q("tc1", "How many Grand Slam tournaments are there each year?", ["3", "4", "5", "6"], 1),
      q("tc2", "Wimbledon is played on which surface?", ["Clay", "Grass", "Hard court", "Carpet"], 1),
      q("tc3", "In tennis, what is a score of 40-40 called?", ["Match point", "Deuce", "Advantage", "Set point"], 1),
      q("tc4", "Which Grand Slam is held in Paris?", ["US Open", "Australian Open", "French Open", "Wimbledon"], 2),
      q("tc5", "A tennis match typically starts with a...?", ["Kick-off", "Serve", "Face-off", "Tip-off"], 1),
    ],
  },
  {
    id: "pop-culture",
    title: "Pop Culture Mix",
    description: "Trends, memes, and modern culture.",
    category: "trivia",
    emoji: "✨",
    color: "#ffc24b",
    plays: 17890,
    author: "QuizWhiz",
    rating: 4.4,
    questions: [
      q("pc1", "Which company created the iPhone?", ["Samsung", "Apple", "Google", "Microsoft"], 1),
      q("pc2", "What does 'Wi-Fi' help devices do?", ["Print documents", "Connect wirelessly to the internet", "Store photos", "Charge batteries"], 1),
      q("pc3", "Which platform is known for short-form vertical videos?", ["LinkedIn", "TikTok", "Pinterest", "Reddit"], 1),
      q("pc4", "What color is traditionally associated with Valentine's Day?", ["Green", "Red", "Blue", "Yellow"], 1),
      q("pc5", "Which emoji commonly represents laughter online?", ["😭", "😂", "😡", "😴"], 1),
    ],
  },
  {
    id: "technology-bits",
    title: "Technology Bits",
    description: "Gadgets, internet, and digital life.",
    category: "trivia",
    emoji: "💻",
    color: "#ffc24b",
    plays: 13210,
    author: "QuizWhiz",
    rating: 4.2,
    questions: [
      q("tb1", "What does 'CPU' stand for?", ["Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Print Unit"], 0),
      q("tb2", "Which company makes the Android operating system?", ["Apple", "Google", "Microsoft", "Samsung"], 1),
      q("tb3", "HTML is used to structure content on the...?", ["Printer", "Web", "Camera", "Speaker"], 1),
      q("tb4", "What does USB stand for?", ["Universal Serial Bus", "United System Backup", "Universal Storage Block", "Unified Signal Bridge"], 0),
      q("tb5", "Which device is primarily used to input text?", ["Monitor", "Keyboard", "Speaker", "Projector"], 1),
    ],
  },
  {
    id: "brain-teasers",
    title: "Brain Teasers",
    description: "Logic puzzles and quick-thinking trivia.",
    category: "trivia",
    emoji: "🧠",
    color: "#ffc24b",
    plays: 11560,
    author: "QuizWhiz",
    rating: 4.3,
    badge: "HARD",
    questions: [
      q("bt1", "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?", ["No", "Yes", "Sometimes", "Cannot tell"], 1),
      q("bt2", "What comes next: 2, 4, 8, 16, ...?", ["24", "32", "20", "18"], 1),
      q("bt3", "How many months have 28 days?", ["1", "2", "12", "6"], 2),
      q("bt4", "A farmer has 17 sheep; all but 9 run away. How many remain?", ["8", "9", "17", "0"], 1),
      q("bt5", "Which weighs more: a kilogram of feathers or a kilogram of bricks?", ["Feathers", "Bricks", "Same weight", "Depends on volume"], 2),
    ],
  },
];

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === id);
}

export function getQuizzesByCategory(slug: string): Quiz[] {
  return quizzes.filter((quiz) => quiz.category === slug);
}

/** Quiz count per category slug — text quizzes only. */
export function getCategoryQuizCounts(): Record<string, number> {
  return Object.fromEntries(
    categories.map((c) => [c.slug, getQuizzesByCategory(c.slug).length]),
  );
}

/** Throws if any quiz has an invalid category or any category has zero quizzes. */
export function assertQuizCatalog(): void {
  const invalid = quizzes.filter((quiz) => !getCategory(quiz.category));
  if (invalid.length > 0) {
    throw new Error(
      `Quizzes with unknown category: ${invalid.map((q) => q.id).join(", ")}`,
    );
  }

  const empty = categories.filter(
    (c) => getQuizzesByCategory(c.slug).length === 0,
  );
  if (empty.length > 0) {
    throw new Error(
      `Categories with no quizzes: ${empty.map((c) => c.slug).join(", ")}`,
    );
  }
}

// Fail fast in development if catalog is misconfigured.
if (process.env.NODE_ENV !== "production") {
  assertQuizCatalog();
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
