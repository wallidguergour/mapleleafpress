(() => {
  const sketch = (p) => {
    let cnv;

    p.setup = () => {
      const mount = document.getElementById("p5-forge");
      if (!mount) {
        console.warn("[p5] #p5-forge introuvable");
        return;
      }

      cnv = p.createCanvas(720, 260);
      cnv.parent(mount);

      p.noLoop();
      p.redraw();
    };

    p.draw = () => {
      p.background(15);
      p.noStroke();

      // petit grain "forge" simple
      for (let i = 0; i < 12000; i++) {
        const x = p.random(p.width);
        const y = p.random(p.height);
        const a = p.random(8, 40);
        p.fill(255, a);
        p.rect(x, y, 1, 1);
      }

      // titre debug
      p.fill(255);
      p.textSize(14);
      p.text("p5 OK — forge-grain.js", 12, 22);
    };
  };

  // On attend que le DOM soit prêt
  window.addEventListener("DOMContentLoaded", () => {
    new p5(sketch);
  });
})();
