import * as THREE from 'three';

export interface FlightInput {
  pitch: number;
  roll: number;
  yaw: number;
  throttle: number;
  boost: boolean;
  mouseX: number;
  mouseY: number;
}

export class FlightController {
  readonly forward = new THREE.Vector3(0, 0, -1);
  throttle = 0.68;
  verticalSpeed = 0;
  speedKmh = 0;
  private previousAltitude = 1200;
  private mousePitch = 0;
  private mouseYaw = 0;

  constructor(readonly aircraft: THREE.Group) {
    aircraft.position.set(0, 1200, 0);
  }

  update(input: FlightInput, dt: number) {
    const frame = Math.min(dt, 0.04);

    this.throttle = THREE.MathUtils.clamp(
      this.throttle + input.throttle * frame * 0.42, 0.18, 1
    );

    const speed = 72 + this.throttle * 105 * (input.boost ? 1.42 : 1);
    this.speedKmh = Math.round(speed * 3.6);

    this.mouseYaw = THREE.MathUtils.clamp(
      this.mouseYaw + input.mouseX * 0.0018, -0.12, 0.12
    );
    this.mousePitch = THREE.MathUtils.clamp(
      this.mousePitch + input.mouseY * 0.0018, -0.12, 0.12
    );

    const damping = Math.exp(-5 * frame);
    this.mouseYaw *= damping;
    this.mousePitch *= damping;

    this.aircraft.rotation.order = 'YXZ';
    this.aircraft.rotation.z += input.roll * frame * 1.25;
    this.aircraft.rotation.x += input.pitch * frame * 0.9 - this.mousePitch * frame * 3;
    this.aircraft.rotation.y += input.yaw * frame * 0.65 - this.mouseYaw * frame * 3;

    this.aircraft.rotation.x = THREE.MathUtils.clamp(
      this.aircraft.rotation.x, -0.85, 0.85
    );
    this.aircraft.rotation.z = THREE.MathUtils.clamp(
      this.aircraft.rotation.z, -1.15, 1.15
    );

    if (input.pitch === 0 && input.roll === 0) {
      this.aircraft.rotation.z = THREE.MathUtils.damp(
        this.aircraft.rotation.z, 0, 0.22, frame
      );
    }

    this.forward.set(0, 0, -1).applyQuaternion(this.aircraft.quaternion).normalize();
    this.aircraft.position.addScaledVector(this.forward, speed * frame);

    this.aircraft.position.y = THREE.MathUtils.clamp(
      this.aircraft.position.y, 250, 6000
    );

    this.verticalSpeed =
      (this.aircraft.position.y - this.previousAltitude) / Math.max(frame, 0.001);
    this.previousAltitude = this.aircraft.position.y;

    const euler = new THREE.Euler().setFromQuaternion(this.aircraft.quaternion, 'YXZ');

    return {
      speedKmh: this.speedKmh,
      altitudeM: Math.round(this.aircraft.position.y),
      verticalSpeed: Math.round(this.verticalSpeed),
      headingDeg: Math.round((THREE.MathUtils.radToDeg(euler.y) + 360) % 360),
      throttlePct: Math.round(this.throttle * 100)
    };
  }

  levelOut(): void {
    this.aircraft.rotation.x *= 0.35;
    this.aircraft.rotation.z *= 0.35;
    this.mousePitch = 0;
    this.mouseYaw = 0;
  }
}
