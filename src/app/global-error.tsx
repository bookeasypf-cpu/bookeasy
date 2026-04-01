"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #0C1B2A, #132D46)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "5rem",
              fontWeight: 900,
              background: "linear-gradient(to right, #0066FF, #00B4D8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
            }}>
              Erreur
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              Une erreur critique est survenue
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", maxWidth: "28rem", margin: "0 auto 2rem" }}>
              L&apos;application a rencontré un problème. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(to right, #0066FF, #00B4D8)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
