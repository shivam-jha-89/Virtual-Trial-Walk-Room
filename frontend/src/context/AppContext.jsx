import React, { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const DEFAULT_MEASUREMENTS = {
  heightCm: 170,
  chestCm: 92,
  waistCm: 80,
  hipCm: 96,
  shoulderWidthCm: 44,
  inseamCm: 78,
};

export function AppProvider({ children }) {
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState({
    bodyType: 'average',
    skinTone: '#e0ac69',
    gender: 'neutral',
  });

  const value = useMemo(
    () => ({
      measurements,
      setMeasurements,
      selectedGarment,
      setSelectedGarment,
      poseLandmarks,
      setPoseLandmarks,
      avatarConfig,
      setAvatarConfig,
    }),
    [measurements, selectedGarment, poseLandmarks, avatarConfig]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
