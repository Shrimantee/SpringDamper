// Implementation of Spring-Damper system : Cloth Simulation - Part 2
// 
// Edge Constrained and applied wind, comparing RK1, RK2 and RK4 results
// By Shrimantee Roy
// Inspiration :  https://threejs.org/examples/#physics_ammo_cloth and Daniel Shiffman


var structuralSprng = true;
var shearSprng = true;
var bendSprng = true;



var enableGUI = true;



var friction = 1;

var x_div = 40;
var y_div = 40;

var fabricLength = 400;
var fabricWidth = 900;
var rD;

var applyWind = true;
var windStrength;
var windForce = new THREE.Vector3(0, 0, 0);
var rD_Bend = 2;
var rd_Shear = Math.sqrt(2);



var constrainType = 'Curtain';

var curtainConstrain

var DAMP_F = 0.00001;
var DRAG_F = 1 - DAMP_F;
var MASS = 4.5;

if (enableGUI) {

  guiControls = new function () {
    this.friction = friction;
    this.particles = x_div;

    this.wind = applyWind;
    this.pinned = constrainType;


    this.fabricLength = fabricLength;
    this.fabricWidth = fabricWidth
    this.structuralSprng   = structuralSprng;

    this.bendSprng = bendSprng;
    this.rD_Bend = rD_Bend;

    this.shearSprng = shearSprng;
    this.rd_Shear = rd_Shear;

  };

  gui = new dat.GUI();

  var clothLenghtMenu = gui.add(guiControls, 'fabricLength', 300, 2000).step(20).name('Size').onChange(function (value) { fabricLength = value; x_div = Math.round(value / 10); y_div = Math.round(value / 10); restartCloth(); });

  var controlsMenu = gui.addFolder('Controls')

  controlsMenu.add(guiControls, 'wind').name('Apply Wind').onChange(function (value) { applyWind = value; });
  controlsMenu.add(guiControls, 'pinned', ['None', 'OneEdge']).name('Constrain Type').onChange(function (value) { constrain(value); });

  controlsMenu.add(guiControls, 'structuralSprng').name('structural Springs').onChange(function(value){structuralSprng = value; restartCloth();});
  controlsMenu.add(guiControls, 'shearSprng').name('shear Springs').onChange(function(value){shearSprng = value; restartCloth();});
  controlsMenu.add(guiControls, 'bendSprng').name('bending Springs').onChange(function(value){bendSprng = value; restartCloth();});
}

var cloth_init = sheet(500, 500);
var cloth = new Cloth(x_div, y_div, fabricLength, fabricWidth);

var GRAVITY = 9.81 * 50;
var g = new THREE.Vector3(0, - GRAVITY, 0).multiplyScalar(MASS);


var temp = new THREE.Vector3();

var lastTime;

var pos;

var prevPos, curPos;

var diff = new THREE.Vector3();


var minX, minY, minZ;
var currentX, currY, currZ;
var distX, distY, distZ;

function constrain(choice) {

  if (choice == 'Curtain') {
    curtainConstrain = true;
  }
  else if (choice == 'None') {
    curtainConstrain = false;
  }
}

function sheet(width, height) {

  return function (u, v) {

    var x = u * width - width / 2;
    var y = height;
    var z = v * height - height / 2;

    return new THREE.Vector3(x, y, z);

  };

}

function Cloth(w, h, l, b) {

  this.w = w;
  this.h = h;
  restDistancel = l / h;
  restDistanceb = b / w
  console.log("rd l" + restDistancel);
  console.log("rd b" + restDistanceb);
  var particles = [];
  var constrains = [];

  var u, v;

  for (v = 0; v <= h; v++) {
    for (u = 0; u <= w; u++) {
      particles.push(
        new Particle(u / w, v / h, v / h, MASS)
      );
    }
  }

  for (v = 0; v <= h; v++) {
    for (u = 0; u <= w; u++) {

      if (v < h && (u == 0 || u == w)) {
        constrains.push([
          particles[index(u, v)],
          particles[index(u, v + 1)],
          restDistancel,
          // restDistanceb
        ]);
      }

      if (u < w && (v == 0 || v == h)) {
        constrains.push([
          particles[index(u, v)],
          particles[index(u + 1, v)],
          restDistancel,
          // restDistanceb
        ]);
      }
    }
  }


  // tensile

  if (structuralSprng) {

    for (v = 0; v < h; v++) {
      for (u = 0; u < w; u++) {

        if (u != 0) {
          constrains.push([
            particles[index(u, v)],
            particles[index(u, v + 1)],
            restDistancel,
            // restDistanceb
          ]);
        }

        if (v != 0) {
          constrains.push([
            particles[index(u, v)],
            particles[index(u + 1, v)],
            restDistancel,
            // restDistanceb
          ]);
        }

      }
    }
  }

  // Shear

  if (shearSprng) {

    for (v = 0; v <= h; v++) {
      for (u = 0; u <= w; u++) {

        if (v < h && u < w) {
          constrains.push([
            particles[index(u, v)],
            particles[index(u + 1, v + 1)],
            rd_Shear * restDistancel,
            // restDistanceS*restDistanceb,

          ]);

          constrains.push([
            particles[index(u + 1, v)],
            particles[index(u, v + 1)],
            rd_Shear * restDistancel,
            // restDistanceS*restDistanceb
          ]);
        }

      }
    }
  }



  // Bend

  if (bendSprng) {

    for (v = 0; v < h; v++) {

      for (u = 0; u < w; u++) {

        if (v < h - 1) {
          constrains.push([
            particles[index(u, v)],
            particles[index(u, v + 2)],
            rD_Bend * restDistancel,
            // restDistanceB*restDistanceb

          ]);
        }

        if (u < w - 1) {
          constrains.push([
            particles[index(u, v)],
            particles[index(u + 2, v)],
            rD_Bend * restDistancel,
            // restDistanceB*restDistanceb

          ]);
        }


      }
    }
  }




  this.particles = particles;
  this.constrains = constrains;

  function index(u, v) {

    return u + v * (w + 1);

  }

  this.index = index;

}


function clothsim(time) {

  if (!lastTime) {

    lastTime = time;
    return;

  }

  var i, len, particles, particle, constrains, constrain;

  if (applyWind) {

    windStrength = Math.cos(time / 7000) * 20 * 2000;
    windForce.set(
      Math.sin(time / 2000),
      Math.cos(time / 3000),
      Math.sin(time / 1000)
    ).normalize().multiplyScalar(windStrength);

    // apply the wind force to the cloth particles
    var face, faces = clothGeo.faces, normal;
    particles = cloth.particles;
    for (i = 0, len = faces.length; i < len; i++) {
      face = faces[i];
      normal = face.normal;
      temp.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
      particles[face.a].addForce(temp);
      particles[face.b].addForce(temp);
      particles[face.c].addForce(temp);
    }

  }

  for (particles = cloth.particles, i = 0, len = particles.length; i < len; i++) {
    particle = particles[i];
    particle.addForce(g);
    particle.integrate(); // performs verlet integration
  }


  constrains = cloth.constrains,
    len = constrains.length;
  for (i = 0; i < len; i++) {
    constrain = constrains[i];

    applyConstrains(constrain[0], constrain[1], constrain[2]);
  }




  for (particles = cloth.particles, i = 0, len = particles.length
    ; i < len; i++) {
    particle = particles[i];
    if (particle.pos.y < - 220)
      particle.pos.y = - 220; // Treating floor as constraint
  }

  if (curtainConstrain) {
    for (u = 0; u <= x_div; u++) {
      particles[cloth.index(u, 0)].lock(); // locking all top row particles
    }
  }

}

function Particle(x, y, z, mass) {

  this.mass = mass;
  this.invMass = 1 / mass;
  this.pos = cloth_init(x, y, z);
  this.prev = cloth_init(x, y, z);
  this.org = cloth_init(x, y, z);

  this.velocity = new THREE.Vector3(1, 1, 1)
  this.a = new THREE.Vector3(0, 0, 0);

  this.temp = new THREE.Vector3();
  this.temp_ = new THREE.Vector3();

}

Particle.prototype.lock = function () {

  this.pos.copy(this.org);
  this.prev.copy(this.org);
}


Particle.prototype.addForce = function (force) {

  this.a.add(
    this.temp_.copy(force).multiplyScalar(this.invMass)
  );

};



/* TODO : Integration methods */
Particle.prototype.integrate = function () {

  var h = 0.01
  // Performs verlet integration
  /* 
    var newPos = this.tmp.subVectors( this.position, this.previous );
    newPos.multiplyScalar( DRAG/2 ).add( this.position );
    newPos.add( this.a.multiplyScalar( timesq ) );
  
    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;
  
    this.a.set( 0, 0, 0 ); */


  /* --------------------------------------------------------------- */

  // Performs RK1 integration

 /*  this.temp = this.velocity.add(this.a.multiplyScalar(h))
  var newPos = this.pos.add(this.temp.multiplyScalar(h))
  newPos.multiplyScalar(DRAG_F / 2).add(this.pos);

  this.temp = this.prev;
  this.prev = this.pos;
  this.pos = newPos;

  this.a.set(0, 0, 0); */

  /* --------------------------------------------------------------- */

  // Performs RK2 integration

  /* var v1 = this.velocity.add(this.a.multiplyScalar(h*0.5))
  var newPos1 = this.pos.add(v1.multiplyScalar(h*0.5))
  newPos1.multiplyScalar( DRAG_F/2 ).add( this.pos );
 
  this.a = v1.sub(this.velocity)
  this.a.add(
    this.temp_.copy( g ).multiplyScalar( this.invMass )
  );

  var v2 = this.velocity.add(this.a.multiplyScalar(h))
  var newPos = this.pos.add(v2.multiplyScalar(h))
  newPos.multiplyScalar( DRAG_F/2 ).add( newPos1 );
 
  this.temp = this.prev;
  this.prev = this.pos;
  this.pos= newPos;
 
  this.a.set( 0, 0, 0 );
 */
  /* --------------------------------------------------------------- */


  // Performs RK4 integration
   this.temp = this.velocity.add(this.a.multiplyScalar(h * 0.5))
   var newPos1 = this.pos.add(this.temp.multiplyScalar(h * 0.5))
   newPos1.multiplyScalar(DRAG_F / 2).add(this.pos);
 
   var K2 = this.temp.sub(this.velocity).divideScalar(0.5)
 
   K2.add(
     this.temp_.copy(g).multiplyScalar(this.invMass)
   );
   var v2 = this.velocity.add(K2.multiplyScalar(h * 0.5))
   var newPos2 = this.pos.add(v2.multiplyScalar(h * 0.5))
   newPos2.multiplyScalar(DRAG_F / 2).add(newPos1);
 
   var K3 = v2.sub(this.temp).divideScalar(0.5)
   K3.add(
     this.temp_.copy(g).multiplyScalar(this.invMass)
   );
 
   var v3 = this.velocity.add(K3.multiplyScalar(h * 0.5))
   var newPos3 = this.pos.add(v3.multiplyScalar(h * 0.5))
   newPos3.multiplyScalar(DRAG_F / 2).add(newPos2);
 
   var K4 = v3.sub(v2).divideScalar(0.5)
   K4.add(
     this.temp_.copy(g).multiplyScalar(this.invMass)
   );
 
   this.temp = this.velocity.add(K4.multiplyScalar(h))
   var newPos = this.pos.add(this.temp.multiplyScalar(h))
   newPos.multiplyScalar(DRAG_F / 2).add(newPos3);
 
   this.temp = this.prev;
   this.prev = this.pos;
   this.pos = newPos;
 
   this.a.set(0, 0, 0);
};



function applyConstrains(particle1, particle2, d) {

  diff.subVectors(particle2.pos, particle1.pos);
  var dist = diff.length();
  if (dist == 0) return;
  var c = diff.multiplyScalar((dist - d) / dist);
  c = c.multiplyScalar(0.5);
  particle1.pos.add(c);
  particle2.pos.sub(c);

}
