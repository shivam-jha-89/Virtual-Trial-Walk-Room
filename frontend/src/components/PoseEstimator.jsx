import React, { useEffect, useRef, useState } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { estimateMeasurementsFromPose } from '../services/poseService';
import { useAppContext } from '../context/AppContext';

export default function PoseEstimator() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const { measurements, setMeasurements, setPoseLandmarks } = useAppContext();
  const { landmarks, confidence, isReady, error, start, stop } = useMediaPipe(videoRef);

  useEffect(() => {
    setPoseLandmarks(landmarks);
  }, [landmarks, setPoseLandmarks]);

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      start();
    } catch (err) {
      setStreamError('Camera access denied or unavailable.');
    }
  };

  const disableCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    stop();
  };

  const applyEstimatedMeasurements = () => {
    if (!landmarks) return;
    const estimated = estimateMeasurementsFromPose(landmarks, measurements.heightCm);
    if (estimated) setMeasurements((prev) => ({ ...prev, ...estimated }));
  };

  return (
    <div className="pose-estimator">
      <div className="pose-estimator__video-wrap">
        <video ref={videoRef} muted playsInline className="pose-estimator__video" />
        {!cameraOn && <div className="pose-estimator__placeholder">Camera is off</div>}
      </div>

      <div className="pose-estimator__controls">
        {!cameraOn ? (
          <button onClick={enableCamera} disabled={!isReady}>
            {isReady ? 'Start Camera' : 'Loading pose model…'}
          </button>
        ) : (
          <button onClick={disableCamera}>Stop Camera</button>
        )}

        <button onClick={applyEstimatedMeasurements} disabled={!landmarks}>
          Use Detected Measurements
        </button>

        <span className="pose-estimator__confidence">
          Landmark confidence: {(confidence * 100).toFixed(0)}%
        </span>
      </div>

      {(error || streamError) && (
        <p className="pose-estimator__error">{error || streamError}</p>
      )}
    </div>
  );
}
