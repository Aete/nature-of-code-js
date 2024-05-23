import p5 from "p5";

new p5((p) => {
  const width = innerWidth;
  const height = innerHeight;

  class Mover {
    constructor(location, velocity, mass) {
      this.location = location;
      this.velocity = velocity;
      this.acceleration = p.createVector(0, 0);
      this.mass = mass;
      this.maxSpeed = 10;
    }

    display() {
      p.fill("#f44336");
      p.ellipse(
        this.location.x,
        this.location.y,
        Math.sqrt(this.mass),
        Math.sqrt(this.mass)
      );
    }

    applyForce(force) {
      const acc = p5.Vector.div(force, this.mass);
      this.acceleration.add(acc);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
    }

    checkEdges() {
      if (this.location.x > innerWidth || this.location.x < 0) {
        this.velocity.x = this.velocity.x * -1;
        this.location.x = this.location.x > innerWidth ? innerWidth : 0;
      }
      if (this.location.y > innerHeight || this.location.y < 0) {
        this.velocity.y = this.velocity.y * -1;
        this.location.y = this.location.y > innerHeight ? innerHeight : 0;
      }
    }

    applyLiquid(liquid) {
      if (
        this.location.x > liquid.x &&
        this.location.x < liquid.x + liquid.w &&
        this.location.y > liquid.y &&
        this.location.y < liquid.y + liquid.h
      ) {
        const drag = calculateDrag(this, 10, 0.1);
        this.applyForce(drag);
      }
    }
  }

  class Liquid {
    constructor(x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.c = c;
    }
    display() {
      p.noStroke();
      p.fill("rgba(175, 175, 175, 0.2)");
      p.rect(this.x, this.y, this.w, this.h);
    }
  }

  function calculateFraction(object, frictionC) {
    const friction = object.velocity.copy();
    friction.mult(-1);
    friction.normalize();
    friction.mult(frictionC);
    return friction;
  }

  function calculateDrag(object, liquidDensity, dragC) {
    const speed = object.velocity.mag();
    const dragMagnitude = liquidDensity * speed * speed * dragC;
    const drag = object.velocity.copy();
    drag.normalize();
    drag.mult(dragMagnitude);
    drag.mult(-0.5);
    return drag;
  }

  const balls = [];

  for (let i = 1; i < 20; i++) {
    balls.push(
      new Mover(
        p.createVector(p.random(0, width), 0),
        p.createVector(0, 0),
        p.random(50, 1000)
      )
    );
  }

  const liquid = new Liquid(0, (height * 3) / 4, width, height / 4, 50);

  const gravityAcc = p.createVector(0, 0.3);
  const wind = p.createVector(1, 0);
  const frictionConst = 0.01;

  p.setup = () => {
    p.createCanvas(width, height);
    p.noStroke();
    p.background(254);
  };

  p.draw = () => {
    p.fill("rgba(255, 255, 255, 0.2)");
    p.rect(0, 0, width, height);
    liquid.display();

    balls.forEach((ball) => {
      ball.applyForce(p5.Vector.mult(gravityAcc, ball.mass));
      ball.applyForce(calculateFraction(ball, frictionConst));
      ball.applyLiquid(liquid);

      if (p.mouseIsPressed) {
        ball.applyForce(wind);
      }

      ball.update();
      ball.checkEdges();
      ball.display();
    });
  };
}, "app");
