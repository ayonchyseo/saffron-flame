export type MenuCategory = "steak" | "sushi" | "ramen" | "dessert" | "cocktail";

export interface MenuItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: MenuCategory;
  ingredients: string[];
  pairing: string;
  calories: number;
  priceAed: number;
  chefNote: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  date: string;
}

export interface SignaturePanel {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  metric?: { value: string; label: string };
}
