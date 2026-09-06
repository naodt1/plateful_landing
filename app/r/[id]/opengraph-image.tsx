import { ImageResponse } from "next/og";

import { RemixCard } from "@/components/remix-og";
import { getRemix } from "@/lib/remix";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A recipe remixed with Plateful";

/**
 * The card a shared remix arrives as, and for most people the only part of
 * this feature they will ever see. It leads with the dish and with the line
 * that makes someone tap: what the vegan version of a thing they recognise
 * actually looks like.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const remix = await getRemix(id);

  return new ImageResponse(
    (
      <RemixCard
        diet={remix?.diet ?? "None"}
        title={remix?.title ?? "a recipe"}
        image={remix?.image ?? null}
      />
    ),
    size
  );
}
