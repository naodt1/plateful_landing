/**
 * Server-side client for the same Deno Deploy endpoints the Plateful app uses.
 * The shared secret stays on the server, exactly like the app keeps it out of
 * the shipped bundle, so the browser never sees it.
 */

const EXTRACT_URL = "https://plateful-extract-recipe.naodt1.deno.net";
const AI_CHAT_URL = "https://plateful-ai-chat.naodt1.deno.net";

export class NoRecipeFoundError extends Error {}
export class ConversionTimeoutError extends Error {}

export type Ingredient = { name: string; amount?: number; unit?: string };

export type Nutrition = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type Recipe = {
  title?: string;
  description?: string;
  image_url?: string | null;
  ingredients?: Ingredient[];
  steps?: string[];
  servings?: number;
  cook_time_minutes?: number;
  tags?: string[];
  /** The source recipe's own figures, when the page published them. */
  nutrition?: Nutrition | null;
};

export type Swap = {
  original: string;
  replacement: string;
  reason?: string;
  confidence?: string;
};

export type TailorResult = {
  tailoredRecipe: Recipe;
  changes: Swap[];
  overallAssessment?: string;
  warnings?: string[];
};

function secret(): string {
  const value = process.env.PLATEFUL_APP_SECRET;
  if (!value) throw new Error("PLATEFUL_APP_SECRET is not set");
  return value;
}

/**
 * How long this call may take.
 *
 * Every step used to get its own fixed 60s, which meant a slow extract plus a
 * slow rewrite plus a retry could run well past the serverless function's own
 * limit. The platform then killed the request mid flight and the browser got a
 * gateway error with nothing useful in it. Sharing one deadline keeps the whole
 * pipeline inside the budget and lets a step that runs out of room say so.
 */
function budget(cap: number, deadline?: number): number {
  if (!deadline) return cap;
  const left = deadline - Date.now();
  if (left < 2_000) {
    throw new ConversionTimeoutError(
      "This one took longer than we can wait for. Please try again."
    );
  }
  return Math.min(cap, left);
}

function asTimeout(error: unknown): never {
  // fetch surfaces an aborted signal as TimeoutError or AbortError.
  const name = error instanceof Error ? error.name : "";
  if (name === "TimeoutError" || name === "AbortError") {
    throw new ConversionTimeoutError(
      "The recipe service took too long to answer. Please try again."
    );
  }
  throw error;
}

/** Pulls JSON out of a model response that may be fenced or prose-wrapped. */
function extractJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through to the looser strategies below
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {
      // keep going
    }
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1)) as T;
    } catch {
      // give up below
    }
  }
  return null;
}

/** Extracts a recipe from any shared link (TikTok, YouTube, a recipe site). */
export async function extractRecipe(
  url: string,
  deadline?: number
): Promise<Recipe> {
  let response: Response;
  try {
    response = await fetch(EXTRACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-plateful-key": secret() },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(budget(25_000, deadline)),
    });
  } catch (error) {
    asTimeout(error);
  }

  if (!response.ok) {
    throw new Error(`Recipe service error (${response.status}).`);
  }

  const json = (await response.json()) as Record<string, unknown>;

  if (json.no_recipe === true) {
    throw new NoRecipeFoundError(
      typeof json.reason === "string"
        ? json.reason
        : "No recipe found at that link. It may require a login, or may not contain a recipe."
    );
  }
  if (typeof json.error === "string") throw new Error(json.error);

  return json as Recipe;
}

/** Runs a prompt through the app's AI proxy, which holds the provider key. */
async function chat(prompt: string, timeoutMs: number): Promise<string> {
  let response: Response;
  try {
    response = await fetch(AI_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-plateful-key": secret() },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    asTimeout(error);
  }

  if (response.status === 429) {
    throw new Error("Too many requests right now. Please try again shortly.");
  }
  if (!response.ok) {
    throw new Error(`Recipe service error (${response.status}).`);
  }

  const json = (await response.json()) as { content?: string; error?: string };
  if (json.error) throw new Error(json.error);
  return json.content ?? "";
}

/** Escapes a string for use inside a RegExp. */
function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The phrases in a step that could stand for this ingredient, longest first.
 *
 * Ingredient lines are written as "rashers smoked streaky bacon" while the
 * method just says "the bacon", so matching only the full phrase leaves the
 * steps talking about the ingredient that was swapped out. The tail of the
 * phrase is the part a method actually uses.
 */
function stepPhrases(original: string): string[] {
  const words = original.trim().split(/\s+/);
  const phrases = [words.join(" ")];

  if (words.length > 2) phrases.push(words.slice(-2).join(" "));
  // A bare last word only when it is distinctive enough to stand alone: "oil"
  // would match inside "olive oil" and swap an ingredient that was fine.
  const last = words[words.length - 1];
  if (words.length > 1 && last.length >= 5) phrases.push(last);

  // The head noun is not always last: "ball mozzarella roughly torn" is used in
  // the method as just "the mozzarella". Only long words qualify, which keeps
  // "lasagne" out of it: swapping that would rewrite the name of the dish.
  for (const word of words.slice(0, -1)) {
    if (word.length >= 8) phrases.push(word);
  }

  return phrases;
}

/** "plant-based mince or lentils" reads badly mid-sentence; take the first. */
function shortReplacement(value: string): string {
  return value.split(/\s+or\s+/i)[0].trim();
}

/**
 * Rewrites the method around the swaps the model made.
 *
 * A step that still says "brown the beef mince" after the mince became lentils
 * reads as broken. This runs as one pass over each step with the alternatives
 * sorted longest first, so a swap can never rewrite text an earlier swap just
 * introduced, and the most specific phrase always wins.
 */
function applySwaps(steps: string[], changes: Swap[]): string[] {
  const replacements = new Map<string, string>();

  for (const swap of changes) {
    const original = swap.original?.trim();
    const replacement = swap.replacement?.trim();
    if (!original || original.length < 3 || !replacement) continue;

    for (const phrase of stepPhrases(original)) {
      const key = phrase.toLowerCase();
      if (!replacements.has(key)) {
        replacements.set(key, shortReplacement(replacement));
      }
    }
  }

  if (!replacements.size) return steps;

  const pattern = [...replacements.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|");
  const matcher = new RegExp(`\\b(?:${pattern})\\b`, "gi");

  return steps.map((step) =>
    step.replace(matcher, (found) => replacements.get(found.toLowerCase()) ?? found)
  );
}

/** Applies the swaps to the source list, keeping the original quantities. */
function swapIngredients(
  ingredients: Ingredient[],
  changes: Swap[]
): Ingredient[] {
  return ingredients.map((item) => {
    const name = item.name?.trim().toLowerCase() ?? "";
    const match = changes.find((swap) => {
      const original = swap.original?.trim().toLowerCase();
      if (!original) return false;
      return name === original || name.includes(original) || original.includes(name);
    });
    if (!match?.replacement?.trim()) return item;
    return { ...item, name: match.replacement.trim() };
  });
}

type SwapResponse = { changes?: Swap[]; assessment?: string; warnings?: string[] };

/**
 * Rewrites a recipe for a diet and allergy set.
 *
 * This asks one question and one question only: which ingredients do not fit,
 * and what replaces them. That matters more than it looks. The proxy runs a
 * reasoning model, and its latency tracks how much it has to decide rather
 * than how much it has to write: asking it to re-emit the whole ingredient
 * list with every amount and unit made it deliberate over each quantity and
 * took 42 seconds, close enough to the proxy's own request ceiling that the
 * connection was regularly dropped with nothing to show. Asking only for the
 * swaps answers in about four. The quantities are the source recipe's own,
 * which is also the more honest answer than having a model reinvent them.
 */
export async function tailorRecipe(
  recipe: Recipe,
  dietMode: string,
  allergies: string[],
  deadline?: number
): Promise<TailorResult> {
  const target = [
    dietMode !== "None" ? dietMode : null,
    allergies.length ? `free of: ${allergies.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const ingredients = recipe.ingredients ?? [];
  const names = ingredients.map((item) => item.name).filter(Boolean);

  if (!names.length) {
    throw new Error("That link had no ingredients to convert.");
  }

  const prompt = `Which of these ingredients do not fit ${target || "an unrestricted diet"}, and what replaces each one?

${JSON.stringify(names)}

Answer directly, no deliberation. Return an empty changes array if they all already fit.
JSON only, start with { and end with }:
{"changes":[{"original":"","replacement":"","reason":""}],"assessment":"","warnings":[]}`;

  const result = extractJson<SwapResponse>(
    await chat(prompt, budget(30_000, deadline))
  );

  if (!result) {
    throw new Error(
      "The converter could not rewrite this recipe. Please try again."
    );
  }

  const changes = (Array.isArray(result.changes) ? result.changes : []).filter(
    (swap) => swap?.original && swap?.replacement
  );

  return {
    tailoredRecipe: {
      title: recipe.title,
      description: recipe.description,
      ingredients: swapIngredients(ingredients, changes),
      steps: applySwaps(recipe.steps ?? [], changes),
    },
    changes,
    overallAssessment: result.assessment,
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
  };
}
