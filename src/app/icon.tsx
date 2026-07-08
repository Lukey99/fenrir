import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 7,
          background: "#4F46E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 100 100" fill="white">
          <polygon points="50,20 18,2 28,42 50,90 72,42 82,2" />
          <polygon points="43,55 50,65 57,55" fill="#4F46E5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
