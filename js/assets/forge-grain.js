(() => {
  const mountId = "p5-forge";

  const sketch = (p) => {
    let g;

    function sizeFromContainer() {
      const el = document.getElementById(mountId);
      const w = el ? el.clientWidth : 800;
      const h = Math.round(w * 0.32); // ratio
      return { w: Math.max(320, w), h: Math.max(140, h) };
    }

    p.setup = () => {
      const { w, h } = sizeFromContainer();
      const cnv = p.createCanvas(w, h);
      cnv.parent(mountId);
      p.pixelDensity(1);

      g = p.createGraphics(w, h);
      drawOnce();
      p.noLoop();
    };

    function drawOnce() {
      const w = p.width, h = p.height;

      // Fond (dégradé vertical)
      p.noStroke();
      for (let y = 0; y < h; y++) {
        const t = y / (h - 1);
        const c = p.lerpColor(p.color(8, 10, 14), p.color(16, 18, 22), t);
        p.fill(c);
        p.rect(0, y, w, 1);
      }

      // Grain
      g.clear();
      g.noStroke();
      for (let i = 0; i < w * h * 0.03; i++) {
        const x = p.random(w);
        const y = p.random(h);
        const a = p.random(10, 40);
        g.fill(255, a);
        g.rect(x, y, 1, 1);
      }
      p.image(g, 0, 0);

      // Micro “étincelles” (rares)
      p.noStroke();
      for (let i = 0; i < w * 0.12; i++) {
        const x = p.random(w);
        const y = p.random(h);
        const bright = p.random() < 0.15; // 15% un peu plus lumineuses
        p.fill(255, bright ? 90 : 40);
        p.circle(x, y, bright ? p.random(1.2, 2.4) : 1);
      }

      // Vignette (bords plus sombres)
      p.noFill();
      for (let i = 0; i < 28; i++) {
        const a = p.map(i, 0, 27, 0, 130);
        p.stroke(0, a);
        p.rect(i, i, w - i * 2, h - i * 2, 16);
      }
    }

    p.windowResized = () => {
      const { w, h } = sizeFromContainer();
      p.resizeCanvas(w, h);
      g = p.createGraphics(w, h);
      drawOnce();
    };
  };

  // Instance mode (évite les conflits avec d’autres libs)
  new p5(sketch);
})();
