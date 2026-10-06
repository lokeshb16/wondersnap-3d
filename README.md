# ⚡ WonderSnap 3D

> Real-time, interactive 3D particle simulation driven by in-browser computer vision and hand gestures.

![Tech Stack](https://img.shields.io/badge/Three.js-r136-black?style=for-the-badge&logo=three.js)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-blue?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![WebGL](https://img.shields.io/badge/WebGL-Hardware%20Accelerated-darkred?style=for-the-badge)

WonderSnap is a high-performance spatial computing experiment running inside the browser. It simulates over **75,000+ dynamic particles** morphing across procedural mathematical models, fully modulated by 21-point client-side hand tracking with sub-15ms latency.

---

## 🚀 Features

- **Client-Side Hand Landmark Detection:** Powered by Google MediaPipe WebAssembly pipelines for zero-latency 3D hand tracking directly via the webcam.
- **75,000+ Dynamic Point Cloud:** Pure WebGL point-cloud rendering using `Three.js` additive blending and typed array optimizations (`Float32Array`).
- **6 Procedural Mathematical Models:**
  1. Turbofan Jet Engine (Engine nacelle, rotating fan blades, core cone)
  2. Anatomical Human Heart
  3. Double Helix DNA Strand with base-pair rungs
  4. Saturn with tilted ring accretion
  5. Cyber Skull
  6. Black Hole Accretion Disk Singularity
- **Intuitive Gesture Interaction:**
  - **Fist:** Snaps particles into the tightly assembled 3D model.
  - **Open Hand:** Triggers a high-velocity particle explosion outward.
  - **Wrist Rotation:** Real-time 3D rotation tracking the orientation of your hand.
- **Keyboard & UI Controls:** Instant morphing between models using keys `1`–`6` or `N`/`P`.

---

## 🛠️ Tech Stack

- **Graphics & Rendering:** Three.js, WebGL
- **Computer Vision:** MediaPipe HandLandmarker (WASM)
- **Physics & Transitions:** Custom Linear Interpolation (LERP) on Float32 buffers
- **Frontend:** Vanilla JavaScript (ES Modules), HTML5, CSS3

---

## 🎮 Controls & Gestures

| Gesture / Key | Action |
|---|---|
| **Fist** | Assemble Model |
| **Open Hand** | Explode Particles Outward |
| **Wrist Twist** | Rotate 3D Model in Space |
| **Keys `1` – `6`** | Jump directly to Preset 1–6 |
| **Key `N` / Next Button** | Switch to Next 3D Model |
| **Key `P` / Prev Button** | Switch to Previous 3D Model |

---

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/lokeshb16/wondersnap-3d.git](https://github.com/lokeshb16/wondersnap-3d.git)
   cd wondersnap-3d
