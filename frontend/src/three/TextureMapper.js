import * as THREE from 'three';

const TEXTURE_LOADER = new THREE.TextureLoader();

/**
 * Maps a garment's texture onto simplified "garment shell" meshes that sit
 * just outside the avatar's torso/hip/leg segments — the same approach used
 * by lightweight virtual try-on demos before a full cloth-simulation layer
 * is introduced. Shells are sized relative to the avatar's current
 * measurements so garments visually track body changes.
 */
export class TextureMapper {
  constructor(avatarGroup) {
    this.avatarGroup = avatarGroup;
    this.garmentGroup = new THREE.Group();
    this.garmentGroup.name = 'garment';
    this.avatarGroup.add(this.garmentGroup);
    this.currentTexture = null;
  }

  clear() {
    this.garmentGroup.clear();
  }

  /**
   * garment: { type, textureUrl, colors }
   * measurements: current body measurements object (already applied to avatar)
   */
  async applyGarment(garment, measurements) {
    this.clear();
    if (!garment) return;

    const texture = await this._loadTexture(garment.textureUrl);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.75,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const cm = (v) => v / 100;
    const chestRadius = cm(measurements.chestCm) / (2 * Math.PI);
    const waistRadius = cm(measurements.waistCm) / (2 * Math.PI);
    const hipRadius = cm(measurements.hipCm) / (2 * Math.PI);
    const legLength = cm(measurements.inseamCm);
    const torsoLength = Math.max(
      cm(measurements.heightCm) - legLength - 0.28,
      0.3
    );
    const fit = 1.06; // small offset so garment shell clears the body mesh

    const shells = {
      't-shirt': () => this._torsoShell(chestRadius * fit, waistRadius * fit, torsoLength * 0.62, legLength + torsoLength * 0.69),
      hoodie: () => this._torsoShell(chestRadius * fit * 1.05, waistRadius * fit * 1.05, torsoLength * 0.7, legLength + torsoLength * 0.68),
      jacket: () => this._torsoShell(chestRadius * fit * 1.08, waistRadius * fit * 1.08, torsoLength * 0.68, legLength + torsoLength * 0.68),
      coat: () => this._torsoShell(chestRadius * fit * 1.1, hipRadius * fit * 1.1, torsoLength * 1.05, legLength * 0.55 + torsoLength * 0.5),
      dress: () => this._torsoShell(chestRadius * fit, hipRadius * fit * 1.15, torsoLength + legLength * 0.35, legLength * 0.55 + torsoLength * 0.2),
      jumpsuit: () => this._torsoShell(chestRadius * fit, hipRadius * fit, torsoLength + legLength * 0.9, legLength * 0.45),
      trousers: () => this._legShell(hipRadius * fit, legLength),
      jeans: () => this._legShell(hipRadius * fit, legLength),
      shorts: () => this._legShell(hipRadius * fit, legLength * 0.4),
      skirt: () => this._legShell(hipRadius * fit * 1.1, legLength * 0.45, true),
    };

    const buildShell = shells[garment.type] || shells['t-shirt'];
    const shellMesh = buildShell();
    shellMesh.material = material;
    shellMesh.castShadow = true;
    this.garmentGroup.add(shellMesh);
    this.currentTexture = texture;
  }

  _torsoShell(topRadius, bottomRadius, height, yPos) {
    const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 20, 1, true);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(0, yPos, 0);
    return mesh;
  }

  _legShell(hipRadius, length, isSkirt = false) {
    const geometry = isSkirt
      ? new THREE.ConeGeometry(hipRadius * 1.05, length, 20, 1, true)
      : new THREE.CylinderGeometry(hipRadius, hipRadius * 0.55, length, 20, 1, true);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(0, length / 2 + 0.02, 0);
    return mesh;
  }

  _loadTexture(url) {
    return new Promise((resolve, reject) => {
      TEXTURE_LOADER.load(
        url,
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          resolve(tex);
        },
        undefined,
        () => {
          // Fall back to a flat color placeholder if the texture 404s,
          // which keeps the demo usable without real asset files.
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 4;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#8899aa';
          ctx.fillRect(0, 0, 4, 4);
          resolve(new THREE.CanvasTexture(canvas));
        }
      );
    });
  }

  dispose() {
    this.garmentGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.currentTexture?.dispose();
  }
}
