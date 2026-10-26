import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { AvatarBuilder } from '../three/AvatarBuilder';
import { TextureMapper } from '../three/TextureMapper';
import { useAppContext } from '../context/AppContext';

function AvatarRig() {
  const { scene } = useThree();
  const { measurements, selectedGarment, avatarConfig } = useAppContext();

  const builder = useMemo(() => new AvatarBuilder({ skinTone: avatarConfig.skinTone }), []);
  const mapper = useMemo(() => new TextureMapper(builder.group), [builder]);
  const addedRef = useRef(false);

  useEffect(() => {
    if (!addedRef.current) {
      scene.add(builder.group);
      addedRef.current = true;
    }
    return () => {
      scene.remove(builder.group);
      builder.dispose();
      mapper.dispose();
    };
  }, [scene, builder, mapper]);

  useEffect(() => {
    builder.setSkinTone(avatarConfig.skinTone);
  }, [builder, avatarConfig.skinTone]);

  useEffect(() => {
    builder.update(measurements);
  }, [builder, measurements]);

  useEffect(() => {
    mapper.applyGarment(selectedGarment, measurements);
  }, [mapper, selectedGarment, measurements]);

  // Gentle idle rotation for a "turntable" feel
  useFrame((_, delta) => {
    builder.group.rotation.y += delta * 0.15;
  });

  return null;
}

export default function AvatarCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <Canvas shadows camera={{ position: [0, 1.1, 2.6], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <AvatarRig />
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          target={[0, 0.9, 0]}
        />
      </Canvas>
    </div>
  );
}
