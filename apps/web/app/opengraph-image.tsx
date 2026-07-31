import { ImageResponse } from "next/og";

// branded social-share card generated at the edge — no static asset needed
export const runtime = "edge";
export const alt = "Genzee Forms — forms with a cool vibe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fff6f1 0%, #ffe8dd 45%, #ffdce9 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ff7a4d, #f5508a)",
            }}
          />
          <div style={{ fontSize: "36px", fontWeight: 600, color: "#3a2a24" }}>
            Genzee Forms
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.05,
              color: "#2a1c17",
              maxWidth: "900px",
            }}
          >
            Make forms with a cool vibe.
          </div>
          <div style={{ fontSize: "34px", color: "#7a5c50", maxWidth: "820px" }}>
            Build it, publish it, share one link — no code required.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "16px 32px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #ff7a4d, #f5508a)",
              fontWeight: 600,
            }}
          >
            Get Started →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
