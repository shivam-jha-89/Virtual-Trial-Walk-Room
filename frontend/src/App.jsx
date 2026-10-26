import React from 'react';
import AvatarCanvas from './components/AvatarCanvas';
import PoseEstimator from './components/PoseEstimator';
import GarmentSelector from './components/GarmentSelector';
import MeasurementForm from './components/MeasurementForm';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Virtual Trial Walk Room</h1>
        <p>Real-time 3D try-on, driven by your body measurements &amp; live pose tracking.</p>
      </header>

      <main className="app__main">
        <section className="app__panel app__panel--left">
          <h2>Body Measurements</h2>
          <MeasurementForm />
          <h2>Live Pose Capture</h2>
          <PoseEstimator />
        </section>

        <section className="app__panel app__panel--center">
          <AvatarCanvas />
        </section>

        <section className="app__panel app__panel--right">
          <h2>Garment Catalog</h2>
          <GarmentSelector />
        </section>
      </main>
    </div>
  );
}
