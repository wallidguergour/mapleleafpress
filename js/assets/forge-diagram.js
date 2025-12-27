/* forge-diagram.js
   Near-Net Forging diagram for Maple Leaf Press
   Mounts inside: <div id="p5-forge"></div>
*/

(function () {
  const MOUNT_ID = "p5-forge";

  const sketch = (p) => {
    let slider;
    let cnv;

    // --- helpers
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function setCanvasSize() {
      const mount = document.getElementById(MOUNT_ID);
      if (!mount) return { w: 720, h: 360 };

      const w = clamp(mount.clientWidth || 720, 320, 1100);
      const h = clamp(Math.round(w * 0.44), 220, 520);
      return { w, h };
    }

    function drawPanel(x, y, w, h) {
      p.noStroke();
      p.fill(10, 12, 16, 180);
      p.rect(x, y, w, h, 18);
      p.stroke(255, 255, 255, 10);
      p.noFill();
      p.rect(x + 1, y + 1, w - 2, h - 2, 18);
    }

    function drawLabel(txt, x, y) {
      p.noStroke();
      p.fill(255, 255, 255, 235);
      p.text(txt, x, y);
    }

    function drawMuted(txt, x, y) {
      p.noStroke();
      p.fill(255, 255, 255, 120);
      p.text(txt, x, y);
    }

    function drawBar(x, y, w, h, t, value01) {
      // bg
      p.noStroke();
      p.fill(255, 255, 255, 22);
      p.rect(x, y, w, h, 10);

      // fill (no explicit color request from user, but we need contrast.
      // We'll use grayscale.)
      p.fill(255, 255, 255, 120);
      p.rect(x, y, w * clamp(value01, 0, 1), h, 10);

      p.fill(255, 255, 255, 210);
      p.text(t, x, y - 8);
    }

    function finalShape(cx, cy, s) {
      // "final part" silhouette (rounded irregular)
      p.beginShape();
      p.vertex(cx - 1.20 * s, cy + 0.55 * s);
      p.bezierVertex(cx - 1.35 * s, cy + 0.10 * s, cx - 1.20 * s, cy - 0.55 * s, cx - 0.60 * s, cy - 0.60 * s);
      p.bezierVertex(cx - 0.10 * s, cy - 0.65 * s, cx + 0.20 * s, cy - 0.35 * s, cx + 0.55 * s, cy - 0.55 * s);
      p.bezierVertex(cx + 1.15 * s, cy - 0.95 * s, cx + 1.35 * s, cy - 0.20 * s, cx + 1.10 * s, cy + 0.15 * s);
      p.bezierVertex(cx + 0.95 * s, cy + 0.60 * s, cx + 0.10 * s, cy + 0.85 * s, cx - 1.20 * s, cy + 0.55 * s);
      p.endShape(p.CLOSE);
    }

    function billetShape(cx, cy, s, nn01) {
      // billet/forged preform that approaches final shape as nn01 increases.
      // At nn01=0 -> chunky rounded rectangle
      // At nn01=1 -> almost final shape with small offset
      const t = clamp(nn01, 0, 1);

      // We'll interpolate between two silhouettes by morphing control points.
      // Simple trick: draw a chunky "envelope" around final shape that shrinks with t.
      const pad = (1 - t) * 0.55 * s + 0.08 * s;

      p.beginShape();
      p.vertex(cx - (1.20 * s + pad), cy + (0.55 * s + pad));
      p.bezierVertex(
        cx - (1.45 * s + pad),
        cy + (0.10 * s),
        cx - (1.25 * s + pad),
        cy - (0.70 * s - pad),
        cx - (0.60 * s - pad),
        cy - (0.60 * s - pad)
      );
      p.bezierVertex(
        cx - (0.10 * s - pad),
        cy - (0.70 * s - pad),
        cx + (0.25 * s),
        cy - (0.40 * s - pad),
        cx + (0.55 * s + pad),
        cy - (0.55 * s - pad)
      );
      p.bezierVertex(
        cx + (1.35 * s + pad),
        cy - (1.05 * s - pad),
        cx + (1.55 * s + pad),
        cy - (0.10 * s),
        cx + (1.15 * s + pad),
        cy + (0.20 * s + pad)
      );
      p.bezierVertex(
        cx + (0.95 * s + pad),
        cy + (0.75 * s + pad),
        cx + (0.05 * s),
        cy + (0.95 * s + pad),
        cx - (1.20 * s + pad),
        cy + (0.55 * s + pad)
      );
      p.endShape(p.CLOSE);
    }

    function hatchArea(x, y, w, h) {
      // diagonal hatch (milling chips / removed stock)
      p.push();
      p.noFill();
      p.stroke(255, 255, 255, 35);
      const step = 12;
      for (let i = -h; i < w + h; i += step) {
        p.line(x + i, y + h, x + i + h, y);
      }
      p.pop();
    }

    // --- p5 lifecycle
    p.setup = () => {
      const mount = document.getElementById(MOUNT_ID);
      const { w, h } = setCanvasSize();
      cnv = p.createCanvas(w, h);
      cnv.parent(MOUNT_ID);

      p.textFont("system-ui, -apple-system, Segoe UI, Roboto, Arial");
      p.textSize(14);

      // Slider
      slider = p.createSlider(0, 100, 60, 1);
      slider.parent(MOUNT_ID);
      slider.style("width", "240px");
      slider.style("margin-top", "10px");

      // small label
      const label = document.createElement("div");
      label.id = "p5-forge-label";
      label.style.opacity = "0.85";
      label.style.fontSize = "12px";
      label.style.marginTop = "6px";
      label.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
      label.innerHTML = "Near-Net (%) : ajuste la proximité du brut par rapport à la forme finale";
      mount.appendChild(label);
    };

    p.windowResized = () => {
      const { w, h } = setCanvasSize();
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.clear();

      const nn = slider ? slider.value() : 60;
      const nn01 = nn / 100;

      // background panel
      const pad = 18;
      drawPanel(pad, pad, p.width - pad * 2, p.height - pad * 2);

      // Title
      p.textSize(16);
      drawLabel("Schéma : Near-Net Forging → moins d’usinage, moins de matière perdue", pad + 18, pad + 28);

      // Layout zones
      const x0 = pad + 18;
      const y0 = pad + 44;
      const W = p.width - (pad + 18) * 2;
      const H = p.height - (pad + 18) * 2 - 40;

      const leftW = Math.round(W * 0.62);
      const rightW = W - leftW - 18;

      // Diagram area (left)
      const dx = x0;
      const dy = y0;
      const dw = leftW;
      const dh = H;

      p.noStroke();
      p.fill(255, 255, 255, 10);
      p.rect(dx, dy, dw, dh, 14);

      // draw "forge line"
      p.stroke(255, 255, 255, 18);
      p.line(dx + 20, dy + dh - 36, dx + dw - 20, dy + dh - 36);

      // Part drawing center
      const cx = dx + Math.round(dw * 0.53);
      const cy = dy + Math.round(dh * 0.50);
      const s = Math.min(dw, dh) * 0.16;

      // Removed material area (conceptual) behind billet
      // We'll approximate by drawing a bounding box hatch that shrinks with nn01.
      const bboxW = 4.4 * s;
      const bboxH = 2.7 * s;
      const stockPad = (1 - nn01) * 0.75 * s + 0.2 * s;

      const bx = cx - bboxW / 2 - stockPad;
      const by = cy - bboxH / 2 - stockPad * 0.65;
      const bw = bboxW + stockPad * 2;
      const bh = bboxH + stockPad * 1.3;

      // hatch region
      p.fill(255, 255, 255, 6);
      p.noStroke();
      p.rect(bx, by, bw, bh, 16);
      hatchArea(bx + 8, by + 8, bw - 16, bh - 16);

      // billet (preform)
      p.noStroke();
      p.fill(255, 255, 255, 30);
      billetShape(cx, cy, s, nn01);

      // final part outline (reference)
      p.noFill();
      p.stroke(255, 255, 255, 160);
      p.strokeWeight(2);
      finalShape(cx, cy, s);

      // legends
      p.noStroke();
      p.textSize(13);
      drawMuted("Brut / Préforme", dx + 22, dy + 26);
      drawMuted("Forme finale (référence)", dx + 22, dy + 46);

      // small indicator dot showing “gap”
      const gap = (1 - nn01);
      p.fill(255, 255, 255, 180);
      p.circle(dx + 24, dy + 60, 6);
      p.fill(255, 255, 255, 110);
      p.text(`Écart (surépaisseur) : ${Math.round(gap * 100)}%`, dx + 38, dy + 64);

      // Metrics (right)
      const mx = dx + dw + 18;
      const my = dy;
      const mw = rightW;
      const mh = dh;

      p.noStroke();
      p.fill(255, 255, 255, 10);
      p.rect(mx, my, mw, mh, 14);

      p.textSize(14);
      drawLabel(`Near-Net : ${nn}%`, mx + 16, my + 28);

      p.textSize(12);
      drawMuted("Indicateurs (illustration)", mx + 16, my + 50);

      // Example metric mapping (illustrative)
      const machining01 = clamp(1 - nn01 * 0.92, 0.05, 1);
      const waste01 = clamp(1 - nn01 * 0.95, 0.03, 1);
      const variability01 = clamp(0.65 - nn01 * 0.45, 0.15, 0.65);

      const barX = mx + 16;
      let barY = my + 86;
      const barW = mw - 32;
      const barH = 12;

      drawBar(barX, barY, barW, barH, "Usinage (volume)", machining01);
      barY += 46;
      drawBar(barX, barY, barW, barH, "Matière perdue", waste01);
      barY += 46;
      drawBar(barX, barY, barW, barH, "Risque variabilité", variability01);

      barY += 54;
      p.fill(255, 255, 255, 170);
      p.text(
        "Idée simple : plus la préforme est proche\nplus tu réduis l’usinage et les rebuts.\nMais ça demande un procédé maîtrisé.",
        barX,
        barY
      );

      // Footer hint
      p.textSize(11);
      p.fill(255, 255, 255, 90);
      p.text("Maple Leaf Press — diagramme p5.js", pad + 18, p.height - pad - 16);
    };
  };

  // mount safely once DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return;

    // prevent multiple instances if template is reused/partial reload
    if (mount.dataset.p5Mounted === "1") return;
    mount.dataset.p5Mounted = "1";

    new p5(sketch);
  });
})();
