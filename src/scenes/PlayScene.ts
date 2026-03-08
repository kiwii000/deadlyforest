import Phaser from 'phaser';
import {
  AUTOSAVE_INTERVAL,
  ENEMY_SPAWN_INTERVAL,
  GAME_HEIGHT,
  GAME_WIDTH,
  INTERACT_RANGE,
  MAX_LIGHT_RADIUS,
  PICKUP_RANGE,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from '../config/constants';
import { eventBus } from '../core/eventBus';
import type { EnemyData, InventorySlot, ItemId, ResourceNodeData, SaveData } from '../core/types';
import { items } from '../data/items';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { ResourceNode } from '../entities/ResourceNode';
import { CraftingSystem } from '../systems/craftingSystem';
import { InventorySystem } from '../systems/inventorySystem';
import { loadSlot, saveSlot } from '../systems/saveSystem';
import { StatsSystem } from '../systems/statsSystem';
import { TimeSystem } from '../systems/timeSystem';
import { generateWorld } from '../systems/worldGen';
import { Hud } from '../ui/Hud';

interface Drop {
  id: ItemId;
  qty: number;
  sprite: Phaser.GameObjects.Rectangle;
  expiresAt: number;
}

interface Structure {
  id: string;
  type: 'campfire' | 'science_machine';
  x: number;
  y: number;
  fuel: number;
  sprite: Phaser.GameObjects.Rectangle;
}

export class PlayScene extends Phaser.Scene {
  private seed = '';
  private slot = 1;
  private player!: Player;
  private hud!: Hud;
  private stats = new StatsSystem();
  private inventory = new InventorySystem(18);
  private crafting = new CraftingSystem();
  private timeSystem = new TimeSystem();
  private nodes: ResourceNode[] = [];
  private structures: Structure[] = [];
  private drops: Drop[] = [];
  private enemies: Enemy[] = [];
  private biome: ('meadow' | 'forest')[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private actionProgress = 0;
  private actionNode: ResourceNode | null = null;
  private autosave = 0;
  private enemySpawnTimer = 0;
  private playtime = 0;

  constructor() {
    super('Play');
  }

  create(data?: { seed: string; slot: number; load: boolean }): void {
    const startData = data ?? { seed: `${Date.now()}`, slot: 1, load: false };
    this.seed = startData.seed;
    this.slot = startData.slot;
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);

    if (startData.load) {
      const loaded = loadSlot(this.slot);
      if (loaded) this.loadFromSave(loaded);
      else this.newWorld();
    } else {
      this.newWorld();
    }

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,E,F,I,C,SPACE,P,ONE,TWO') as Record<string, Phaser.Input.Keyboard.Key>;
    this.hud = new Hud(this);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    eventBus.on('PlayerDied', () => this.scene.start('GameOver', { reason: 'You succumbed to the wild.' }));
    this.input.keyboard?.on('keydown-P', () => this.scene.pause());
  }

  private newWorld(): void {
    const world = generateWorld(this.seed);
    this.biome = world.biome;
    this.drawGround();
    this.player = new Player(this, WORLD_WIDTH * TILE_SIZE * 0.5, WORLD_HEIGHT * TILE_SIZE * 0.5);
    this.nodes = world.nodes.map((n) => new ResourceNode(this, n));
    this.inventory.add('twig', 3);
    this.inventory.add('flint', 2);
    this.stats.health = 100;
    this.stats.hunger = 100;
    this.stats.sanity = 100;
  }

  private loadFromSave(save: SaveData): void {
    this.seed = save.seed;
    const world = generateWorld(this.seed);
    this.biome = world.biome;
    this.drawGround();
    this.player = new Player(this, save.player.x, save.player.y);
    this.stats.health = save.player.stats.health;
    this.stats.hunger = save.player.stats.hunger;
    this.stats.sanity = save.player.stats.sanity;
    this.inventory.slots = save.player.inventory;
    this.timeSystem.timeSeconds = save.world.timeSeconds;
    this.playtime = save.meta.playtime;
    this.nodes = save.world.nodes.map((n) => new ResourceNode(this, n));
    this.structures = save.world.structures.map((s) => ({
      ...s,
      sprite: this.add.rectangle(s.x, s.y, 24, 24, s.type === 'campfire' ? 0xff9933 : 0xbbb277)
    }));
    this.enemies = save.world.enemies.map((e) => new Enemy(this, e));
  }

  update(_: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.playtime += dt;
    this.timeSystem.update(dt);
    const input = new Phaser.Math.Vector2(
      Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown),
      Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown)
    );
    const moving = this.player.move(input, dt);

    const nearestNode = this.findNearestNode();
    if (moving || (this.player.canTakeDamage(this.time.now) && this.stats.health <= 0)) {
      this.actionNode = null;
      this.actionProgress = 0;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) && nearestNode) {
      this.actionNode = nearestNode;
      this.actionProgress = 0;
    }
    if (this.actionNode) this.progressHarvest(dt);

    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) this.interactUseSelected();
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.attackEnemy();
    if (Phaser.Input.Keyboard.JustDown(this.keys.C)) this.quickCraft();
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) this.inventory.split(0);

    this.updateDrops();
    this.updateEnemies(dt);
    this.updateStructures(dt);

    const dark = this.timeSystem.phase === 'night' && !this.isInLight();
    const nearEnemy = this.enemies.some((e) => Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 90);
    this.stats.update(dt, dark, nearEnemy);
    if (dark) this.stats.damage(dt * 2.2);

    this.autosave += dt;
    if (this.autosave > AUTOSAVE_INTERVAL) {
      this.autosave = 0;
      this.persist('autosave');
    }
    this.enemySpawnTimer += dt;
    if (this.enemySpawnTimer > ENEMY_SPAWN_INTERVAL) {
      this.enemySpawnTimer = 0;
      this.spawnEnemy();
    }

    this.renderHud(nearestNode, dark);
  }

  private drawGround(): void {
    for (let y = 0; y < WORLD_HEIGHT; y += 1) {
      for (let x = 0; x < WORLD_WIDTH; x += 1) {
        const b = this.biome[y * WORLD_WIDTH + x] ?? 'meadow';
        const color = b === 'forest' ? 0x244f2b : 0x547b3a;
        this.add.rectangle(x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE, color).setDepth(-10);
      }
    }
  }

  private findNearestNode(): ResourceNode | null {
    let best: ResourceNode | null = null;
    let bestDist = Infinity;
    this.nodes.forEach((node) => {
      if (node.dataModel.hp <= 0) return;
      const d = Phaser.Math.Distance.Between(node.x, node.y, this.player.x, this.player.y);
      if (d < INTERACT_RANGE && d < bestDist) {
        best = node;
        bestDist = d;
      }
    });
    return best;
  }

  private progressHarvest(dt: number): void {
    if (!this.actionNode || this.actionNode.dataModel.hp <= 0) return;
    const node = this.actionNode.dataModel;
    const handItem = this.inventory.slots[0]?.itemId;
    const toolPower = handItem && items[handItem].tool ? items[handItem].tool!.power : 1;
    const bonus = (node.type === 'tree' && handItem === 'axe') || (node.type === 'boulder' && handItem === 'pickaxe') ? 1.4 : 0.6;
    this.actionProgress += dt * toolPower * bonus;
    if (this.actionProgress >= 1) {
      this.actionProgress = 0;
      node.hp -= 1;
      if (node.hp <= 0) this.resolveNodeDestroyed(this.actionNode);
    }
  }

  private resolveNodeDestroyed(node: ResourceNode): void {
    const type = node.dataModel.type;
    const drops: Array<{ id: ItemId; qty: number }> = [];
    if (type === 'tree') drops.push({ id: 'log', qty: 2 });
    if (type === 'boulder') drops.push({ id: 'stone', qty: 2 }, { id: 'flint', qty: 1 });
    if (type === 'berry_bush') drops.push({ id: 'berry', qty: 2 });
    if (type === 'grass_tuft') drops.push({ id: 'grass', qty: 1 });
    if (type === 'sapling') drops.push({ id: 'twig', qty: 1 });
    drops.forEach((d, i) => this.spawnDrop(d.id, d.qty, node.x + i * 8, node.y));
    node.dataModel.regrowAt = this.time.now + 25000;
    node.dataModel.hp = 0;
    node.setVisible(false);
    this.time.delayedCall(25000, () => {
      node.dataModel.hp = node.dataModel.maxHp;
      node.setVisible(true);
    });
  }

  private spawnDrop(id: ItemId, qty: number, x: number, y: number): void {
    const sprite = this.add.rectangle(x, y, 10, 10, 0xffde66);
    this.drops.push({ id, qty, sprite, expiresAt: this.time.now + 40000 });
  }

  private updateDrops(): void {
    this.drops = this.drops.filter((d) => {
      if (this.time.now > d.expiresAt) {
        d.sprite.destroy();
        return false;
      }
      const dist = Phaser.Math.Distance.Between(d.sprite.x, d.sprite.y, this.player.x, this.player.y);
      if (dist < PICKUP_RANGE) {
        const left = this.inventory.add(d.id, d.qty);
        if (left === 0) {
          eventBus.emit('ItemCollected', d.id);
          d.sprite.destroy();
          return false;
        }
      }
      return true;
    });
  }

  private attackEnemy(): void {
    const target = this.enemies.find((e) => Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 45);
    if (!target) return;
    target.dataModel.hp -= 4;
    target.fillColor = 0xdd4455;
    if (target.dataModel.hp <= 0) {
      this.spawnDrop('monster_meat', 1, target.x, target.y);
      target.destroy();
      this.enemies = this.enemies.filter((e) => e !== target);
    }
  }

  private updateEnemies(dt: number): void {
    this.enemies.forEach((enemy) => {
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (dist < 140) enemy.dataModel.state = 'chase';
      else if (Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.spawnX, enemy.spawnY) > 180) enemy.dataModel.state = 'leash';
      else enemy.dataModel.state = 'idle';

      if (enemy.dataModel.state === 'chase') {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.x += Math.cos(angle) * 55 * dt;
        enemy.y += Math.sin(angle) * 55 * dt;
        if (dist < 28) enemy.dataModel.state = 'attack';
      } else if (enemy.dataModel.state === 'leash') {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.spawnX, enemy.spawnY);
        enemy.x += Math.cos(angle) * 60 * dt;
        enemy.y += Math.sin(angle) * 60 * dt;
      }

      enemy.cooldown -= dt;
      if (enemy.dataModel.state === 'attack' && enemy.cooldown <= 0) {
        enemy.cooldown = 1.2;
        if (this.player.canTakeDamage(this.time.now)) {
          this.player.takeHit(this.time.now);
          this.stats.damage(8);
        }
      }
    });
  }

  private spawnEnemy(): void {
    const angle = Math.random() * Math.PI * 2;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * 280, 16, WORLD_WIDTH * TILE_SIZE - 16);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * 280, 16, WORLD_HEIGHT * TILE_SIZE - 16);
    const e: EnemyData = { id: `e_${this.time.now}`, x, y, hp: 14, state: 'idle' };
    this.enemies.push(new Enemy(this, e));
  }

  private interactUseSelected(): void {
    const hand = this.inventory.slots[0];
    if (!hand) return;
    const def = items[hand.itemId];
    if (def.edible) {
      this.stats.eat(def.edible.hunger, def.edible.health, def.edible.sanity);
      this.inventory.remove(hand.itemId, 1);
      return;
    }
    if (hand.itemId === 'torch') {
      this.player.torchFuel = Math.max(this.player.torchFuel, 45);
      this.inventory.remove('torch', 1);
      return;
    }
    if (def.placeable) {
      const structure: Structure = {
        id: `${def.placeable}_${this.time.now}`,
        type: def.placeable,
        x: this.player.x + 36,
        y: this.player.y,
        fuel: def.placeable === 'campfire' ? 40 : 0,
        sprite: this.add.rectangle(this.player.x + 36, this.player.y, 24, 24, def.placeable === 'campfire' ? 0xff9933 : 0xbbb277)
      };
      this.structures.push(structure);
      this.inventory.remove(hand.itemId, 1);
      if (def.placeable === 'science_machine') this.crafting.scienceUnlocked = true;
    }
  }

  private quickCraft(): void {
    const nearScience = this.structures.some(
      (s) => s.type === 'science_machine' && Phaser.Math.Distance.Between(s.x, s.y, this.player.x, this.player.y) < 72
    );
    const order = ['axe', 'pickaxe', 'torch', 'campfire', 'science_machine', 'cooked_berry'];
    for (const r of order) {
      if (this.crafting.craft(r, this.inventory, nearScience)) {
        this.hud.flash(`Crafted ${r}`);
        return;
      }
    }
    this.hud.flash('Cannot craft currently');
  }

  private updateStructures(dt: number): void {
    this.structures.forEach((s) => {
      if (s.type === 'campfire' && s.fuel > 0) s.fuel -= dt;
    });
    if (this.player.torchFuel > 0) this.player.torchFuel -= dt;
  }

  private isInLight(): boolean {
    if (this.player.torchFuel > 0) return true;
    return this.structures.some(
      (s) => s.type === 'campfire' && s.fuel > 0 && Phaser.Math.Distance.Between(s.x, s.y, this.player.x, this.player.y) < MAX_LIGHT_RADIUS
    );
  }

  private persist(status: string): void {
    const data: SaveData = {
      version: 1,
      meta: {
        slot: this.slot,
        playtime: this.playtime,
        day: this.timeSystem.day,
        status,
        savedAt: new Date().toISOString()
      },
      seed: this.seed,
      player: {
        x: this.player.x,
        y: this.player.y,
        stats: { health: this.stats.health, hunger: this.stats.hunger, sanity: this.stats.sanity },
        inventory: this.inventory.slots,
        hand: null,
        body: null
      },
      world: {
        timeSeconds: this.timeSystem.timeSeconds,
        nodes: this.nodes.map((n) => n.dataModel),
        structures: this.structures.map((s) => ({ id: s.id, type: s.type, x: s.x, y: s.y, fuel: s.fuel })),
        enemies: this.enemies.map((e) => ({ ...e.dataModel, x: e.x, y: e.y }))
      }
    };
    saveSlot(this.slot, data);
  }

  private renderHud(nearestNode: ResourceNode | null, dark: boolean): void {
    const top = this.inventory.slots
      .map((s: InventorySlot | null, i) => (s ? `${i + 1}:${s.itemId}x${s.qty}` : `${i + 1}:_`))
      .slice(0, 6)
      .join(' ');
    this.hud.setStats(
      `HP ${this.stats.health.toFixed(0)}  Hunger ${this.stats.hunger.toFixed(0)}  Sanity ${this.stats.sanity.toFixed(0)}\n` +
        `Day ${this.timeSystem.day} ${this.timeSystem.phase.toUpperCase()}  Seed ${this.seed}\n` +
        `Slot1(hand): ${this.inventory.slots[0]?.itemId ?? 'empty'}  TorchFuel ${this.player.torchFuel.toFixed(0)}\n` +
        `Inventory ${top}\n` +
        `E harvest | C quick-craft | F use/eat/place | SPACE attack | I split slot1`
    );
    if (nearestNode) this.hud.flash(`Target: ${nearestNode.dataModel.type} hp ${nearestNode.dataModel.hp}`);
    if (dark) this.hud.flash('Darkness is hurting you! Use torch/campfire.');
  }
}
