import {
  Apple,
  Bean,
  Beef,
  Candy,
  Carrot,
  Citrus,
  Droplet,
  Droplets,
  Drumstick,
  Egg,
  Fish,
  Leaf,
  Milk,
  Nut,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
  Wine,
  type LucideIcon,
} from "lucide-react";

/**
 * Picks a mark for an ingredient line.
 *
 * Order is the whole design here. Ingredient names are written for cooks, not
 * parsers, so a line can honestly belong to several groups at once: "vegan
 * bacon rashers or smoked tofu strips" reads as both meat and legume, and
 * "plant-based mince or lentils" as both mince and pulse. The plant entries
 * are tested first so an adapted ingredient is never marked with the thing it
 * replaced, which would be the one mistake anyone would notice.
 */
const GROUPS: { icon: LucideIcon; match: RegExp }[] = [
  // Plant proteins before meat, for the reason above.
  {
    icon: Bean,
    match: /lentil|chickpea|tofu|tempeh|seitan|edamame|\bbean|black bean|kidney/,
  },
  {
    icon: Nut,
    match: /\bnut|almond|cashew|walnut|pecan|hazelnut|pistachio|seed|tahini|sesame/,
  },
  { icon: Egg, match: /\begg/ },
  {
    icon: Milk,
    match:
      /milk|cream|crème|creme|yoghurt|yogurt|cheese|mozzarella|parmesan|cheddar|ricotta|mascarpone|feta|custard|butter\b/,
  },
  {
    icon: Beef,
    match:
      /beef|mince|steak|pork|bacon|\bham\b|lamb|sausage|chorizo|pancetta|rasher|prosciutto|veal|salami/,
  },
  { icon: Drumstick, match: /chicken|turkey|duck|poultry/ },
  {
    icon: Fish,
    match: /fish|salmon|tuna|\bcod\b|prawn|shrimp|anchov|sardine|mussel|squid|crab/,
  },
  {
    icon: Wheat,
    match:
      /flour|pasta|lasagne|lasagna|spaghetti|noodle|bread|breadcrumb|\brice\b|\boat|quinoa|couscous|tortilla|sheet|macaroni|penne|pastry/,
  },
  // What a thing has become beats what it was made from: "tomato purée" is a
  // sauce on the shelf, not a vegetable in the rack, so these sit above produce.
  { icon: Droplet, match: /\boil\b|olive oil|ghee|margarine|lard|dripping/ },
  {
    icon: Droplets,
    match: /purée|puree|paste|vinegar|mustard|ketchup|sauce|mayo|passata/,
  },
  {
    icon: Leaf,
    match:
      /basil|parsley|coriander|cilantro|thyme|rosemary|sage|oregano|mint\b|\bdill|chive|spinach|kale|rocket|lettuce|salad|herb|bay lea/,
  },
  { icon: Citrus, match: /lemon|lime\b|orange|grapefruit/ },
  {
    icon: Apple,
    match: /apple|pear\b|berr|banana|mango|peach|plum|grape|raisin|apricot|cherr/,
  },
  {
    icon: Carrot,
    match:
      /onion|carrot|celery|potato|tomato|pepper\b|garlic|mushroom|courgette|zucchini|aubergine|eggplant|broccoli|cauliflower|cabbage|leek|shallot|\bcorn|squash|pumpkin|cucumber|beetroot|parsnip|turnip|ginger|chilli|chili|veg\b/,
  },
  { icon: Candy, match: /sugar|honey|syrup|maple|agave|molasses|sweeten/ },
  { icon: Soup, match: /stock|broth|bouillon|water/ },
  { icon: Wine, match: /wine|beer|rum\b|brandy|vodka|sherry|cider/ },
  {
    icon: Sparkles,
    match: /salt|season|spice|paprika|cumin|cinnamon|nutmeg|turmeric|curry|cayenne|paprika/,
  },
];

export function iconForIngredient(name: string | undefined): LucideIcon {
  const text = (name ?? "").toLowerCase();
  for (const group of GROUPS) {
    if (group.match.test(text)) return group.icon;
  }
  return Utensils;
}
