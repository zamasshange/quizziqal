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
    <nav className="sonke-category-nav" aria-label="Categories">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={selected === cat ? "sonke-category-pill active" : "sonke-category-pill"}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
