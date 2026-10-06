import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

export class ParticleRenderer {
  constructor(scene, count = 75000) {
    this.scene = scene;
    this.count = count;
    this.currentIndex = 0;
    this.models = ['TURBOFAN JET ENGINE', 'HUMAN HEART', 'DOUBLE HELIX DNA', 'SATURN RINGS', 'CYBER SKULL', 'BLACK HOLE'];
    this.colors = [0x00f0ff, 0xff0055, 0x00ff88, 0xffaa00, 0xbf00ff, 0xff4500];

    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.targetPositions = new Float32Array(this.count * 3);
    this.originalTargets = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count * 3; i++) {
      this.positions[i] = (Math.random() - 0.5) * 40;
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: this.colors[0],
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.generateTurbofan();
  }

  generateTurbofan() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      if (i < this.count * 0.4) {
        // Outer nacelle ring
        const theta = Math.random() * Math.PI * 2;
        const r = 3.5 + (Math.random() - 0.5) * 0.3;
        const z = (Math.random() - 0.5) * 4.0;
        this.originalTargets[idx] = Math.cos(theta) * r;
        this.originalTargets[idx + 1] = Math.sin(theta) * r;
        this.originalTargets[idx + 2] = z;
      } else if (i < this.count * 0.8) {
        // Fan blades (24 blades)
        const blade = Math.floor(Math.random() * 24);
        const bladeAngle = (blade / 24) * Math.PI * 2;
        const r = 0.8 + Math.random() * 2.6;
        const twist = (r / 2.6) * 0.6;
        this.originalTargets[idx] = Math.cos(bladeAngle + twist) * r;
        this.originalTargets[idx + 1] = Math.sin(bladeAngle + twist) * r;
        this.originalTargets[idx + 2] = (Math.random() - 0.5) * 0.4;
      } else {
        // Core spinner cone
        const z = Math.random() * 2.5 - 0.5;
        const r = Math.max(0.05, 0.9 * (1.0 - z / 2.0));
        const theta = Math.random() * Math.PI * 2;
        this.originalTargets[idx] = Math.cos(theta) * r;
        this.originalTargets[idx + 1] = Math.sin(theta) * r;
        this.originalTargets[idx + 2] = z + 1.0;
      }
      this.targetPositions[idx] = this.originalTargets[idx];
      this.targetPositions[idx + 1] = this.originalTargets[idx + 1];
      this.targetPositions[idx + 2] = this.originalTargets[idx + 2];
    }
  }

  generateHeart() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const t = Math.PI * (2 * Math.random() - 1);
      const u = Math.PI * (Math.random() - 0.5);
      const scale = 0.22;
      const x = scale * (16 * Math.pow(Math.sin(t), 3)) + (Math.random() - 0.5) * 0.3;
      const y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + (Math.random() - 0.5) * 0.3;
      const z = (Math.random() - 0.5) * 2.5;
      this.originalTargets[idx] = x;
      this.originalTargets[idx + 1] = y;
      this.originalTargets[idx + 2] = z;
      this.targetPositions[idx] = x;
      this.targetPositions[idx + 1] = y;
      this.targetPositions[idx + 2] = z;
    }
  }

  generateDNA() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const t = (i / this.count) * 24 * Math.PI;
      const r = 2.2;
      const strand = i % 2 === 0 ? 1 : -1;
      const isRung = Math.random() < 0.25;
      const rungPos = Math.random() * 2 - 1;

      this.originalTargets[idx] = isRung ? Math.cos(t) * r * rungPos : Math.cos(t) * r * strand + (Math.random() - 0.5) * 0.2;
      this.originalTargets[idx + 1] = (i / this.count) * 12 - 6;
      this.originalTargets[idx + 2] = isRung ? Math.sin(t) * r * rungPos : Math.sin(t) * r * strand + (Math.random() - 0.5) * 0.2;

      this.targetPositions[idx] = this.originalTargets[idx];
      this.targetPositions[idx + 1] = this.originalTargets[idx + 1];
      this.targetPositions[idx + 2] = this.originalTargets[idx + 2];
    }
  }

  generateSaturn() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      if (i < this.count * 0.35) {
        // Planet Sphere
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 1.8;
        this.originalTargets[idx] = r * Math.sin(phi) * Math.cos(theta);
        this.originalTargets[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
        this.originalTargets[idx + 2] = r * Math.cos(phi);
      } else {
        // Flat Ring with Tilt
        const theta = Math.random() * Math.PI * 2;
        const r = 2.6 + Math.random() * 3.2;
        const x = Math.cos(theta) * r;
        const y = (Math.random() - 0.5) * 0.15;
        const z = Math.sin(theta) * r;
        // Tilt 27 degrees
        const cosT = Math.cos(0.47);
        const sinT = Math.sin(0.47);
        this.originalTargets[idx] = x;
        this.originalTargets[idx + 1] = y * cosT - z * sinT;
        this.originalTargets[idx + 2] = y * sinT + z * cosT;
      }
      this.targetPositions[idx] = this.originalTargets[idx];
      this.targetPositions[idx + 1] = this.originalTargets[idx + 1];
      this.targetPositions[idx + 2] = this.originalTargets[idx + 2];
    }
  }

  generateSkull() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      let r = 2.4;
      let y = Math.sin(v) * r;
      let x = Math.cos(v) * Math.cos(u) * (r * 0.85);
      let z = Math.cos(v) * Math.sin(u) * (r * 0.95);

      if (y < -0.3) {
        // Jaw taper
        x *= 0.65;
        z *= 0.75;
      }
      this.originalTargets[idx] = x + (Math.random() - 0.5) * 0.15;
      this.originalTargets[idx + 1] = y;
      this.originalTargets[idx + 2] = z + (Math.random() - 0.5) * 0.15;

      this.targetPositions[idx] = this.originalTargets[idx];
      this.targetPositions[idx + 1] = this.originalTargets[idx + 1];
      this.targetPositions[idx + 2] = this.originalTargets[idx + 2];
    }
  }

  generateBlackHole() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const spiral = (i / this.count) * 16 * Math.PI;
      const r = Math.pow(Math.random(), 2.0) * 5.0 + 0.6;
      const x = Math.cos(spiral + r * 2.0) * r;
      const z = Math.sin(spiral + r * 2.0) * r;
      const y = (Math.random() - 0.5) * (0.8 / (r * 0.6));

      this.originalTargets[idx] = x;
      this.originalTargets[idx + 1] = y;
      this.originalTargets[idx + 2] = z;

      this.targetPositions[idx] = x;
      this.targetPositions[idx + 1] = y;
      this.targetPositions[idx + 2] = z;
    }
  }

  setModel(index) {
    this.currentIndex = ((index % this.models.length) + this.models.length) % this.models.length;
    this.material.color.setHex(this.colors[this.currentIndex]);

    switch (this.currentIndex) {
      case 0: this.generateTurbofan(); break;
      case 1: this.generateHeart(); break;
      case 2: this.generateDNA(); break;
      case 3: this.generateSaturn(); break;
      case 4: this.generateSkull(); break;
      case 5: this.generateBlackHole(); break;
    }

    // Force sudden outward burst before smoothly reforming
    for (let i = 0; i < this.count * 3; i++) {
      this.targetPositions[i] = this.originalTargets[i];
      const p = this.geometry.attributes.position.array;
      p[i] += (Math.random() - 0.5) * 4.0;
    }

    const titleEl = document.querySelector('[class*="model"] h1, [class*="model"] h2, #model-title, [id*="model"]');
    if (titleEl) titleEl.innerText = this.models[this.currentIndex];

    return this.models[this.currentIndex];
  }

  nextModel() { return this.setModel(this.currentIndex + 1); }
  prevModel() { return this.setModel(this.currentIndex - 1); }

  assemble() {
    for (let i = 0; i < this.count * 3; i++) {
      this.targetPositions[i] = this.originalTargets[i];
    }
  }

  explode() {
    for (let i = 0; i < this.count * 3; i++) {
      this.targetPositions[i] = this.originalTargets[i] * 3.8 + (Math.random() - 0.5) * 3;
    }
  }

  update() {
    const pos = this.geometry.attributes.position.array;
    for (let i = 0; i < this.count * 3; i++) {
      pos[i] += (this.targetPositions[i] - pos[i]) * 0.08;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
