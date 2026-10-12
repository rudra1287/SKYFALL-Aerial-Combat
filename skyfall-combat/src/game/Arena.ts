import * as THREE from 'three';

export function createArena(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0x83c5e8);
  scene.fog = new THREE.FogExp2(0x83c5e8, 0.000045);

  const hemisphere = new THREE.HemisphereLight(
    0xdaf3ff,
    0x344d52,
    1.8,
  );
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xffedcf, 3.2);
  sun.position.set(-1800, 2600, -1200);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -2500;
  sun.shadow.camera.right = 2500;
  sun.shadow.camera.top = 2500;
  sun.shadow.camera.bottom = -2500;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  // Broad blue ocean with subtle reflective highlights.
  const oceanMaterial = new THREE.MeshStandardMaterial({
    color: 0x176b89,
    metalness: 0.42,
    roughness: 0.32,
  });

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(60000, 60000, 1, 1),
    oceanMaterial,
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = 0;
  ocean.receiveShadow = true;
  scene.add(ocean);

  // Coastal islands with faceted rock shapes and green tops.
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x536b68,
    roughness: 0.92,
    flatShading: true,
  });

  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x547b53,
    roughness: 1,
    flatShading: true,
  });

  const beachMaterial = new THREE.MeshStandardMaterial({
    color: 0xcbbd91,
    roughness: 1,
  });

  const islands = [
    { x: -1800, z: -3600, sx: 550, sy: 210, sz: 800 },
    { x: 2600, z: -5200, sx: 850, sy: 280, sz: 680 },
    { x: 3900, z: 1800, sx: 650, sy: 250, sz: 950 },
    { x: -3400, z: 2800, sx: 950, sy: 320, sz: 720 },
    { x: 500, z: 6500, sx: 700, sy: 230, sz: 1100 },
    { x: 5100, z: -1800, sx: 430, sy: 180, sz: 500 },
    { x: -5000, z: -1500, sx: 680, sy: 240, sz: 520 },
  ];

  for (const data of islands) {
    const group = new THREE.Group();

    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 3),
      rockMaterial,
    );
    rock.scale.set(data.sx, data.sy, data.sz);
    rock.position.y = data.sy * 0.2;
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    const top = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2),
      grassMaterial,
    );
    top.scale.set(
      data.sx * 0.76,
      data.sy * 0.48,
      data.sz * 0.76,
    );
    top.position.y = data.sy * 0.57;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // A few small pale beaches around each island.
    for (let i = 0; i < 3; i++) {
      const beach = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 8),
        beachMaterial,
      );

      beach.scale.set(data.sx * 0.18, 5, data.sz * 0.09);
      beach.position.set(
        Math.cos(i * 2.1) * data.sx * 0.68,
        7,
        Math.sin(i * 2.1) * data.sz * 0.68,
      );
      group.add(beach);
    }

    group.position.set(data.x, 0, data.z);
    scene.add(group);

    // Distant jagged mountain peaks.
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(data.sx * 0.32, data.sy * 3.8, 7),
      rockMaterial,
    );
    mountain.position.set(
      data.x + data.sx * 0.2,
      data.sy * 1.6,
      data.z - data.sz * 0.25,
    );
    mountain.rotation.y = 0.3;
    mountain.castShadow = true;
    scene.add(mountain);
  }

  // Layered stylized cloud banks.
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f7fb,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

  const cloudGeometry = new THREE.IcosahedronGeometry(1, 2);

  for (let i = 0; i < 100; i++) {
    const cloud = new THREE.Group();

    const x = Math.sin(i * 7.31) * 9000;
    const y = 1300 + ((i * 719) % 2500);
    const z = Math.cos(i * 4.17) * 11000;

    const puffCount = 4 + (i % 4);

    for (let j = 0; j < puffCount; j++) {
      const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);

      puff.position.set(
        (j - puffCount / 2) * 100,
        Math.sin(j * 1.7 + i) * 45,
        Math.cos(j * 2.2) * 70,
      );

      puff.scale.set(
        100 + ((i + j) % 4) * 32,
        42 + ((i + j) % 3) * 18,
        65 + ((i * j) % 3) * 20,
      );

      cloud.add(puff);
    }

    cloud.position.set(x, y, z);
    scene.add(cloud);
  }

  // Fine navigation grid near the horizon.
  const grid = new THREE.GridHelper(
    12000,
    60,
    0x92d9e8,
    0x79b9ca,
  );

  grid.position.y = 5;

  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.07;

  scene.add(grid);
}
