/**
 * Server-side client for the same Deno Deploy endpoints the Plateful app uses.
 * The shared secret stays on the server, exactly like the app keeps it out of
 * the shipped bundle, so the browser never sees it.
 */

const EXTRACT_URL = "https://plateful-extract-recipe.naodt1.deno.net";
const AI_CHAT_URL = "https://plateful-ai-chat.naodt1.deno.net";

export class NoRecipeFoundError extends Error {}

export type Ingredient = { name: string; amount?: number; unit?: string };

export type Recipe = {
  title?: string;
  description?: string;
  image_url?: string | null;
  ingredients?: Ingredient[];
  steps?: string[];
  servings?: number;
  cook_time_minutes?: number;
  tags?: string[];
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
export async function extractRecipe(url: string): Promise<Recipe> {
  const response = await fetch(EXTRACT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-plateful-key": secret() },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(60_000),
  });

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
async function chat(prompt: string): Promise<string> {
  const response = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-plateful-key": secret() },
    body: JSON.stringify({ prompt }),
    signal: AbortSignal.timeout(60_000),
  });

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

/**
 * Rewrites a recipe for a diet and allergy set.
 *
 * The prompt is deliberately terse and the schema small. The AI proxy runs a
 * reasoning model, and a long prompt asking for several explanation fields per
 * swap makes it burn its whole token budget thinking out loud and never emit
 * the JSON. Keeping the ask tight is what makes the response parseable.
 */
export async function tailorRecipe(
  recipe: Recipe,
  dietMode: string,
  allergies: string[]
): Promise<TailorResult> {
  const target = [
    dietMode !== "None" ? dietMode : null,
    allergies.length ? `free of: ${allergies.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Only the fields the model needs; nutrition/tags/images just add noise.
  const slim = {
    title: recipe.title,
    ingredients: (recipe.ingredients ?? []).map((item) => ({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
    })),
    steps: recipe.steps ?? [],
  };

  const schema =
    '{"tailoredRecipe":{"title":"","description":"","ingredients":[{"name":"","amount":0,"unit":""}],"steps":[""]},"changes":[{"original":"","replacement":"","reason":"","confidence":"high"}],"overallAssessment":"","warnings":[]}';

  const prompt = `Rewrite this recipe to be ${target || "suitable for any diet"}.

RECIPE:
${JSON.stringify(slim)}

Keep amounts realistic and steps complete. List every substitution in "changes" with a short reason.
Output JSON only. No explanation, no reasoning, no markdown. Start your reply with { and end with }.

${schema}`;

  let result = extractJson<TailorResult>(await chat(prompt));

  // One terser retry: reasoning models occasionally talk past the budget.
  if (!result?.tailoredRecipe) {
    result = extractJson<TailorResult>(
      await chat(
        `Rewrite this recipe to be ${target || "suitable for any diet"}. JSON only, start with {.\n\n${JSON.stringify(slim)}\n\n${schema}`
      )
    );
  }

  if (!result?.tailoredRecipe) {
    throw new Error(
      "The converter could not rewrite this recipe. Please try again."
    );
  }

  return {
    ...result,
    changes: Array.isArray(result.changes) ? result.changes : [],
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
  };
}
