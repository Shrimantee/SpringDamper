// Implementation of Spring-Damper system : Basic Yo-yo Toy 
// 
// By Shrimantee Roy
// Inspiration :  Daniel Shiffman

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


  line(anchor.x, anchor.y, bob.x, bob.y);
  fill(245, 227, 44);
  translate(anchor.x, anchor.y,0)
  noStroke()

  sphere(32)
  translate(-anchor.x, -anchor.y,0)

  translate(bob.x, bob.y+32,0)
  sphere(64)

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

  velocity.add(force);
  velocity.add(gravity);
  bob.add(velocity);
  velocity.mult(0.99);


}
