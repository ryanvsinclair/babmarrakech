export type MenuItem = {
  name: string;
  price: string;
  description?: string;
  options?: string[];
  note?: string;
};

export type MenuSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  items: MenuItem[];
};

export type FeaturedItem = {
  name: string;
  price: string;
  description: string;
  image: string;
};

export const featuredItems: FeaturedItem[] = [
  {
    name: "Chicken Bastilla",
    price: "$13",
    description:
      "Savory chicken pie made with crispy, flaky phyllo dough and a tender shredded chicken filling.",
    image: "/food2.png",
  },
  {
    name: "Chicken Tajine",
    price: "$27",
    description:
      "Traditional North African chicken stew, slow-cooked in an earthenware pot with rich spices.",
    image: "/food1.png",
  },
  {
    name: "M'kila Khlea & Egg",
    price: "$14",
    description:
      "Authentic smoked meat cooked with olive oil and beef fat, finished with eggs.",
    image: "/food3.png",
  },
];

export const menuSections: MenuSection[] = [
  {
    id: "specials",
    label: "Front Page",
    title: "Specials",
    description: "House specials and limited-time plates from the front of the menu.",
    items: [
      {
        name: "Ramadan Special",
        price: "$18",
        description:
          "Includes harira, bread, boiled egg, 3 dates, 1 sweet, and an appetizer trio.",
      },
      {
        name: "Knintat",
        price: "$15",
        description: "Pick any 3 fillings.",
        options: [
          "Seafood",
          "Chicken",
          "Potato & cheese",
          "3 cheeses",
          "Cheese & zaatar",
          "Spinach",
          "Ground beef",
          "Liver",
        ],
      },
      {
        name: "Limited-Time Msemen",
        price: "$5 each",
        options: ["Chahma (lamb)", "Khlea (preserved meat)"],
      },
    ],
  },
  {
    id: "mkila",
    label: "Breakfast",
    title: "M'kila Dishes",
    description: "Egg-forward skillet-style plates and savory morning classics.",
    items: [
      {
        name: "Tomato & Egg",
        price: "$10",
      },
      {
        name: "Merguez, Egg & Cheese",
        price: "$13",
        description: "Moroccan sausage with eggs and cheese.",
      },
      {
        name: "Kefta, Egg & Cheese",
        price: "$13",
        description: "Ground beef with eggs and cheese.",
      },
      {
        name: "Chicken, Egg & Cheese",
        price: "$13",
      },
      {
        name: "Khlea & Egg",
        price: "$14",
        description:
          "Authentic smoked meat cooked with olive oil and beef fat.",
      },
      {
        name: "Tomato, Egg & Beef",
        price: "$14",
      },
      {
        name: "Shrimp",
        price: "$15",
      },
    ],
  },
  {
    id: "soups",
    label: "Starters",
    title: "Soup",
    description: "Classic Moroccan comfort bowls.",
    items: [
      {
        name: "Harira",
        price: "$8",
        description:
          "Moroccan lentil and chickpea soup with warm spices.",
      },
      {
        name: "Bessara",
        price: "$8",
        description: "Moroccan split pea soup.",
      },
    ],
  },
  {
    id: "entrees",
    label: "Starters",
    title: "Entrees",
    description: "Cooked salads and shareable small plates.",
    items: [
      {
        name: "Zaalouk",
        price: "$7",
        description: "Seasoned cooked salad with eggplant and tomatoes.",
      },
      {
        name: "Taktouka",
        price: "$7",
        description: "Roasted green pepper in tomato sauce.",
      },
    ],
  },
  {
    id: "bastilla",
    label: "Pastry",
    title: "Bastilla",
    description: "Savory Moroccan pies wrapped in crisp, flaky pastry.",
    items: [
      {
        name: "Chicken",
        price: "$13",
        description:
          "Savory chicken pie made with crispy, flaky phyllo dough and a tender shredded chicken filling.",
      },
      {
        name: "Seafood",
        price: "$15",
        description:
          "Savory pie filled with shrimp, calamari, and fish tossed with a zesty vermicelli filling.",
      },
    ],
  },
  {
    id: "msemen",
    label: "Flatbread",
    title: "Msemen",
    description:
      "Flat, square-shaped Moroccan layered flatbread drizzled in your choice of sauce.",
    items: [
      {
        name: "Pistachio",
        price: "$10",
      },
      {
        name: "Chocolate",
        price: "$9",
      },
      {
        name: "Caramel",
        price: "$8",
      },
      {
        name: "Amlou",
        price: "$10",
      },
    ],
  },
  {
    id: "desserts",
    label: "Sweets",
    title: "Desserts",
    description: "Pastries, sweets, and plated Moroccan desserts.",
    items: [
      {
        name: "Almond Sweet",
        price: "$2 per piece",
      },
      {
        name: "Almond Filled Dates",
        price: "$2 per piece",
      },
      {
        name: "Briwat",
        price: "$2 per piece",
      },
      {
        name: "Mixed Plate of Sweets",
        price: "$10",
        note: "6 pieces.",
      },
      {
        name: "Jawhara",
        price: "$15",
        description:
          "Layered Moroccan dessert assembled with paper-thin sheets of fried warqa pastry.",
      },
    ],
  },
  {
    id: "breakfast",
    label: "Morning",
    title: "Breakfast",
    description: "Simple breads, pancakes, and add-ons.",
    items: [
      {
        name: "Baghrir",
        price: "$2 each",
        description:
          "Melt-in-your-mouth Moroccan pancakes made from a crepe-like semolina batter.",
      },
      {
        name: "Harcha",
        price: "$2 each",
        description:
          "Moroccan pan-fried bread made from semolina, served with butter and jam.",
      },
      {
        name: "Briwat",
        price: "$2 each",
      },
      {
        name: "Extra Toppings",
        price: "$2 each",
        options: [
          "Black olives",
          "Olive oil",
          "Cheese (kiri)",
          "Local cream cheese",
          "Jam (aicha)",
          "Honey",
          "Amlou",
        ],
      },
    ],
  },
  {
    id: "tajine",
    label: "Slow Cooked",
    title: "Tajine",
    description:
      "Traditional North African dish, known for rich flavors and slow-cooked stews prepared in a distinctive earthenware pot.",
    items: [
      {
        name: "Lamb Chunks",
        price: "$30",
      },
      {
        name: "Beef",
        price: "$29",
      },
      {
        name: "Chicken",
        price: "$27",
      },
      {
        name: "Kefta (Ground Beef)",
        price: "$25",
      },
      {
        name: "Kariin (Lamb Trotters)",
        price: "$28",
      },
      {
        name: "Shrimp",
        price: "$27",
      },
      {
        name: "Vegetarian",
        price: "$25",
      },
    ],
  },
  {
    id: "rfissa",
    label: "Signature",
    title: "Rfissa",
    description: "One of the house signatures.",
    items: [
      {
        name: "Rfissa",
        price: "$29",
        description:
          "Stewed chicken, lentils, and onions served on a bed of shredded mesemen with fragrantly seasoned broth poured over top.",
      },
    ],
  },
  {
    id: "couscous",
    label: "Classic",
    title: "Couscous",
    description:
      "Steamed semolina wheat served with vegetables and your choice of meat.",
    items: [
      {
        name: "Vegetarian",
        price: "$25",
      },
      {
        name: "Chicken",
        price: "$28",
      },
      {
        name: "Beef",
        price: "$30",
      },
      {
        name: "Lamb",
        price: "$32",
      },
    ],
  },
  {
    id: "specialty-drinks",
    label: "Drinks",
    title: "Specialty Drinks",
    description: "House drinks and signatures listed on the menu.",
    items: [
      {
        name: "Moroccan Spiced Coffee",
        price: "$4",
      },
      {
        name: "Pomegranate Yogurt",
        price: "$6 - $10",
        note: "Price range shown as listed on the menu PDF.",
      },
      {
        name: "The Bab Marrakech (Zaa'Zaa)",
        price: "$16",
      },
    ],
  },
  {
    id: "juices",
    label: "Drinks",
    title: "Juices & Milkshakes",
    description: "Fruit-forward juices and blended drinks.",
    items: [
      {
        name: "Banana",
        price: "$8",
      },
      {
        name: "Apple",
        price: "$8",
      },
      {
        name: "Strawberries",
        price: "$8",
      },
      {
        name: "Mango",
        price: "$12",
      },
      {
        name: "Avocado",
        price: "$12",
      },
      {
        name: "Fruit Cocktail",
        price: "$14",
      },
    ],
  },
  {
    id: "cold-drinks",
    label: "Drinks",
    title: "Cans & Bottles",
    description: "Cold drinks, mineral water, and Moroccan soda.",
    items: [
      {
        name: "Bottled Water",
        price: "$2",
      },
      {
        name: "Canned Drink",
        price: "$2",
      },
      {
        name: "Moroccan Soda",
        price: "$4",
      },
      {
        name: "Sparkling Water",
        price: "$5",
      },
      {
        name: "Oulmes",
        price: "$10",
        description:
          "Naturally carbonated mineral water sourced from the Atlas Mountains in Morocco.",
        note: "1 litre.",
      },
    ],
  },
  {
    id: "tea",
    label: "Tea Service",
    title: "Moroccan Tea",
    description: "Traditional tea service priced by pot size.",
    items: [
      {
        name: "Small",
        price: "$6 / $8 / $10",
      },
      {
        name: "Medium",
        price: "$8 / $10 / $12",
      },
      {
        name: "Family",
        price: "$12 / $16 / $20",
      },
      {
        name: "Saffron / Blossom Add-On",
        price: "+$2 to +$4",
        note: "Based on size.",
      },
    ],
  },
];
