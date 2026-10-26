import React from 'react';
import { useAppContext } from '../context/AppContext';
import { updateMeasurements as saveMeasurements } from '../services/api';

const FIELDS = [
  { key: 'heightCm', label: 'Height (cm)', min: 120, max: 220 },
  { key: 'chestCm', label: 'Chest (cm)', min: 60, max: 160 },
  { key: 'waistCm', label: 'Waist (cm)', min: 50, max: 160 },
  { key: 'hipCm', label: 'Hip (cm)', min: 60, max: 170 },
  { key: 'shoulderWidthCm', label: 'Shoulder Width (cm)', min: 30, max: 60 },
  { key: 'inseamCm', label: 'Inseam (cm)', min: 50, max: 110 },
];

export default function MeasurementForm() {
  const { measurements, setMeasurements } = useAppContext();

  const handleChange = (key, value) => {
    setMeasurements((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    try {
      await saveMeasurements({ ...measurements, source: 'manual' });
    } catch {
      // Non-fatal for the demo — avatar still updates locally without a backend.
    }
  };

  return (
    <form
      className="measurement-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      {FIELDS.map(({ key, label, min, max }) => (
        <label key={key} className="measurement-form__field">
          <span>
            {label}: {measurements[key]}
          </span>
          <input
            type="range"
            min={min}
            max={max}
            value={measurements[key]}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </label>
      ))}
      <button type="submit">Save Measurements</button>
    </form>
  );
}
