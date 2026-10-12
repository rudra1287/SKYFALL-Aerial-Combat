import * as THREE from 'three';
import { createAircraft } from './game/Aircraft';
import { createArena } from './game/Arena';
import { FlightController, type FlightInput } from './game/FlightController';
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
createArena(scene);

const aircraft = createAircraft();
scene.add(aircraft);
const flight = new FlightController(aircraft);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 70000);
const clock = new THREE.Clock();
const pressed = new Set<string>();
const cameraOffset = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

let active = false;
let boost = false;
let locked = false;
let mouseX = 0;
let mouseY = 0;

const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;

$('#start').addEventListener('click', () => {
  active = true;
  $('#launch').classList.add('hidden');
  canvas.requestPointerLock();
});

canvas.addEventListener('click', () => {
  if (active && !locked) canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', event => {
  if (!locked) return;
  mouseX = THREE.MathUtils.clamp(event.movementX, -80, 80);
  mouseY = THREE.MathUtils.clamp(event.movementY, -80, 80);
});

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'q', 'e', 'r', 'shift',
    'arrowup', 'arrowdown', 'arrowleft', 'arrowright', '=', '-', '+', '_'].includes(key)) {
    event.preventDefault();
  }
  pressed.add(key);
  if (key === 'shift') boost = true;
  if (key === 'r' && active) flight.levelOut();
});

document.addEventListener('keyup', event => {
  const key = event.key.toLowerCase();
  pressed.delete(key);
  if (key === 'shift') boost = false;
});

window.addEventListener('blur', () => {
  pressed.clear();
  boost = false;
});

function readInput(): FlightInput {
  return {
    pitch: Number(pressed.has('w') || pressed.has('arrowup')) -
      Number(pressed.has('s') || pressed.has('arrowdown')),
    roll: Number(pressed.has('a') || pressed.has('arrowleft')) -
      Number(pressed.has('d') || pressed.has('arrowright')),
    yaw: Number(pressed.has('e')) - Number(pressed.has('q')),
    throttle: Number(pressed.has('=') || pressed.has('+')) -
      Number(pressed.has('-') || pressed.has('_')),
    boost,
    mouseX,
    mouseY
  };
}

function animate(): void {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  const input = readInput();

  if (!active) {
    input.pitch = 0;
    input.roll = 0;
    input.yaw = 0;
    input.throttle = 0;
    input.boost = false;
    input.mouseX = 0;
    input.mouseY = 0;
  }

  const telemetry = flight.update(input, dt);

  $('#speed').textContent = String(telemetry.speedKmh);
  $('#altitude').textContent = telemetry.altitudeM.toLocaleString();
  $('#heading').textContent = String(telemetry.headingDeg).padStart(3, '0');
  $('#throttle').textContent = String(telemetry.throttlePct);
  $('#vertical').textContent = String(telemetry.verticalSpeed);

  cameraOffset.set(0, 5.2, 17.5).applyQuaternion(aircraft.quaternion);
  desiredCamera.copy(aircraft.position).add(cameraOffset);
  camera.position.lerp(desiredCamera, 1 - Math.exp(-3.5 * dt));

  lookTarget.copy(aircraft.position).addScaledVector(flight.forward, 45);
  lookTarget.y += 1.8;
  camera.lookAt(lookTarget);

  camera.fov = THREE.MathUtils.damp(camera.fov, boost && active ? 73 : 65, 3, dt);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  mouseX = 0;
  mouseY = 0;
}

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
});

animate();
