export type AvatarDefinition = {
  id: string;
  label: string;
  src: string;
};

export const AVATARS: AvatarDefinition[] = [
  { id: "robot", label: "Robo Quiz", src: "/avatars/robot.svg" },
  { id: "wizard", label: "Quiz Wizard", src: "/avatars/wizard.svg" },
  { id: "cat", label: "Clever Cat", src: "/avatars/cat.svg" },
  { id: "owl", label: "Brainy Owl", src: "/avatars/owl.svg" },
  { id: "pirate", label: "Quiz Pirate", src: "/avatars/pirate.svg" },
  { id: "astronaut", label: "Space Ace", src: "/avatars/astronaut.svg" },
  { id: "ninja", label: "Quiz Ninja", src: "/avatars/ninja.svg" },
  { id: "dinosaur", label: "Dino Brain", src: "/avatars/dinosaur.svg" },
  { id: "fox", label: "Sly Fox", src: "/avatars/fox.svg" },
  { id: "superhero", label: "Super Quizzer", src: "/avatars/superhero.svg" },
  { id: "alien", label: "Alien Ace", src: "/avatars/alien.svg" },
  { id: "chef", label: "Chef Brain", src: "/avatars/chef.svg" },
  { id: "ghost", label: "Boo Brain", src: "/avatars/ghost.svg" },
  { id: "lion", label: "Quiz King", src: "/avatars/lion.svg" },
  { id: "unicorn", label: "Uni Quiz", src: "/avatars/unicorn.svg" },
];

const avatarIds = new Set(AVATARS.map((avatar) => avatar.id));

export function isValidAvatarId(id: string): boolean {
  return avatarIds.has(id);
}

export function getAvatarById(id: string | undefined | null): AvatarDefinition | undefined {
  if (!id) return undefined;
  return AVATARS.find((avatar) => avatar.id === id);
}

export function getAvatarSrc(id: string | undefined | null): string | undefined {
  return getAvatarById(id)?.src;
}
