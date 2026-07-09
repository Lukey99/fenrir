"use client";

import { useEffect } from "react";

// This only fires if the root layout itself throws — it must render its own
// <html>/<body> since there is no other layout left to fall back on, and it
// deliberately avoids importing fonts/providers/globals.css in case those are
// what broke.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "16px",
        }}
      >
        <p style={{ fontWeight: 600 }}>Une erreur est survenue</p>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          L&apos;application n&apos;a pas pu se charger. Réessaie dans un instant.
        </p>
        <button
          onClick={reset}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            background: "white",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
