import type { RampConfig, ShadeStep } from './types';

/** Convert RampConfig steps into the Map the engine expects. Always sorted dark→light. */
export function generateLightnessRamp(config: RampConfig): Map<number, number> {
  const ramp = new Map<number, number>();
  for (const s of config.steps) {
    ramp.set(s.step, s.l);
  }
  return ramp;
}

/** Sort steps by L ascending (dark first, light last) for left-to-right display. */
export function sortedSteps(steps: ShadeStep[]): ShadeStep[] {
  return [...steps].sort((a, b) => a.l - b.l);
}
