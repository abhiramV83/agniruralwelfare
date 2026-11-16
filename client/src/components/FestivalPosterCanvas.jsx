import React, { useRef, useEffect } from "react";

/**
 * Draws a high-resolution 1200x800 festival celebration poster onto an HTML5 Canvas.
 */
export function drawFestivalPoster(canvas, festival) {
  if (!canvas || !festival) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = 1200;
  const h = 800;
  canvas.width = w;
  canvas.height = h;

  const theme = festival.theme || {};
  const accent = theme.accentColor || "#f59e0b";
  const secondary = theme.secondaryColor || "#10b981";

  // 1. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (festival.category === "Muslim") {
    grad.addColorStop(0, "#022c22");
    grad.addColorStop(0.5, "#064e3b");
    grad.addColorStop(1, "#047857");
  } else if (festival.category === "Christian") {
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(0.5, "#14532d");
    grad.addColorStop(1, "#7f1d1d");
  } else if (festival.category === "National") {
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.45, "#1e3a8a");
    grad.addColorStop(1, "#1e293b");
  } else if (festival.id === "holi") {
    grad.addColorStop(0, "#500724");
    grad.addColorStop(0.5, "#831843");
    grad.addColorStop(1, "#be185d");
  } else if (festival.id === "bathukamma") {
    grad.addColorStop(0, "#4c0519");
    grad.addColorStop(0.5, "#831843");
    grad.addColorStop(1, "#9f1239");
  } else {
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.45, "#1e1b4b");
    grad.addColorStop(1, "#312e81");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2. Decorative Outer Border
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 38, w - 76, h - 76);

  // Corner Accents
  const cornerSize = 40;
  const drawCorner = (x, y, dx, dy) => {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * cornerSize, y);
    ctx.stroke();
  };
  drawCorner(46, 46, 1, 1);
  drawCorner(w - 46, 46, -1, 1);
  drawCorner(46, h - 46, 1, -1);
  drawCorner(w - 46, h - 46, -1, -1);
  ctx.restore();

  // 3. Subtle Radial Glow in Center
  ctx.save();
  const radialGlow = ctx.createRadialGradient(w / 2, h / 2 - 20, 50, w / 2, h / 2 - 20, 420);
  radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.15)");
  radialGlow.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // 4. Header Section: Organization Name & Brand Identity
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 26px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("AGNI RURAL WELFARE SOCIETY", w / 2, 90);

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.font = "600 14px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Govt. Regd. No. : S/1L/55059 • Motto: Bravery, Unity & Discipline", w / 2, 118);

  // Subtle Header Divider
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 180, 134);
  ctx.lineTo(w / 2 + 180, 134);
  ctx.stroke();
  ctx.restore();

  // 5. Cultural Motif Illustration
  ctx.save();
  ctx.translate(w / 2, 230);
  const motif = theme.motif || "diya";

  if (motif === "diya") {
    // Earthen Diya with radiant flame
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(0, 20, 50, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(0, 20, 40, 0, Math.PI);
    ctx.fill();

    // Golden flame
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.bezierCurveTo(24, -20, 24, 10, 0, 15);
    ctx.bezierCurveTo(-24, 10, -24, -20, 0, -50);
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.bezierCurveTo(12, -15, 12, 5, 0, 10);
    ctx.bezierCurveTo(-12, 5, -12, -15, 0, -35);
    ctx.fill();
  } else if (motif === "crescent") {
    // Glowing Emerald Crescent & Star
    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, -10, 42, 0, Math.PI * 2);
    ctx.fill();

    // Star
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(32, -8, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (motif === "kites") {
    // Colorful flying kite
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(45, 0);
    ctx.lineTo(0, 55);
    ctx.lineTo(-45, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(-15, 55);
    ctx.lineTo(15, 55);
    ctx.lineTo(0, 75);
    ctx.closePath();
    ctx.fill();
  } else if (motif === "flowers") {
    // Concentric floral blossom
    for (let r = 0; r < 8; r++) {
      const angle = (r * Math.PI) / 4;
      ctx.fillStyle = r % 2 === 0 ? "#f43f5e" : "#fb7185";
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 26, Math.sin(angle) * 26, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  } else if (motif === "tricolor") {
    // Indian Tricolour Waves & Chakra
    ctx.fillStyle = "#ff9933";
    ctx.fillRect(-65, -35, 130, 24);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-65, -11, 130, 24);
    ctx.fillStyle = "#138808";
    ctx.fillRect(-65, 13, 130, 24);

    ctx.strokeStyle = "#000080";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 1, 9, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Universal Radiant Star
    ctx.fillStyle = accent;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outer = 45;
      const inner = 18;
      ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * outer, -Math.sin(((18 + i * 72) * Math.PI) / 180) * outer);
      ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * inner, -Math.sin(((54 + i * 72) * Math.PI) / 180) * inner);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 6. Category Tag Pill
  ctx.save();
  ctx.textAlign = "center";
  const catText = `${festival.category.toUpperCase()} CELEBRATION`;
  ctx.font = "bold 13px Inter, 'Segoe UI', Arial, sans-serif";
  const catWidth = ctx.measureText(catText).width + 36;
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.roundRect(w / 2 - catWidth / 2, 320, catWidth, 28, 14);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.fillText(catText, w / 2, 339);
  ctx.restore();

  // 7. Festival Greeting Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px 'Playfair Display', Georgia, serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 12;
  ctx.fillText(festival.greetingTitle, w / 2, 415);
  ctx.restore();

  // 8. Festival Full Name
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = "bold 26px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText(festival.name.toUpperCase(), w / 2, 460);
  ctx.restore();

  // 9. Festival Specific Wishes / Quote (Word Wrapped)
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.font = "italic 20px Georgia, serif";

  const wishesText = `"${festival.festivalWishes}"`;
  const maxTextWidth = 960;
  const words = wishesText.split(" ");
  let line = "";
  let y = 520;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTextWidth && n > 0) {
      ctx.fillText(line.trim(), w / 2, y);
      line = words[n] + " ";
      y += 32;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), w / 2, y);
  ctx.restore();

  // 10. Social Commitment / Poster Caption Banner
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.roundRect(140, 620, w - 280, 72, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.fillText("AGNI COMMUNITY WELFARE & SOCIAL IMPACT", w / 2, 648);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "400 13.5px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.fillText(festival.posterCaption || festival.inspirationalMessage, w / 2, 672);
  ctx.restore();

  // 11. Footer: Verification Watermark & Website
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "500 12.5px Inter, 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Official Digital Festive Greeting • AGNI Rural Welfare Society • agniruralwelfare.org", w / 2, 742);
  ctx.restore();
}

/**
 * Interactive React component rendering the canvas and providing instant download
 */
export function FestivalPosterCanvas({ festival, className = "", onDownloadSuccess }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && festival) {
      drawFestivalPoster(canvasRef.current, festival);
    }
  }, [festival]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !festival) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `AGNI-${festival.id}-celebration-poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (onDownloadSuccess) {
        onDownloadSuccess(festival);
      }
    } catch (err) {
      console.error("Failed to download poster:", err);
    }
  };

  return (
    <div className={`festival-poster-canvas-wrap ${className}`}>
      <canvas
        ref={canvasRef}
        className="festival-poster-canvas"
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "12 / 8",
          borderRadius: "16px",
          display: "block",
          boxShadow: "0 14px 38px rgba(0, 0, 0, 0.25)",
        }}
        aria-label={festival?.imageAlt || `${festival?.name} Official Poster`}
      />
    </div>
  );
}

