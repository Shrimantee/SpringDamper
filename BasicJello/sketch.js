// Implementation of Spring-Damper system : Basic Jello
// 
// By Shrimantee Roy
// Inspiration :  Daniel Shiffman


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
  directionalLight(255,0,0,0,0,1)
    // rotateX(sin(30)*360)
  rotateY(cos(30)*360)
  background(10);
  // scale(0.2)
  updateSpring();
  drawSpring();
}

function drawSpring() {
  fill(255,10,10,100)

  box(100-ps,ps+100,100)
 
}

function updateSpring() {
  if ( !move ) {
    f = -K * ( ps - R ); 
    as = f / M;          
    vs = D * (vs + as);  
    ps = ps + vs;        
  }

  if (abs(vs) < 0.1) {
    vs = 0.0;
  }

  if (mouseX > 200 && mouseX < 500 && mouseY > 0 && mouseY < 200 + springHeight) {
    // print(mouseX)
    over = true;
  } else {
    over = false;
  }

  if (move) {
    print (move)
    ps = mouseY - springHeight / 2;
    ps = constrain(ps, minHeight, maxHeight);
  }
}

function mousePressed() {
  print(mouseX,mouseY)
  if (over) {
    move = true;
  }
}

function mouseReleased() {
  move = false;
}
