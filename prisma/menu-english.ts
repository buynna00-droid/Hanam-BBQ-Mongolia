// English names translated from the supplied MN/KO menu at the user's request.
// Brand names are preserved; no ingredients, prices or unverified flavors added.
export const categoryNamesEn: Record<string, string> = {
  "pork-bbq": "Main Dishes — Pork BBQ",
  sets: "Set Menu",
  soups: "Soups & Stews",
  noodles: "Noodles",
  sides: "Side Dishes & Extras",
  "signature-side": "Hanam BBQ Signature Side Dish",
  soju: "Soju",
  beer: "Beer",
  traditional: "Traditional Korean Drinks",
  spirits: "Vodka, Whisky & Cognac",
  "soft-drinks": "Non-Alcoholic Drinks",
};

const groups: Record<string, string[]> = {
  pork: [
    "Samgyeopsal (Pork Belly)",
    "Moksal (Pork Neck)",
    "Galmaegisal (Pork Skirt)",
    "Gabrisal (Pork Back Meat)",
    "Hangjeongsal (Pork Jowl)",
    "Galbi (Pork Ribs)",
    "Mixed Meat Platter",
    "Hanam Signature Mixed Meat Platter",
  ],
  set: ["SET A", "SET B", "SET C"],
  soup: [
    "Pork Kimchi Stew",
    "Soybean Paste Stew",
    "Gochujang Stew",
    "Soft Tofu Stew",
  ],
  noodle: [
    "Cold Noodles in Broth",
    "Spicy Cold Noodles",
    "Noodles in Hot Broth",
  ],
  side: [
    "Steamed Eggs with Cheese",
    "Assorted Mushrooms",
    "Kimchi Fried Rice",
    "Rice Balls (Make Your Own)",
    "Steamed Rice",
  ],
  signature: ["Myeonginamul (Pickled Wild Garlic Leaves)"],
  soju: [
    "Good Day, Jinro, Chum Churum — Original Soju",
    "Jinro / Good Day Fruit Soju",
  ],
  beer: ["Cass", "Terra", "Asahi", "Chinggis Beer"],
  traditional: [
    "Original Makgeolli",
    "Green Grape Makgeolli",
    "Peach Makgeolli",
  ],
  spirit: [
    "Finlandia Vodka",
    "Shiguderi Shimi",
    "Chinggis Khaan Vodka",
    "Johnnie Walker Black Label",
    "Johnnie Walker Double Black",
    "Hennessy VS",
    "Hennessy VSOP",
  ],
  "soft-drink": [
    "Coca-Cola",
    "Sprite",
    "Fanta Orange",
    "Fanta Grape",
    "Calpis",
    "Del Monte Orange Juice",
    "Millennia Still Water",
    "Millennia Sparkling Water",
  ],
};

export const itemNamesEn: Record<string, string> = Object.fromEntries(
  Object.entries(groups).flatMap(([prefix, names]) =>
    names.map((name, i) => [`${prefix}-${i + 1}`, name]),
  ),
);
