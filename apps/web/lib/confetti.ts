import confetti from "canvas-confetti";

//a warm, on-brand confetti burst for rare celebratory moments (e.g. publishing).
export function fireConfetti() {
  if (typeof window === "undefined") return;
  //honor reduced-motion — no celebratory animation for users who opt out
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#F5643C", "#FF9E8A", "#F5508A", "#FFC1A8", "#B983FF"];
  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 42,
    ticks: 200,
    origin: { y: 0.35 },
    colors,
    scalar: 0.9,
  });
}
