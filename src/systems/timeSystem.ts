import { DAY_LENGTH, DUSK_LENGTH, NIGHT_LENGTH } from '../config/constants';
import { eventBus } from '../core/eventBus';
import type { TimePhase } from '../core/types';

export class TimeSystem {
  timeSeconds = 0;
  day = 1;
  phase: TimePhase = 'day';

  get cycleLength(): number {
    return DAY_LENGTH + DUSK_LENGTH + NIGHT_LENGTH;
  }

  update(dt: number): void {
    const prev = this.phase;
    this.timeSeconds += dt;
    const c = this.timeSeconds % this.cycleLength;
    if (c < DAY_LENGTH) this.phase = 'day';
    else if (c < DAY_LENGTH + DUSK_LENGTH) this.phase = 'dusk';
    else this.phase = 'night';
    this.day = Math.floor(this.timeSeconds / this.cycleLength) + 1;
    if (prev !== this.phase) {
      if (this.phase === 'night') eventBus.emit('NightStarted');
      if (this.phase === 'day') eventBus.emit('DayStarted');
    }
  }
}
