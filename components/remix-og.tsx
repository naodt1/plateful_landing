/**
 * The artwork for a shared remix's social card, kept apart from the route so
 * the same markup can be rendered against fixed data while it is being
 * designed. Satori only understands a subset of CSS: flexbox, explicit
 * display on anything with children, no shorthand it cannot resolve.
 */
export function RemixCard({
  diet,
  title,
  image,
}: {
  diet: string;
  title: string;
  image: string | null;
}) {
  const word = diet === "None" ? "adapted" : diet.toLowerCase();
  const badge = diet === "None" ? "you" : diet;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#16412e",
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            objectFit: "cover",
          }}
        />
      )}

      {/* Dark from the foot upward, so the dish stays appetising and the words
          stay readable over it. Sized explicitly rather than with inset: the
          renderer behind these cards does not resolve that shorthand, and the
          scrim silently does not draw, which is the whole card ruined. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "630px",
          display: "flex",
          background:
            "linear-gradient(to top, rgba(11,26,18,0.96) 18%, rgba(11,26,18,0.74) 40%, rgba(11,26,18,0) 72%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "54px 62px",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#faf7f1",
              color: "#16412e",
              padding: "12px 26px",
              borderRadius: 999,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Adapted for {badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#8fc7a5",
              fontSize: 27,
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginBottom: 16,
            }}
          >
            REMIXED WITH PLATEFUL
          </div>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            The {word} version of {title}
          </div>
        </div>
      </div>
    </div>
  );
}
