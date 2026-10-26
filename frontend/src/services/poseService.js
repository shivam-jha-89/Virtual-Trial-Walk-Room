/**
 * Converts MediaPipe Pose landmarks (normalized 0-1 image coordinates) into
 * approximate body measurement ratios, and smooths noisy per-frame landmark
 * data with an exponential moving average before it drives the avatar mesh.
 *
 * Landmark indices follow the MediaPipe Pose model's 33-point topology:
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */

export const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  NOSE: 0,
};

const EMA_ALPHA = 0.35; // smoothing factor: higher = more responsive, lower = smoother
let smoothedLandmarks = null;

const distance = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z ?? 0) - (b.z ?? 0)) ** 2);

/** Exponential moving average smoothing across frames to reduce jitter. */
export function smoothLandmarks(rawLandmarks) {
  if (!rawLandmarks) return smoothedLandmarks;

  if (!smoothedLandmarks) {
    smoothedLandmarks = rawLandmarks;
    return smoothedLandmarks;
  }

  smoothedLandmarks = rawLandmarks.map((point, i) => {
    const prev = smoothedLandmarks[i];
    return {
      x: prev.x + EMA_ALPHA * (point.x - prev.x),
      y: prev.y + EMA_ALPHA * (point.y - prev.y),
      z: (prev.z ?? 0) + EMA_ALPHA * ((point.z ?? 0) - (prev.z ?? 0)),
      visibility: point.visibility,
    };
  });

  return smoothedLandmarks;
}

export function resetSmoothing() {
  smoothedLandmarks = null;
}

/**
 * Estimates the fraction of the 33 tracked landmarks that MediaPipe reports
 * with high confidence — used to surface a "detection accuracy" indicator.
 */
export function computeLandmarkConfidence(landmarks, threshold = 0.5) {
  if (!landmarks?.length) return 0;
  const confident = landmarks.filter((l) => (l.visibility ?? 1) >= threshold).length;
  return confident / landmarks.length;
}

/**
 * Derives normalized body-measurement ratios from landmark positions.
 * These ratios (not absolute cm) are combined with the user's known height
 * to approximate real-world measurements, then used by AvatarBuilder to
 * morph the 3D mesh and by TextureMapper to align garments to the body.
 */
export function estimateMeasurementsFromPose(landmarks, knownHeightCm) {
  if (!landmarks?.length) return null;
  const L = POSE_LANDMARKS;

  const shoulderWidthRatio = distance(landmarks[L.LEFT_SHOULDER], landmarks[L.RIGHT_SHOULDER]);
  const hipWidthRatio = distance(landmarks[L.LEFT_HIP], landmarks[L.RIGHT_HIP]);
  const torsoLengthRatio = distance(
    midpoint(landmarks[L.LEFT_SHOULDER], landmarks[L.RIGHT_SHOULDER]),
    midpoint(landmarks[L.LEFT_HIP], landmarks[L.RIGHT_HIP])
  );
  const legLengthRatio =
    distance(landmarks[L.LEFT_HIP], landmarks[L.LEFT_KNEE]) +
    distance(landmarks[L.LEFT_KNEE], landmarks[L.LEFT_ANKLE]);
  const fullBodyRatio = distance(landmarks[L.NOSE], midpoint(landmarks[L.LEFT_ANKLE], landmarks[L.RIGHT_ANKLE]));

  // Scale normalized ratios against the user's known height to get cm estimates.
  const pxToCm = fullBodyRatio > 0 ? knownHeightCm / fullBodyRatio : 0;

  return {
    heightCm: knownHeightCm,
    shoulderWidthCm: round1(shoulderWidthRatio * pxToCm),
    hipCm: round1(hipWidthRatio * pxToCm * 2.6), // circumference approximation factor
    chestCm: round1(shoulderWidthRatio * pxToCm * 2.35),
    waistCm: round1(hipWidthRatio * pxToCm * 2.3),
    inseamCm: round1(legLengthRatio * pxToCm),
    source: 'pose-estimation',
  };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z ?? 0) + (b.z ?? 0)) / 2 };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
