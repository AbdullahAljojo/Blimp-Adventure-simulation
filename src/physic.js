import * as THREE from "three";

class physic {
   constructor(parameters) {
      this.parameters = parameters;
      this.v = new THREE.Vector3(0, 0, 0);
      this.T = 273;
      this.V = 4 / 3 * Math.PI * 10 * 10 * 10;
      this.PressureInside = 101300;
      this.A = Math.PI * 10 ** 2;
      this.output = document.getElementsByClassName("out")[0];
   }

   resetOutput() {
      this.output.innerHTML = "";

      this.output.innerHTML += "<br>T = " + this.T;
      this.output.innerHTML += "<br>V = " + this.V;
      this.output.innerHTML += "<br>PressureInside = " + this.PressureInside;
      this.output.innerHTML += "<br>A = " + this.A;
   }

   calcW() {
      const P = this.PressureInside;
      const V = this.V;
      const M = 0.03;
      const R = 8.31;
      const T = this.T;

      if ((R * T) == 0) return new THREE.Vector3(0, 0, 0);

      const m = (P * V * M) / (R * T) + this.parameters.luggageMass;
      const g = this.parameters.g;

      const W = new THREE.Vector3(0, 0, 0);

      W.x = 0;
      W.y = -m * g;
      W.z = 0;

      return W;
   }

   calcFair() {
      const k = 0.1;
      const p = this.parameters.p;
      const A = this.A;

      const Fair = new THREE.Vector3(0, 0, 0);
      const direction = this.v.clone().normalize().negate();
      const vv = this.v.length() * this.v.length();

      if (vv == 0) return new THREE.Vector3(0, 0, 0);

      Fair.x = direction.x * 1 / 2 * k * p * vv * A;
      Fair.y = direction.y * 1 / 2 * k * p * vv * A;
      Fair.z = direction.z * 1 / 2 * k * p * vv * A;

      return Fair;
   }

   calcFb() {
      const p = this.parameters.p;
      const v = this.V;
      const g = this.parameters.g;

      const Fb = new THREE.Vector3(0, 0, 0);

      Fb.x = 0;
      Fb.y = +p * v * g;
      Fb.z = 0;

      return Fb;
   }

   calcFwind() {
      const w = new THREE.Vector3(
         this.parameters.vx,
         0,
         this.parameters.vz
      );
      const p = this.parameters.p;
      const A = this.A;

      const Fwind = new THREE.Vector3(0, 0, 0);
      const windV = w.length() * w.length();
      const windDir = w.clone().normalize();

      if (windV == 0) return new THREE.Vector3(0, 0, 0);

      Fwind.x = windDir.x * 1 / 2 * p * windV * A;
      Fwind.y = 0;
      Fwind.z = windDir.z * 1 / 2 * p * windV * A;

      return Fwind;
   }

   calcFp() {
      const h = new THREE.Vector3(
         this.parameters.Sx,
         0,
         this.parameters.Sz
      );
      const P0 = this.PressureInside;
      const P1 = this.parameters.PressureOutside;
      const S = this.parameters.S;

      if (S == 0) return new THREE.Vector3(0, 0, 0);

      const Fp = new THREE.Vector3(0, 0, 0);

      Fp.x = -h.x * (P0 - P1) / S;
      Fp.y = 0;
      Fp.z = -h.z * (P0 - P1) / S;

      return Fp;
   }

   calcFf() {
      const W = this.calcW();
      const Fair = this.calcFair();
      const Fb = this.calcFb();
      const Fwind = this.calcFwind();
      const Fp = this.calcFp();

      const u = W.y + Fair.y + Fb.y + Fwind.y + Fp.y;

      const Ff = new THREE.Vector3(0, 0, 0);

      Ff.x = 0;
      Ff.y = +u;
      Ff.z = 0;

      return Ff;
   }

   calcSum(baloon) {
      this.resetOutput();

      const W = this.calcW();
      this.output.innerHTML += "<br/>W = " + W.length();

      const Fair = this.calcFair();
      this.output.innerHTML += "<br/>Fair = " + Fair.length();

      const Fb = this.calcFb();
      this.output.innerHTML += "<br/>Fb = " + Fb.length();

      const Fwind = this.calcFwind();
      this.output.innerHTML += "<br/>Fwind = " + Fwind.length();

      const Fp = this.calcFp();
      this.output.innerHTML += "<br/>Fp = " + Fp.length();

      const Ff = this.calcFf();
      this.output.innerHTML += "<br/>Ff = " + Ff.length();

      const Sum = new THREE.Vector3(0, 0, 0);

      Sum.x = W.x + Fair.x + Fb.x + Fwind.x + Fp.x + ((baloon.position.y <= 0) ? Ff.x : 0);
      Sum.y = W.y + Fair.y + Fb.y + Fwind.y + Fp.y + ((baloon.position.y <= 0) ? Ff.y : 0);
      Sum.z = W.z + Fair.z + Fb.z + Fwind.z + Fp.z + ((baloon.position.y <= 0) ? Ff.z : 0);

      return Sum;
   }

   calcA(baloon) {
      const P = this.PressureInside;
      const V = this.V;
      const M = 7.14;
      const R = 8.31;
      const T = this.T;

      if ((R * T) == 0) return new THREE.Vector3(0, 0, 0);

      const m = (P * V * M) / (R * T) + this.parameters.luggageMass;
      const Sum = this.calcSum(baloon);
      this.output.innerHTML += "<br/>Sum = " + Sum.length();

      const a = new THREE.Vector3(0, 0, 0);

      if (m == 0) return new THREE.Vector3(0, 0, 0);

      a.x = Sum.x / m;
      a.y = Sum.y / m;
      a.z = Sum.z / m;

      if (baloon.position.y <= 0 && a.y < 0)
         a.y = 0;

      return a;
   }

   calcV(deltaTime, baloon) {
      const a = this.calcA(baloon);
      this.output.innerHTML += "<br/>a = " + a.length();

      const v = new THREE.Vector3(0, 0, 0);

      v.x = a.x * deltaTime + this.v.x;
      v.y = a.y * deltaTime + this.v.y;
      v.z = a.z * deltaTime + this.v.z;

      if (baloon.position.y <= 0 && v.y < 0)
         v.y = 0;

      this.v = v.clone();

      return v;
   }

   calcMove(deltaTime, baloon) {
      const v = this.calcV(deltaTime, baloon);
      this.output.innerHTML += "<br/>v = " + v.length();

      const Move = new THREE.Vector3(0, 0, 0);

      Move.x = v.x * deltaTime;
      Move.y = v.y * deltaTime;
      Move.z = v.z * deltaTime;

      return Move;
   }

   update(baloon, camera, deltaTime) {
      const Move = this.calcMove(deltaTime, baloon);
      this.output.innerHTML += "<br/>Move = " + Move.length();

      baloon.position.x += Move.x;
      baloon.position.y += Move.y;
      baloon.position.z += Move.z;

      camera.position.x += Move.x;
      camera.position.y += Move.y;
      camera.position.z += Move.z;

      if (baloon.position.y <= 0) {
         baloon.position.y = 0;
         camera.position.y -= Move.y;
      }
   }
};

export default physic;