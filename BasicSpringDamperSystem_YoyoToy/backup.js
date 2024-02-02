// Spring Forces (Spring Vector)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/160-spring-forces.html
// https://youtu.be/Rr-5HiXquhw

// Simple Spring: https://editor.p5js.org/codingtrain/sketches/dcd6-2mWa
// Spring Vector: https://editor.p5js.org/codingtrain/sketches/_A2pm_SSg
// Spring OOP: https://editor.p5js.org/codingtrain/sketches/9BAoEn4Po
// Soft Spring: https://editor.p5js.org/codingtrain/sketches/S5dY7qjxP

let bob;
let anchor;
let velocity;
let restLength = 400;
let k = 0.02;
let gravity;
let mass = 2;
let invMass;
let a;

function setup() {
  createCanvas(600, 400,WEBGL);
  bob = createVector(0, 0,0);
  anchor = createVector(0, -height,0);
  velocity = createVector(0, 0,0);
  gravity = createVector(0, 0.1,0);
  a = createVector(0,0,0)
  invMass=1/mass

}

function draw() {
  background(112, 150, 226);
  lights()
  strokeWeight(4);
  stroke(255);
  scale(0.5)
  rotateX(cos(30)*360)

  // translate(anchor.x, anchor.y,0)
  // box( 10,anchor.y-bob.y-32,10)
  // translate(-anchor.x+bob.x, -anchor.y,0)

  line(anchor.x, anchor.y, bob.x, bob.y);
  fill(245, 227, 44);
  translate(anchor.x, anchor.y,0)
  noStroke()

  sphere(32)
  translate(-anchor.x, -anchor.y,0)

  // // circle(anchor.x, anchor.y, 32);
  translate(bob.x, bob.y+32,0)
  sphere(64)
  // circle(bob.x, bob.y, 64);

  if (mouseIsPressed) {

    print(mouseX,mouseY)
    print(width)
    if(mouseX<width/2){
      bob.x = mouseX/2-width/2
      print("less"+bob.x)
    }

    else
    bob.x = mouseX/2;
    bob.y = mouseY;
    velocity.set(0, 0);
  }
 

  


  let force = p5.Vector.sub(bob, anchor);
  let x = force.mag() - restLength;
  force.normalize();
  force.mult(-1 * k * x);

  // F = A
  velocity.add(force);
  velocity.add(gravity);
  bob.add(velocity);
  velocity.mult(0.99);


}
