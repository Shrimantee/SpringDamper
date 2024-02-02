// Spring drawing constants for top bar
let springHeight = 32,
    left,
    right,
    maxHeight = 250,
    minHeight = 200,
    over = false,
    move = false;

// Spring simulation constants
let M = 0.8,  // Mass
    K = 0.2,  // Spring constant
    D = 0.92, // Damping
    R = 200;  // Rest position

// Spring simulation variables
let ps = R,   // Position
    vs = 0.0, // Velocity
    as = 0,   // Acceleration
    f = 0;    // Force

function setup() {
  createCanvas(572, 655,WEBGL);
  print(windowHeight,windowWidth)
  rectMode(CORNERS);
  noStroke();
  left = - 400;
  right = 400;
}

function draw() {
  lights()
    // rotateX(sin(30)*360)
  rotateY(cos(30)*360)
  background(102);
  // scale(0.2)
  updateSpring();
  drawSpring();
}

function drawSpring() {
  fill(200,10,10,100)

  box(100-ps,ps+100,100)
  // translate(0,-ps)
  // fill(0)
  // box(200,10,200)
  // Draw base
  // fill(0.2);
  // let baseWidth = 0.5 * ps + -8;
  // rect( - baseWidth, ps + springHeight,  baseWidth, height);

  // // Set color and draw top bar
  // if (over || move) {
  //   fill(255);
  // } else {
  //   fill(204);
  // }

  // rect(left, ps, right, ps + springHeight);
}

function updateSpring() {
  // Update the spring position
  if ( !move ) {
    f = -K * ( ps - R ); // f=-ky
    as = f / M;          // Set the acceleration, f=ma == a=f/m
    vs = D * (vs + as);  // Set the velocity
    ps = ps + vs;        // Updated position
  }

  if (abs(vs) < 0.1) {
    vs = 0.0;
  }

  // Test if mouse if over the top bar
  if (mouseX > 200 && mouseX < 500 && mouseY > 0 && mouseY < 200 + springHeight) {
    // print(mouseX)
    over = true;
  } else {
    over = false;
  }

  // Set and constrain the position of top bar
  if (move) {
    print (move)
    ps = mouseY - springHeight / 2;
    ps = constrain(ps, minHeight, maxHeight);
  }
}

function mousePressed() {
  print(mouseX,mouseY)
  if (over) {
    // print(over)
    move = true;
  }
}

function mouseReleased() {
  move = false;
}
