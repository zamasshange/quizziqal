"use client";

interface CategoryChipsProps {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`game-pill shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold lg:px-4 lg:py-2 lg:text-sm ${
            selected === cat
              ? "game-pill-active bg-[var(--kahoot-purple)] text-white"
              : "bg-white text-gray-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
