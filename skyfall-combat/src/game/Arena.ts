import * as THREE from 'three';

export function createArena(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0x9dc9df);
  scene.fog = new THREE.FogExp2(0x9dc9df, 0.000075);

  scene.add(new THREE.HemisphereLight(0xd8f1ff, 0x394f62, 2.1));

  const sun = new THREE.DirectionalLight(0xfff2d6, 3);
  sun.position.set(-1200, 2200, -800);
  scene.add(sun);

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(50000, 50000),
    new THREE.MeshStandardMaterial({
      color: 0x246b83, metalness: 0.22, roughness: 0.48
    })
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = 0;
  scene.add(ocean);

  const islandMaterial = new THREE.MeshStandardMaterial({
    color: 0x526e60, roughness: 0.95, flatShading: true
  });

  const islands = [
    [-1800, -3600, 620, 180, 950],
    [2600, -5200, 900, 260, 720],
    [3900, 1800, 680, 210, 1000],
    [-3400, 2800, 1100, 300, 760],
    [500, 6500, 760, 240, 1250]
  ];

  for (const [x, z, sx, sy, sz] of islands) {
    const island = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2), islandMaterial
    );
    island.position.set(x!, sy! * 0.15, z!);
    island.scale.set(sx!, sy!, sz!);
    scene.add(island);
  }

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f8fb, roughness: 1, flatShading: true
  });
  const cloudGeometry = new THREE.IcosahedronGeometry(1, 1);

  for (let i = 0; i < 38; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
      puff.position.set((j - 1.5) * 105, (j % 2) * 32, Math.sin(j * 2.1) * 60);
      puff.scale.set(100 + (j % 3) * 35, 38 + (j % 2) * 18, 62 + (j % 2) * 20);
      cloud.add(puff);
    }
    cloud.position.set(
      Math.sin(i * 7.31) * 6500,
      1800 + ((i * 719) % 2300),
      Math.cos(i * 4.17) * 7000
    );
    scene.add(cloud);
  }

  const grid = new THREE.GridHelper(10000, 50, 0x9ed7e3, 0x6ba5b7);
  grid.position.y = 10;
  const material = grid.material as THREE.Material;
  material.transparent = true;
  material.opacity = 0.13;
  scene.add(grid);
}
