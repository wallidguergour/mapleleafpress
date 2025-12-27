let grains = [];

function setup() {
  const canvas = createCanvas(600, 300);
  canvas.parent("p5-forge"); // IMPORTANT
  
  for (let i = 0; i < 140; i++) {
    grains.push({
      x: random(width),
      y: random(height),
      r: random(6, 12)
    });
  }
}

function draw() {
  background(15);
  noStroke();
  fill(255, 120, 0);

  let pressure = map(mouseX, 0, width, 0.6, 2.2);

  for (let g of grains) {
    ellipse(
      g.x,
      g.y,
      g.r * pressure,
      g.r / pressure
    );
  }

  fill(180);
  textSize(12);
  text("Pression de forge", 10, height - 10);
}
