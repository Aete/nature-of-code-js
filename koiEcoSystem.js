import p5 from "p5";

new p5((p) => {
  const width = 900;
  const height = 900;
  let t = 0;

  // array for koi fishes
  const koi = [];

  class Koi {
    constructor(location, velocity, mass, isPredator = false) {
      this.location = location;
      this.velocity = velocity;
      this.acceleration = p.createVector(0, 0);
      this.mass = mass;
      this.maxSpeed = isPredator ? 2 : 3;
      this.color = "#212121";
      this.body = this.getBody();
      this.bodyNoise = p.noise(t);
      t += 0.01;
      this.G = isPredator ? 0.1 : 0.05;
      this.isPredator = isPredator;
    }

    getBody() {
      const body = [];
      const bodyLength = p.constrain(
        Math.sqrt(this.mass) + this.bodyNoise * 8,
        5,
        13
      );
      const angleVector = p5.Vector.normalize(this.velocity);
      for (let i = 0; i < bodyLength * 1.5; i++) {
        body.push([
          this.location.x + i * angleVector.x * 1.5,
          this.location.y + i * angleVector.y * 1.5,
          i * Math.sin((Math.PI * 2) / bodyLength),
        ]);
      }
      return body;
    }

    display() {
      if (this.isPredator) {
        p.fill(`rgba(244, 67, 54, 0.2)`);
      } else {
        p.fill(`rgba(33, 33, 33, 0.1)`);
      }
      for (const circle of this.body) {
        p.ellipse(circle[0], circle[1], circle[2], circle[2]);
      }
    }

    checkEdges() {
      if (this.location.x > width || this.location.x < 0) {
        this.velocity.x = this.velocity.x * -1;
        this.location.x = this.location.x > width ? width : 0;
      }
      if (this.location.y > height || this.location.y < 0) {
        this.velocity.y = this.velocity.y * -1;
        this.location.y = this.location.y > height ? height : 0;
      }
    }

    attract(mover) {
      const force = p5.Vector.sub(this.location, mover.location);

      const distance = force.mag() > 100 ? force.mag() : 100;

      if (mover.isPredator === this.isPredator) {
        force.mult(distance === 100 ? 0.01 : 0);
        return force;
      }

      const strength =
        (this.G * this.mass * mover.mass) / (distance * distance);

      force.normalize();

      if (!this.isPredator) {
        force.mult(distance < 10000 ? strength * 20 : 0);
      } else {
        force.mult(distance < 20000 ? strength * -100 : 0);
      }
      return force;
    }

    applyForce(force) {
      const acc = p5.Vector.div(force, this.mass);
      this.acceleration.add(acc);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.location.add(
        this.velocity.mag() > this.maxSpeed
          ? this.velocity.normalize().mult(this.maxSpeed)
          : this.velocity
      );
      this.body = this.getBody();
      this.acceleration.mult(0);
    }
  }

  const kois = [];

  for (let i = 0; i < 100; i++) {
    if (i < 5) {
      kois.push(
        new Koi(
          p.createVector(
            p.random(0.1 * width, 0.9 * width),
            p.random(0.1 * height, 0.9 * height)
          ),
          p.createVector(p.random(-3, 3), p.random(-3, 3)),
          p.random(400, 900),
          true
        )
      );
    } else {
      kois.push(
        new Koi(
          p.createVector(
            p.random(0.1 * width, 0.9 * width),
            p.random(0.1 * height, 0.9 * height)
          ),
          p.createVector(p.random(-3, 3), p.random(-3, 3)),
          p.random(10, 40)
        )
      );
    }
  }

  p.setup = () => {
    p.createCanvas(width, height);
    p.noStroke();
    p.background(254);
  };

  p.draw = () => {
    p.fill("rgba(255, 255, 255, 0.2)");
    p.rect(0, 0, width, height);

    for (let i = 0; i < kois.length; i++) {
      for (let j = 0; j < kois.length; j++) {
        if (i !== j) {
          const force = kois[i].attract(kois[j]);
          kois[i].applyForce(force);
        }
      }
      kois[i].update();
      kois[i].checkEdges();
      kois[i].display();
    }
  };
}, "app");
