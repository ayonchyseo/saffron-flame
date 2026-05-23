import type { MenuItem, SignaturePanel, Testimonial } from "@/types";

/* ──────────────────────────────────────────────────────────
   Menu — categories + items
   ────────────────────────────────────────────────────────── */

export const CATEGORIES = [
  { id: "steak", label: "Steak" },
  { id: "sushi", label: "Sushi" },
  { id: "ramen", label: "Ramen" },
  { id: "dessert", label: "Dessert" },
  { id: "cocktail", label: "Cocktail" },
] as const;

export const MENU: MenuItem[] = [
  {
    id: "wagyu-a5",
    name: "Wagyu A5, Charred",
    tagline: "Japan · 250g · open flame",
    description:
      "Miyazaki A5 wagyu, cooked once over white-hot binchotan, finished tableside with a single brush of cedar-aged tamari. The interior holds at 38°C while the surface caramelises into a thin lacquer.",
    category: "steak",
    ingredients: [
      "Miyazaki A5 wagyu",
      "Binchotan charcoal smoke",
      "Aged tamari glaze",
      "Smoked Maldon",
      "Wasabi crème",
    ],
    pairing: "1998 Château Pichon Baron",
    calories: 740,
    priceAed: 690,
    chefNote:
      "We cook this one once. Surface caramelised over white-hot binchotan, interior left at 38°C — finished tableside with a single brush of tamari aged in cedar.",
  },
  {
    id: "ribeye-bone-in",
    name: "Bone-in Ribeye",
    tagline: "Australia · 600g · 28-day dry-aged",
    description:
      "Dry-aged in our walk-in for 28 days, finished over wood embers, sliced bone-on. Served with smoked bone marrow butter and charred shallot petals.",
    category: "steak",
    ingredients: [
      "28-day dry-aged ribeye",
      "Bone marrow butter",
      "Charred shallot petals",
      "Cracked Tellicherry pepper",
      "Fleur de sel",
    ],
    pairing: "Napa Cabernet, 2017",
    calories: 920,
    priceAed: 480,
    chefNote:
      "Cut for two. The bone is part of the cooking — it carries heat back into the eye while it rests.",
  },
  {
    id: "toro-flight",
    name: "Toro Nigiri Flight",
    tagline: "Three cuts · 9 pieces",
    description:
      "A vertical tasting of bluefin tuna: ōtoro, chūtoro, and akami over akazu vinegar shari, finished with an eight-week soy reduction. Eat in order, no soy needed.",
    category: "sushi",
    ingredients: [
      "Ōtoro · belly",
      "Chūtoro · mid-belly",
      "Akami · lean loin",
      "Akazu vinegar shari",
      "Soy reduction · 8 weeks",
    ],
    pairing: "Junmai Daiginjo, Niigata",
    calories: 480,
    priceAed: 320,
    chefNote:
      "The same fish, three different musics. Start with akami, end with ōtoro — the fat builds the room.",
  },
  {
    id: "uni-toast",
    name: "Hokkaido Uni Toast",
    tagline: "Brioche · uni · gold leaf",
    description:
      "Toasted buttered brioche under a generous lay of Hokkaido sea urchin, dressed with yuzu kosho and a single sheet of edible gold.",
    category: "sushi",
    ingredients: [
      "Bafun uni · Hokkaido",
      "Buttered brioche",
      "Yuzu kosho",
      "Gold leaf",
      "Sea salt",
    ],
    pairing: "Krug Grande Cuvée",
    calories: 320,
    priceAed: 240,
    chefNote:
      "Three bites maximum. The bread is brushed with brown butter and toasted on the grill — never in the oven.",
  },
  {
    id: "tonkotsu-noir",
    name: "Tonkotsu Noir",
    tagline: "36-hour pork broth · black garlic",
    description:
      "A 36-hour pork-and-chicken tonkotsu, finished with mayu — burnt garlic oil charred on the grill, not the pass. Hakata-style noodles, slow-braised chashu, smoked ajitama.",
    category: "ramen",
    ingredients: [
      "36-hr pork & chicken tonkotsu",
      "Black garlic mayu oil",
      "Hakata-style noodles",
      "Slow-braised chashu",
      "Ajitama, smoked",
    ],
    pairing: "Junmai sake, served warm",
    calories: 620,
    priceAed: 145,
    chefNote:
      "The broth reduces in a copper cauldron for a day and a half. The mayu is the only step we ever rush — it has to be black, fast.",
  },
  {
    id: "tan-tan",
    name: "Wagyu Tan-Tan",
    tagline: "Sichuan peppercorn · sesame",
    description:
      "Hand-pulled noodles, spicy sesame broth, wagyu mince, soft yolk, and a generous shower of Sichuan peppercorn oil rendered in-house.",
    category: "ramen",
    ingredients: [
      "Hand-pulled noodles",
      "Sichuan peppercorn oil",
      "Wagyu mince",
      "Sesame paste",
      "Soft-yolked egg",
    ],
    pairing: "Riesling Kabinett, dry",
    calories: 680,
    priceAed: 165,
    chefNote:
      "We chill the peppercorn oil at the last second so the numb hits after the heat, not with it.",
  },
  {
    id: "burnt-honey-sphere",
    name: "Burnt Honey Sphere",
    tagline: "Acacia honey · saffron · cocoa",
    description:
      "A single-origin 72% cocoa sphere cracked tableside with a warm caramel pour. The honey is taken just past burnt — bitter, floral, dangerous. Finished with sea salt and a sheet of gold.",
    category: "dessert",
    ingredients: [
      "Burnt acacia honey",
      "Saffron crème anglaise",
      "Single-origin 72% cocoa",
      "Sea salt flakes",
      "Edible gold leaf",
    ],
    pairing: "Pedro Ximénez, 30 yr",
    calories: 380,
    priceAed: 95,
    chefNote:
      "The sphere is meant to be broken. We will not break it for you — that is part of the dessert.",
  },
  {
    id: "smoke-old-fashioned",
    name: "Smoke Old Fashioned",
    tagline: "Bourbon · cherrywood · saffron",
    description:
      "Bourbon, house saffron bitters, demerara, trapped under a cloche of cherrywood smoke for ninety seconds and released at the table.",
    category: "cocktail",
    ingredients: [
      "Bourbon, 8 yr",
      "House saffron bitters",
      "Demerara",
      "Cherrywood smoke",
      "Orange oil",
    ],
    pairing: "Best as an opener — or after the wagyu",
    calories: 210,
    priceAed: 95,
    chefNote:
      "The saffron bitters take three weeks to build. The smoke takes ninety seconds. The drink is the second part.",
  },
  {
    id: "ember-martini",
    name: "Ember Martini",
    tagline: "Gin · sake · charred citrus",
    description:
      "Dry gin, junmai sake, and a charred lemon-peel cordial — finished with a drop of yuzu and a single torched bay leaf as garnish.",
    category: "cocktail",
    ingredients: [
      "London dry gin",
      "Junmai sake",
      "Charred lemon cordial",
      "Yuzu",
      "Torched bay leaf",
    ],
    pairing: "Before the toro flight",
    calories: 180,
    priceAed: 88,
    chefNote:
      "The bay leaf gets a five-second torch. Inhale before you sip — the smoke is the first ingredient.",
  },
];

/* ──────────────────────────────────────────────────────────
   Signature panels — horizontal-scroll experience section
   ────────────────────────────────────────────────────────── */

export const SIGNATURE_PANELS: SignaturePanel[] = [
  {
    id: "fire",
    eyebrow: "Room 01 · The Open Flame",
    title: "A grill at the centre of the room.",
    body: "Binchotan and cherrywood. The cooks work in silence under amber light. Every steak is a small performance — we built the room so you can watch.",
    metric: { value: "1200°", label: "Charcoal surface temperature" },
  },
  {
    id: "bar",
    eyebrow: "Room 02 · The Cocktail Lab",
    title: "A bar that cooks.",
    body: "Cherrywood smoke under cloches. Saffron bitters built in oak. A dozen house syrups. The bar runs its own kitchen — and its own clock.",
    metric: { value: "2,400", label: "Bottles on the back wall" },
  },
  {
    id: "private",
    eyebrow: "Room 03 · The Counter",
    title: "Seven seats behind the kitchen.",
    body: "Direct line to the chef. A bespoke seven-course menu served at your pace, with the option of an off-menu omakase for parties of four or more.",
    metric: { value: "07", label: "Seats per service" },
  },
  {
    id: "rooftop",
    eyebrow: "Room 04 · The Rooftop",
    title: "Late, low, and lit by ember.",
    body: "A Marina-view rooftop with low couches, slow ember braziers, and a small late menu — open until 1:30 on weekends. The night does not end downstairs.",
    metric: { value: "14F", label: "Floors above the Marina" },
  },
];

/* ──────────────────────────────────────────────────────────
   Testimonials
   ────────────────────────────────────────────────────────── */

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Aïcha Bensouda",
    role: "Travel editor · Condé Nast",
    initials: "AB",
    rating: 5,
    quote:
      "The room hums. The grill pulls you in like a fireplace. The A5 was a ritual, not a course — I haven't stopped thinking about that single brush of tamari.",
    date: "Feb 2026",
  },
  {
    id: "t-2",
    name: "Daniel Reyes",
    role: "Founder · Atlas Capital",
    initials: "DR",
    rating: 5,
    quote:
      "I take clients here when I need to win the room. The private counter feels like a small theatre — and the food earns the lighting.",
    date: "Jan 2026",
  },
  {
    id: "t-3",
    name: "Priya Khurana",
    role: "Chef · two-Michelin",
    initials: "PK",
    rating: 5,
    quote:
      "Saffron Flame respects fire. You can taste the patience in the broth, the conviction in the char. That doesn't happen by accident.",
    date: "Dec 2025",
  },
  {
    id: "t-4",
    name: "Markus Lange",
    role: "Sommelier · Berlin",
    initials: "ML",
    rating: 5,
    quote:
      "The pairing notes are not suggestions — they're arguments. And they win. The PX with the burnt honey sphere is the best pairing I've had this year.",
    date: "Nov 2025",
  },
];
