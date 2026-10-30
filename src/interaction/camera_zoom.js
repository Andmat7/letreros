const step_factors = { in: 0.75, out: 1 / 0.75 };

// Moves the camera along its line to the orbit target, keeping the distance inside the controls' limits.
export function zoom_camera({ camera, controls }, direction) {
  const offset = camera.position.clone().sub(controls.target);
  const distance = offset.length() * step_factors[direction];
  offset.setLength(Math.min(controls.maxDistance, Math.max(controls.minDistance, distance)));
  camera.position.copy(controls.target).add(offset);
}
