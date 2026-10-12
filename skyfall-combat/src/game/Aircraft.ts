import * as THREE from 'three';

export function createAircraft(): THREE.Group {
  const jet = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0x9aa9b8, metalness: 0.65, roughness: 0.3
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x263747 });
  const canopyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x39bde0, metalness: 0.3, roughness: 0.15
  });
  const glow = new THREE.MeshBasicMaterial({ color: 0x28d9ff });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.42, 5.8, 5, 12), hull
  );
  body.rotation.x = Math.PI / 2;
  body.position.z = -0.2;
  jet.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 2, 12), hull);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -4;
  jet.add(nose);

  const shape = new THREE.Shape();
  shape.moveTo(-0.2, 0.5);
  shape.lineTo(-4.6, 1.3);
  shape.lineTo(-2.2, -0.95);
  shape.lineTo(-0.3, -1.2);
  shape.closePath();

  const wings = new THREE.Mesh(new THREE.ShapeGeometry(shape), hull);
  wings.rotation.x = -Math.PI / 2;
  wings.material.side = THREE.DoubleSide;
  jet.add(wings);

  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.95, 1.1), dark
    );
    fin.position.set(side * 0.48, 0.45, 1.7);
    fin.rotation.z = side * 0.12;
    jet.add(fin);

    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.65, 12), dark
    );
    engine.rotation.x = Math.PI / 2;
    engine.position.set(side * 0.35, -0.12, 2.8);
    jet.add(engine);

    const exhaust = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 1.15, 12), glow
    );
    exhaust.rotation.x = -Math.PI / 2;
    exhaust.position.set(side * 0.35, -0.12, 3.55);
    jet.add(exhaust);
  }

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    canopyMaterial
  );
  canopy.scale.set(0.75, 0.7, 1.65);
  canopy.position.set(0, 0.43, -1.45);
  jet.add(canopy);

  jet.scale.setScalar(1.15);
  jet.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return jet;
}
