import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { HandTracker } from './vision/handTracker.js';
import { GestureEngine } from './vision/gestureEngine.js';
import { ParticleRenderer } from './renderer/particles.js';

let scene, camera, webglRenderer, particleRenderer, tracker, engine;
let lastFrameTime = performance.now();
let frames = 0;

const ui = {
  gestureTag: document.getElementById('current-gesture'),
  fps: document.getElementById('fps'),
  statusMsg: document.getElementById('status-message'),
  modelName: document.getElementById('model-name'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next')
};

async function init() {
  console.log("[WonderSnap] Initializing Three.js Environment...");
  
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;
  
  webglRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  webglRenderer.setSize(window.innerWidth, window.innerHeight);
  webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(webglRenderer.domElement);
  
  particleRenderer = new ParticleRenderer(scene, 80000);
  console.log("[WonderSnap] ParticleRenderer initialized.");
  
  engine = new GestureEngine();
  tracker = new HandTracker();

  console.log("[WonderSnap] Starting HandTracker initialization in background...");
  tracker.initialize((status) => {
    ui.statusMsg.textContent = status;
  }).catch((err) => {
    console.error("[WonderSnap] Error during initialization:", err);
    ui.statusMsg.textContent = "VISION INITIALIZATION ERROR";
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerText = "Vision System Error: " + err.message;
    }
  });

  ui.btnNext.addEventListener('click', () => particleRenderer.nextModel());
  ui.btnPrev.addEventListener('click', () => particleRenderer.prevModel());

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f') {
      particleRenderer.assemble();
      ui.gestureTag.textContent = "FIST (KEYBOARD)";
    }
    if (e.key.toLowerCase() === 'o') {
      particleRenderer.explode();
      ui.gestureTag.textContent = "OPEN HAND (KEYBOARD)";
    }
    if (e.key.toLowerCase() === 'n') {
      particleRenderer.nextModel();
    }
    if (e.key >= '1' && e.key <= '6') {
      particleRenderer.setModel(parseInt(e.key) - 1);
    }
  });
  // Add Record Button dynamically
  const recordBtn = document.createElement('button');
  recordBtn.className = 'cyber-button';
  recordBtn.innerText = '🔴 RECORD DEMO';
  recordBtn.style.marginLeft = '10px';
  document.querySelector('.hud-footer').appendChild(recordBtn);
  
  let mediaRecorder;
  let recordedChunks = [];
  
  recordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') return;
    
    recordBtn.innerText = '⏺ RECORDING (15s)...';
    recordBtn.style.color = '#ff0033';
    
    const stream = webglRenderer.domElement.captureStream(60);
    let options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 50000000 };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
       options = { mimeType: 'video/webm', videoBitsPerSecond: 50000000 };
    }
    
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'wondersnap_demo.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      recordBtn.innerText = '🔴 RECORD DEMO';
      recordBtn.style.color = '';
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 15000);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  console.log("[WonderSnap] Starting animation loop immediately.");
  animate();
}



function animate() {
  requestAnimationFrame(animate);
  
  const lms = tracker.detectLandmarks();
  if (lms && lms.length > 0) {
    const lm = lms[0];
    const wrist = lm[0];
    // Calculate Euclidean distance for Index Tip and MCP
    const dTip = Math.hypot(lm[8].x - wrist.x, lm[8].y - wrist.y);
    const dMcp = Math.hypot(lm[5].x - wrist.x, lm[5].y - wrist.y);

    // Apply strict Hysteresis to prevent flickering/stuttering
    if (dTip < dMcp * 0.85) {
      window.lastStableGesture = "FIST";
    } else if (dTip > dMcp * 1.4) {
      window.lastStableGesture = "OPEN_HAND";
    }

    if (window.lastStableGesture === "FIST") {
      particleRenderer.assemble();
      document.querySelector("[id*='gesture'], [class*='gesture']").innerText = "GESTURE: FIST";
    } else if (window.lastStableGesture === "OPEN_HAND") {
      particleRenderer.explode();
      document.querySelector("[id*='gesture'], [class*='gesture']").innerText = "GESTURE: OPEN HAND";
    }
  } else {
    window.lastStableGesture = "NONE";
    document.querySelector("[id*='gesture'], [class*='gesture']").innerText = "WAITING FOR HANDS...";
  }

  // Update particles
  particleRenderer.update();
  
  // Idle rotation
  particleRenderer.mesh.rotation.y += 0.002;
  particleRenderer.mesh.rotation.x += 0.001;
  
  // Render scene
  webglRenderer.render(scene, camera);

  const now = performance.now();
  frames++;
  if (now > lastFrameTime + 1000) {
    ui.fps.textContent = Math.round((frames * 1000) / (now - lastFrameTime));
    frames = 0;
    lastFrameTime = now;
  }
}

window.addEventListener('DOMContentLoaded', init);
