import * as THREE from 'three';

const flight_duration = 1100;

export function create_camera_flight(camera, controls) {
  let flight = { active: false };
  return {
    fly_to({ camera_position, look_at }) {
      flight = {
        active: true, started_at: performance.now(),
        from_position: camera.position.clone(), from_target: controls.target.clone(),
        to_position: new THREE.Vector3(...camera_position), to_target: new THREE.Vector3(...look_at),
      };
    },
    update(now) {
      if (!flight.active) return;
      const progress = Math.min(1, (now - flight.started_at) / flight_duration);
      camera.position.lerpVectors(flight.from_position, flight.to_position, ease_in_out(progress));
      controls.target.lerpVectors(flight.from_target, flight.to_target, ease_in_out(progress));
      flight.active = progress < 1;
    },
  };
}

function ease_in_out(progress) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}
