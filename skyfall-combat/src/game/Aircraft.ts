import * as THREE from 'three';

export function createAircraft(): THREE.Group {
  const jet = new THREE.Group();
  jet.name = 'XF-01';

  const hull = new THREE.MeshStandardMaterial({
    color: 0xaab7c4,
    metalness: 0.78,
    roughness: 0.27,
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x263441,
    metalness: 0.7,
    roughness: 0.32,
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x48c9f5,
    metalness: 0.5,
    roughness: 0.12,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });

  const engineGlow = new THREE.MeshStandardMaterial({
    color: 0xffa64d,
    emissive: 0xff4b08,
    emissiveIntensity: 3.5,
  });

  const blueGlow = new THREE.MeshBasicMaterial({
    color: 0x41cfff,
  });

  function addMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    parent: THREE.Group = jet,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Long central fuselage; nose points toward local -Z.
  const body = addMesh(
    new THREE.CapsuleGeometry(0.36, 5.7, 8, 16),
    hull,
    new THREE.Vector3(0, 0, -0.15),
  );
  body.rotation.x = Math.PI / 2;
  body.scale.set(0.95, 1, 0.9);

  const nose = addMesh(
    new THREE.ConeGeometry(0.34, 2.5, 12),
    hull,
    new THREE.Vector3(0, 0.02, -4.05),
  );
  nose.rotation.x = -Math.PI / 2;

  // Swept main wings.
  const wingShape = new THREE.Shape();
  wingShape.moveTo(-0.25, 0.65);
  wingShape.lineTo(-4.8, 1.8);
  wingShape.lineTo(-4.15, 0.45);
  wingShape.lineTo(-2.35, -1.0);
  wingShape.lineTo(-0.3, -1.35);
  wingShape.closePath();

  const wingsMaterial = hull.clone();
  wingsMaterial.side = THREE.DoubleSide;

  const wings = addMesh(
    new THREE.ShapeGeometry(wingShape),
    wingsMaterial,
    new THREE.Vector3(0, -0.03, -0.1),
  );
  wings.rotation.x = -Math.PI / 2;

  // Wing panel lines and subtle colored tips.
  for (const side of [-1, 1]) {
    const tip = addMesh(
      new THREE.BoxGeometry(0.13, 0.055, 0.48),
      blueGlow,
      new THREE.Vector3(side * 3.75, 0.015, -0.1),
    );
    tip.rotation.y = side * -0.2;

    const stabilizerShape = new THREE.Shape();
    stabilizerShape.moveTo(-0.15, 0.25);
    stabilizerShape.lineTo(-1.35, 0.85);
    stabilizerShape.lineTo(-0.65, -0.65);
    stabilizerShape.lineTo(-0.12, -0.75);
    stabilizerShape.closePath();

    const finMaterial = dark.clone();
    finMaterial.side = THREE.DoubleSide;

    const fin = addMesh(
      new THREE.ShapeGeometry(stabilizerShape),
      finMaterial,
      new THREE.Vector3(side * 0.48, 0.28, 1.55),
    );
    fin.rotation.x = -Math.PI / 2;
    fin.scale.set(0.72, 0.9, 1);

    // Twin engine housings.
    const engine = addMesh(
      new THREE.CylinderGeometry(0.23, 0.3, 0.85, 16),
      dark,
      new THREE.Vector3(side * 0.36, -0.12, 2.45),
    );
    engine.rotation.x = Math.PI / 2;

    const nozzle = addMesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.22, 16),
      hull,
      new THREE.Vector3(side * 0.36, -0.12, 2.98),
    );
    nozzle.rotation.x = Math.PI / 2;

    // Glowing exhaust cone.
    const exhaust = addMesh(
      new THREE.ConeGeometry(0.19, 1.35, 16),
      engineGlow,
      new THREE.Vector3(side * 0.36, -0.12, 3.68),
    );
    exhaust.rotation.x = -Math.PI / 2;
    exhaust.userData.isExhaust = true;

    const core = addMesh(
      new THREE.ConeGeometry(0.085, 1.0, 12),
      blueGlow,
      new THREE.Vector3(side * 0.36, -0.12, 3.8),
    );
    core.rotation.x = -Math.PI / 2;
    core.userData.isExhaust = true;
  }

  // Cockpit canopy.
  const canopy = addMesh(
    new THREE.SphereGeometry(
      0.53, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2,
    ),
    canopyMat,
    new THREE.Vector3(0, 0.39, -1.45),
  );
  canopy.scale.set(0.76, 0.72, 1.7);

  // Cockpit frame.
  const canopyFrame = addMesh(
    new THREE.BoxGeometry(0.035, 0.035, 1.35),
    dark,
    new THREE.Vector3(0, 0.78, -1.55),
  );
  canopyFrame.rotation.x = -0.08;

  // Centerline markings.
  addMesh(
    new THREE.BoxGeometry(0.055, 0.025, 2.4),
    blueGlow,
    new THREE.Vector3(0, 0.19, -0.25),
  );

  // Small stabilizer beneath the rear fuselage.
  const belly = addMesh(
    new THREE.BoxGeometry(0.45, 0.12, 1.1),
    dark,
    new THREE.Vector3(0, -0.35, 1.5),
  );
  belly.rotation.x = -0.12;

  jet.scale.setScalar(1.35);

  return jet;
}
