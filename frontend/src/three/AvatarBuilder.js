import * as THREE from 'three';

/**
 * Builds a parametric low/mid-poly humanoid avatar from body measurements.
 * Rather than deforming a fixed skinned mesh (which would require a full
 * rigged asset pipeline), this builder composes primitive segments whose
 * dimensions are directly derived from measurement inputs — giving a fast,
 * dependency-free way to visualize body shape changes in real time.
 *
 * Segments: head, torso, hips, upper/lower arms, upper/lower legs.
 * All segments are added to a single THREE.Group so the whole avatar can be
 * rotated/scaled together, and individual parts can be swapped when
 * measurements update.
 */
export class AvatarBuilder {
  constructor({ skinTone = '#e0ac69' } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'avatar';
    this.material = new THREE.MeshStandardMaterial({
      color: skinTone,
      roughness: 0.6,
      metalness: 0.05,
    });
    this.parts = {};
    this._buildSkeletonPlaceholders();
  }

  _buildSkeletonPlaceholders() {
    const names = [
      'head',
      'torso',
      'hips',
      'leftUpperArm',
      'rightUpperArm',
      'leftLowerArm',
      'rightLowerArm',
      'leftUpperLeg',
      'rightUpperLeg',
      'leftLowerLeg',
      'rightLowerLeg',
    ];
    names.forEach((n) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), this.material);
      mesh.name = n;
      mesh.castShadow = true;
      this.parts[n] = mesh;
      this.group.add(mesh);
    });
  }

  setSkinTone(hex) {
    this.material.color.set(hex);
  }

  /**
   * Rebuilds mesh geometry/positions from a measurements object:
   * { heightCm, chestCm, waistCm, hipCm, shoulderWidthCm, inseamCm }
   */
  update(measurements) {
    const m = normalize(measurements);

    // Scale factor: convert cm to Three.js scene units (1 unit = 1 meter)
    const cm = (v) => v / 100;

    const shoulderWidth = cm(m.shoulderWidthCm);
    const chestRadius = cm(m.chestCm) / (2 * Math.PI);
    const waistRadius = cm(m.waistCm) / (2 * Math.PI);
    const hipRadius = cm(m.hipCm) / (2 * Math.PI);
    const legLength = cm(m.inseamCm);
    const totalHeight = cm(m.heightCm);
    const torsoLength = Math.max(totalHeight - legLength - 0.28, 0.3);
    const headRadius = 0.11;

    // --- Head ---
    this._setGeometry('head', new THREE.SphereGeometry(headRadius, 20, 20));
    this.parts.head.position.set(0, legLength + torsoLength + headRadius, 0);

    // --- Torso (tapered cylinder chest -> waist) ---
    this._setGeometry(
      'torso',
      new THREE.CylinderGeometry(chestRadius, waistRadius, torsoLength * 0.62, 16)
    );
    this.parts.torso.position.set(0, legLength + torsoLength * 0.69, 0);

    // --- Hips ---
    this._setGeometry('hips', new THREE.CylinderGeometry(waistRadius, hipRadius, torsoLength * 0.38, 16));
    this.parts.hips.position.set(0, legLength + torsoLength * 0.19, 0);

    // --- Arms ---
    const armLength = torsoLength * 0.95;
    const armRadius = 0.045;
    ['left', 'right'].forEach((side) => {
      const sign = side === 'left' ? -1 : 1;
      const upperArm = this.parts[`${side}UpperArm`];
      const lowerArm = this.parts[`${side}LowerArm`];

      this._setGeometry(
        `${side}UpperArm`,
        new THREE.CapsuleGeometry(armRadius, armLength * 0.5, 4, 8)
      );
      upperArm.position.set(
        sign * (shoulderWidth / 2 + armRadius),
        legLength + torsoLength * 0.95 - armLength * 0.25,
        0
      );

      this._setGeometry(
        `${side}LowerArm`,
        new THREE.CapsuleGeometry(armRadius * 0.85, armLength * 0.5, 4, 8)
      );
      lowerArm.position.set(
        sign * (shoulderWidth / 2 + armRadius),
        legLength + torsoLength * 0.95 - armLength * 0.75,
        0
      );
    });

    // --- Legs ---
    const legRadius = hipRadius * 0.55;
    ['left', 'right'].forEach((side) => {
      const sign = side === 'left' ? -1 : 1;
      this._setGeometry(
        `${side}UpperLeg`,
        new THREE.CapsuleGeometry(legRadius, legLength * 0.5, 4, 8)
      );
      this.parts[`${side}UpperLeg`].position.set(sign * hipRadius * 0.5, legLength * 0.75, 0);

      this._setGeometry(
        `${side}LowerLeg`,
        new THREE.CapsuleGeometry(legRadius * 0.8, legLength * 0.5, 4, 8)
      );
      this.parts[`${side}LowerLeg`].position.set(sign * hipRadius * 0.5, legLength * 0.25, 0);
    });

    return this.group;
  }

  _setGeometry(partName, geometry) {
    const mesh = this.parts[partName];
    mesh.geometry.dispose();
    mesh.geometry = geometry;
  }

  dispose() {
    Object.values(this.parts).forEach((mesh) => mesh.geometry.dispose());
    this.material.dispose();
  }
}

function normalize(m = {}) {
  return {
    heightCm: clamp(m.heightCm, 120, 220, 170),
    chestCm: clamp(m.chestCm, 60, 160, 92),
    waistCm: clamp(m.waistCm, 50, 160, 80),
    hipCm: clamp(m.hipCm, 60, 170, 96),
    shoulderWidthCm: clamp(m.shoulderWidthCm, 30, 60, 44),
    inseamCm: clamp(m.inseamCm, 50, 110, 78),
  };
}

function clamp(value, min, max, fallback) {
  const v = typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
  return Math.min(max, Math.max(min, v));
}
