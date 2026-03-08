import { eventBus } from '../core/eventBus';

export class StatsSystem {
  health = 100;
  hunger = 100;
  sanity = 100;
  maxHealth = 100;
  maxHunger = 100;
  maxSanity = 100;

  clamp(): void {
    this.health = Math.max(0, Math.min(this.maxHealth, this.health));
    this.hunger = Math.max(0, Math.min(this.maxHunger, this.hunger));
    this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity));
  }

  update(dt: number, isDark: boolean, nearEnemy: boolean): void {
    this.hunger -= dt * 1.2;
    if (this.hunger <= 0) this.health -= dt * 4;
    if (isDark) this.sanity -= dt * 5;
    if (nearEnemy) this.sanity -= dt * 2;
    this.clamp();
    if (this.health <= 0) eventBus.emit('PlayerDied');
  }

  eat(hunger: number, health: number, sanity: number): void {
    this.hunger += hunger;
    this.health += health;
    this.sanity += sanity;
    this.clamp();
  }

  damage(amount: number): void {
    this.health -= amount;
    this.clamp();
    eventBus.emit('DamageTaken', amount);
    if (this.health <= 0) eventBus.emit('PlayerDied');
  }
}
