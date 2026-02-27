import type { RampConfig, ShadeStep } from './types';

/** Derive step number from L value: step = round(1000 * (1 - L)).
 *  L=0.50 → 500, L=0.25 → 750, L=0.97 → 30, L=0.05 → 950 */
export function stepFromL(l: number): number {
  return Math.round(1000 * (1 - l));
}

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
