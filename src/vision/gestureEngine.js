export class GestureEngine {
  constructor() {
    this.smoothedLandmarks = [];
    this.smoothingFactor = 0.3; // Exponential Moving Average
  }

  distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  }

  smooth(newLandmarks) {
    if (this.smoothedLandmarks.length !== newLandmarks.length) {
      this.smoothedLandmarks = JSON.parse(JSON.stringify(newLandmarks));
      return this.smoothedLandmarks;
    }

    for (let h = 0; h < newLandmarks.length; h++) {
      for (let i = 0; i < newLandmarks[h].length; i++) {
        this.smoothedLandmarks[h][i].x += (newLandmarks[h][i].x - this.smoothedLandmarks[h][i].x) * this.smoothingFactor;
        this.smoothedLandmarks[h][i].y += (newLandmarks[h][i].y - this.smoothedLandmarks[h][i].y) * this.smoothingFactor;
        this.smoothedLandmarks[h][i].z += (newLandmarks[h][i].z - this.smoothedLandmarks[h][i].z) * this.smoothingFactor;
      }
    }
    return this.smoothedLandmarks;
  }

  detect(rawLandmarks) {
    if (!rawLandmarks || rawLandmarks.length === 0) return { gesture: "NONE", details: {} };
    
    const landmarks = this.smooth(rawLandmarks);
    const handsCount = landmarks.length;
    
    let primaryHand = landmarks[0];
    
    // TWO_HAND_ZOOM check
    if (handsCount === 2) {
      const wrist1 = landmarks[0][0];
      const wrist2 = landmarks[1][0];
      const dist = this.distance(wrist1, wrist2);
      return { gesture: "TWO_HAND_ZOOM", details: { zoomDistance: dist } };
    }

    // Heuristics for single hand
    const thumbTip = primaryHand[4];
    const indexTip = primaryHand[8];
    const middleTip = primaryHand[12];
    const ringTip = primaryHand[16];
    const pinkyTip = primaryHand[20];
    
    const wrist = primaryHand[0];
    
    const pinchDist = this.distance(thumbTip, indexTip);
    
    const indexDist = this.distance(indexTip, wrist);
    const middleDist = this.distance(middleTip, wrist);
    const ringDist = this.distance(ringTip, wrist);
    const pinkyDist = this.distance(pinkyTip, wrist);
    
    const avgExt = (indexDist + middleDist + ringDist + pinkyDist) / 4.0;
    
    if (pinchDist < 0.04) {
      return { gesture: "PINCH", details: { pinchCenter: { x: (thumbTip.x + indexTip.x)/2, y: (thumbTip.y + indexTip.y)/2 } } };
    }
    
    if (avgExt < 0.25) {
      return { gesture: "FIST", details: {} };
    }
    
    if (avgExt > 0.45) {
      return { gesture: "OPEN_HAND", details: {} };
    }
    
    // WRIST_TWIST / ROTATION - basic approximation using index mcp to pinky mcp angle
    const indexMcp = primaryHand[5];
    const pinkyMcp = primaryHand[17];
    const rotZ = Math.atan2(pinkyMcp.y - indexMcp.y, pinkyMcp.x - indexMcp.x);
    
    return { gesture: "WRIST_TWIST", details: { rotation: rotZ } };
  }
}
