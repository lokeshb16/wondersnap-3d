export class HandTracker {
  constructor(videoElement) {
    this.video = videoElement || document.getElementById("webcam");
    this.latestLandmarks = null;
  }

  async initialize(onStatusChange) {
    if (onStatusChange) onStatusChange("LOADING VISION MODEL...");
    console.log("[HandTracker] Setting up MediaPipe Hands with standard WASM...");

    const hands = new window.Hands({
      locateFile: (file) => {
        // Bypass broken SIMD builds by loading the official CDN build directly
        // Explicitly replace simd with standard if the file requests it (MediaPipe sometimes asks for simd despite options)
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file.replace('_simd', '')}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        this.latestLandmarks = results.multiHandLandmarks;
        console.log("Hand active! X:", results.multiHandLandmarks[0][0].x.toFixed(2));
      } else {
        this.latestLandmarks = null;
      }
    });

    if (onStatusChange) onStatusChange("REQUESTING WEBCAM...");

    const camera = new window.Camera(this.video, {
      onFrame: async () => {
        try {
          if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            await hands.send({ image: this.video });
          }
        } catch (e) {
          console.error("hands.send error:", e);
        }
      },
      width: 640,
      height: 480
    });

    await camera.start();
    console.log("[HandTracker] HandLandmarker engine successfully bound!");
    if (onStatusChange) onStatusChange("READY");
  }

  detectLandmarks() {
    return this.latestLandmarks;
  }
}
