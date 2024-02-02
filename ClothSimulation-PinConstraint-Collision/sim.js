
// Implementation of Spring-Damper system : Cloth Simulation - Part 3
// 
// Edge-vertex collision and applied wind, comparing RK1, RK2 and RK4 results
// By Shrimantee Roy
// Inspiration :  https://threejs.org/examples/#physics_ammo_cloth and Daniel Shiffman

var tensileSprng = true;
var shearSprng = true;
var bendSprng = true;

var DAMP_F = 0.00001;
var DRAG_F = 1 - DAMP_F;
var MASS = 5;


var enableGUI = true;


var friction = 1;

var x_div = 35;
var y_div = 35;

var fabricLength = 680;
var fabricWidth = 900;
var rD;

var applyWind = false;
var windStrength;
var windForce = new THREE.Vector3(0, 0, 0);
var rD_Bend = 2;
var rd_Shear = Math.sqrt(2);

var rotate = false;
var constrainType = 'Corners';
var thing = 'None';
var pinched
pinched = true


if (enableGUI) {

  // GUI controls
  //sliders

  guiControls = new function () {
    this.friction = friction;
    this.particles = x_div;

    this.wind = applyWind;
    this.pinned = constrainType;
    this.thing = thing;


    this.fabricLength = fabricLength;
    this.fabricWidth = fabricWidth
    this.tensileSprng = tensileSprng;

    this.bendSprng = bendSprng;
    this.rD_Bend = rD_Bend;

    this.shearSprings = shearSprng;
    this.rd_Shear = rd_Shear;

    this.clothColor = 0x800000;
    this.clothSpecular = 0x030303;

    this.groundColor = 0x404761;
    this.groundSpecular = 0x404761;

    this.fogColor = 0xcce0ff;

  };

  gui = new dat.GUI();

  var clothLenghtMenu = gui.add(guiControls, 'fabricLength', 600, 2000).step(20).name('Size').onChange(function (value) { fabricLength = value; x_div = Math.round(value / 10); y_div = Math.round(value / 10); restartCloth(); });

  var controlsMenu = gui.addFolder('Controls')

  controlsMenu.add(guiControls, 'wind').name('Apply Wind').onChange(function (value) { applyWind = value; });
  controlsMenu.add(guiControls, 'thing', ['None', 'Sphere', 'Box']).name('object').onChange(function (value) { obstacles(value); });

}

var cloth_init = sheet(500, 500);
var cloth = new Cloth(x_div, y_div, fabricLength, fabricWidth);

var GRAVITY = 9.81 * 50;
var g = new THREE.Vector3(0, - GRAVITY, 0).multiplyScalar(MASS);





var sphereSize = 100;
var spherePos = new THREE.Vector3(0, -250 + sphereSize, 0);
var ball_prev = new THREE.Vector3(0, -250 + sphereSize, 0);
var floorPos = new THREE.Vector3()
var temp = new THREE.Vector3();

var lastTime;

var pos;

var prevPos, curPos;

var posFriction = new THREE.Vector3(0, 0, 0);
var posNoFriction = new THREE.Vector3(0, 0, 0);

var diff = new THREE.Vector3();
var objectCenter = new THREE.Vector3();

var minx, miny, minz, maxx, maxy, maxz;

var minX, minY, minZ;
var currentX, currY, currZ;
var distX, distY, distZ;

function obstacles(obs) {

  if (obs == 'Sphere') {
    sphere.visible = true;
    box.visible = false;
    restartCloth();
  }
  else if (obs == 'Box') {

    minx = boundingBox.min.x;
    miny = boundingBox.min.y;
    minz = boundingBox.min.z;
    maxx = boundingBox.max.x;
    maxy = boundingBox.max.y;
    maxz = boundingBox.max.z;

    sphere.visible = false;
    box.visible = true;
    restartCloth();
  }
  else if (obs == 'None' || obs == 'none') {
    sphere.visible = false;
    box.visible = false;
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

  if (tensileSprng) {

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

  var i, len, particles, particle, pt, constrains, constrain;

  if (applyWind) {

    windStrength = Math.cos(time / 7000) * 20 * 1000;
    windForce.set(
      Math.sin(time / 2000),
      Math.cos(time / 3000),
      Math.sin(time / 1000)
    ).normalize().multiplyScalar(windStrength);

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
    particle.integrate();
  }


  constrains = cloth.constrains,
    len = constrains.length;
  for (i = 0; i < len; i++) {
    constrain = constrains[i];

    applyConstrains(constrain[0], constrain[1], constrain[2]);
  }


  ball_prev.copy(spherePos);
  spherePos.y = 400/* *Math.sin(Date.now()/600); */
  spherePos.x = 0/* *Math.sin(Date.now()/600); */
  spherePos.z = 0/* *Math.cos(Date.now()/600); */
  sphere.position.copy(spherePos);



  for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {

    particle = particles[i];
    curPos = particle.pos;
    prevPos = particle.prev;

    if (sphere.visible) {

      diff.subVectors(curPos, spherePos);
      if (diff.length() < sphereSize) {


        diff.normalize().multiplyScalar(sphereSize);
        posNoFriction.copy(spherePos).add(diff);

        diff.subVectors(prevPos, spherePos);

        if (diff.length() > sphereSize) {

          diff.subVectors(spherePos, ball_prev);
          posFriction.copy(prevPos).add(diff);

          posNoFriction.multiplyScalar(1 - friction);
          posFriction.multiplyScalar(friction);
          curPos.copy(posFriction.add(posNoFriction));
        }
        else {
          curPos.copy(posNoFriction);
        }
      }
    }

    if (box.visible) {

      if (boundingBox.containsPoint(curPos)) {

        currentX = curPos.x;
        currentY = curPos.y;
        currentZ = curPos.z;

        if (currentX <= (minx + maxx) / 2) { nearestX = minx; }
        else { nearestX = maxx; }

        if (currentY <= (miny + maxy) / 2) { nearestY = miny; }
        else { nearestY = maxy; }

        if (currentZ <= (minz + maxz) / 2) { nearestZ = minz; }
        else { nearestZ = maxz; }

        xDist = Math.abs(nearestX - currentX);
        yDist = Math.abs(nearestY - currentY);
        zDist = Math.abs(nearestZ - currentZ);

        posNoFriction.copy(curPos);

        if (zDist <= xDist && zDist <= yDist) {
          posNoFriction.z = nearestZ;
        }
        else if (yDist <= xDist && yDist <= zDist) {
          posNoFriction.y = nearestY;
        }
        else if (xDist <= yDist && xDist <= zDist) {
          posNoFriction.x = nearestX;
        }

        if (!boundingBox.containsPoint(prevPos)) {
          posFriction.copy(prevPos);
          curPos.copy(posFriction.multiplyScalar(friction).add(posNoFriction.multiplyScalar(1 - friction)));
        }
        else {
          curPos.copy(posNoFriction);
        }
      }

    }


  }

  for (particles = cloth.particles, i = 0, il = particles.length
    ; i < il; i++) {
    particle = particles[i];
    pos = particle.pos;
    if (pos.y < - 249) { pos.y = - 249; }
  }

  if (pinched) {

    particles[cloth.index(x_div, 0)].lock();
    particles[cloth.index(0, 0)].lock();
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


  // Performs RK1 integration

  /*   this.temp = this.velocity.add(this.a.multiplyScalar(h))
   var newPos = this.pos.add(this.temp.multiplyScalar(h))
   newPos.multiplyScalar( DRAG_F/2 ).add( this.pos );
 
   this.temp = this.prev;
   this.prev = this.pos;
   this.pos = newPos;
 
   this.a.set( 0, 0, 0 ); 
  */

  // Performs RK2 integration
  /* --------------------------------------------------------------- */

 /*  var v1 = this.velocity.add(this.a.multiplyScalar(h * 0.5))
  var newPos1 = this.pos.add(v1.multiplyScalar(h * 0.5))
  newPos1.multiplyScalar(DRAG_F / 2).add(this.pos);

  this.a = v1.sub(this.velocity)
  this.a.add(
    this.temp_.copy(g).multiplyScalar(this.invMass)
  );

  var v2 = this.velocity.add(this.a.multiplyScalar(h))
  var newPos = this.pos.add(v2.multiplyScalar(h))
  newPos.multiplyScalar(DRAG_F / 2).add(newPos1);

  this.temp = this.prev;
  this.prev = this.pos;
  this.pos = newPos;

  this.a.set(0, 0, 0); */
  /* --------------------------------------------------------------- */

  /*  this.temp = this.velocity.add(this.a.multiplyScalar(h))
   var newPos = this.pos.add(this.temp.multiplyScalar(h))
   newPos.multiplyScalar( DRAG_F/2 ).add( this.pos );
 
   this.temp = this.prev;
   this.prev = this.pos;
   this.pos = newPos;
 
   this.a.set( 0, 0, 0 );  */

  /* --------------------------------------------------------------- */

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
