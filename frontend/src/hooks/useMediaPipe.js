import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { smoothLandmarks, computeLandmarkConfidence } from '../services/poseService';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm';

/**
 * Initializes MediaPipe's PoseLandmarker and runs real-time inference on a
 * <video> element, streaming smoothed landmarks + a confidence score back
 * to the caller on every animation frame.
 */
export function useMediaPipe(videoRef) {
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const [landmarks, setLandmarks] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) return;
        landmarkerRef.current = landmarker;
        setIsReady(true);
      } catch (err) {
        setError(err.message || 'Failed to load MediaPipe pose model');
      }
    };

    init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const predictLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (video && landmarker && video.readyState >= 2) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        const raw = result?.landmarks?.[0];
        if (raw) {
          const smoothed = smoothLandmarks(raw);
          setLandmarks(smoothed);
          setConfidence(computeLandmarkConfidence(smoothed));
        }
      }
    }
    rafRef.current = requestAnimationFrame(predictLoop);
  }, [videoRef]);

  const start = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(predictLoop);
    }
  }, [predictLoop]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { landmarks, confidence, isReady, error, start, stop };
}
