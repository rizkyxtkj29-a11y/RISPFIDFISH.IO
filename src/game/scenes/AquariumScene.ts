import Phaser from 'phaser';
import { storage } from '../../services/storageService';
import { AssetGenerator } from '../../utils/assetGenerator';
import { FishSprite } from '../entities/FishSprite';
import { FoodParticle } from '../entities/FoodParticle';
import { BubbleSystem } from '../entities/BubbleSystem';
import { AquariumBackground } from '../entities/AquariumBackground';
import { PlayerFish } from '../../types/game';

export class AquariumScene extends Phaser.Scene {
  private bg!: AquariumBackground;
  private bubbleSystem!: BubbleSystem;
  private fishSprites: Map<string, FishSprite> = new Map();
  private foodParticles: FoodParticle[] = [];

  private lastTickTime: number = 0;
  private unsubscribeStorage?: () => void;
  public onInspectFish?: (fish: PlayerFish) => void;

  constructor() {
    super({ key: 'AquariumScene' });
  }

  public preload(): void {
    // Generate all procedural assets into Phaser's Texture Manager
    AssetGenerator.initPhaserTextures(this);
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Environment & Background
    this.bg = new AquariumBackground(this);
    this.bg.render(width, height);

    // 2. Bubble System
    this.bubbleSystem = new BubbleSystem(this);
    this.bubbleSystem.setAeratorPosition(width * 0.88);

    // 3. Pointer interaction: click in aquarium to drop food flakes
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Avoid triggering when clicking UI overlay elements
      if (pointer.y > 60 && pointer.y < height - 70) {
        this.dropFood(pointer.x, pointer.y);
      }
    });

    // 4. Initial Fish Population
    this.syncFishWithStorage();

    // 5. Subscribe to storage updates
    this.unsubscribeStorage = storage.subscribe(() => {
      this.syncFishWithStorage();
      this.bg.render(this.scale.width, this.scale.height);
    });

    // 6. Handle Window Resize
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    this.bg.render(width, height);
    this.bubbleSystem.setAeratorPosition(width * 0.88);

    const sandY = height - Math.max(90, height * 0.18);
    this.fishSprites.forEach((sprite) => {
      sprite.setBounds(60, width - 60, 60, sandY - 20);
    });
  }

  public dropFood(x: number, y: number): void {
    storage.feedAquarium();
    // Spawn 3-5 falling flakes around pointer
    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * 35;
      const offsetY = (Math.random() - 0.5) * 15;
      const flake = new FoodParticle(this, x + offsetX, y + offsetY);
      this.foodParticles.push(flake);
    }
  }

  private syncFishWithStorage(): void {
    const activeFish = storage.getFishList().filter((f) => f.inAquarium);
    const activeIds = new Set(activeFish.map((f) => f.id));

    // Remove sprites no longer owned / in aquarium
    this.fishSprites.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.fishSprites.delete(id);
      }
    });

    const { width, height } = this.scale;
    const sandY = height - Math.max(90, height * 0.18);

    // Add or update sprites
    activeFish.forEach((fish) => {
      if (this.fishSprites.has(fish.id)) {
        this.fishSprites.get(fish.id)!.syncData(fish);
      } else {
        const startX = Phaser.Math.Between(100, Math.max(200, width - 100));
        const startY = Phaser.Math.Between(100, Math.max(150, sandY - 50));
        const sprite = new FishSprite(this, fish, startX, startY);
        sprite.setBounds(60, width - 60, 60, sandY - 20);

        sprite.onClickCallback = (clickedFish) => {
          if (this.onInspectFish) {
            this.onInspectFish(clickedFish);
          }
        };

        this.fishSprites.set(fish.id, sprite);
      }
    });
  }

  public update(time: number, delta: number): void {
    const { width, height } = this.scale;
    const sandY = height - Math.max(90, height * 0.18);

    // 1. Update Background Caustics & Plants
    this.bg.update(time, width, height);

    // 2. Update Bubbles
    this.bubbleSystem.update(time, delta, 25, width, sandY);

    // 3. Update Food Particles
    for (let i = this.foodParticles.length - 1; i >= 0; i--) {
      const f = this.foodParticles[i];
      if (!f.active || f.isEaten) {
        this.foodParticles.splice(i, 1);
      } else {
        f.update(time, delta, sandY);
      }
    }

    // 4. Update Fish Swimming
    this.fishSprites.forEach((sprite) => {
      sprite.update(time, delta, this.foodParticles);
    });

    // 5. Periodic Game State Tick (every 1.0s for smooth real-time timer)
    if (time - this.lastTickTime >= 1000) {
      const elapsedSeconds = (time - this.lastTickTime) / 1000;
      this.lastTickTime = time;
      storage.tick(elapsedSeconds);
    }
  }

  public destroy(): void {
    if (this.unsubscribeStorage) {
      this.unsubscribeStorage();
    }
    this.scale.off('resize', this.handleResize, this);
    this.bubbleSystem.destroy();
  }
}
