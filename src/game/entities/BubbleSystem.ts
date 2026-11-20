import Phaser from 'phaser';
import { storage } from '../../services/storageService';
import { AquariumBackground } from './AquariumBackground';

export class BubbleSystem {
  private scene: Phaser.Scene;
  private bubbles: Phaser.GameObjects.Sprite[] = [];
  private aeratorX: number = 100;
  private timer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setAeratorPosition(x: number): void {
    this.aeratorX = x;
  }

  public update(time: number, delta: number, surfaceY: number, width: number, bottomY: number): void {
    const aq = storage.getAquarium();
    const aeratorLevel = aq.aeratorLevel || 1;

    // Spawn interval dynamically speeds up with aerator level
    // Level 1: 220ms, Level 2: 150ms, Level 3: 100ms, Level 4: 70ms, Level 5: 45ms
    const intervalMap = [220, 220, 150, 100, 70, 45];
    const spawnInterval = intervalMap[Math.min(5, aeratorLevel)];

    this.timer += delta;
    if (this.timer >= spawnInterval) {
      this.timer = 0;
      this.spawnBubble(width, bottomY, aeratorLevel);
    }

    // Update active bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const speed = b.getData('speed') || 60;
      const wobbleSpeed = b.getData('wobble') || 2;
      const initialX = b.getData('initialX') || b.x;

      b.y -= speed * (delta / 1000);
      b.x = initialX + Math.sin(time * 0.003 * wobbleSpeed + b.y * 0.05) * 8;

      if (b.y <= surfaceY) {
        this.popBubble(b);
        this.bubbles.splice(i, 1);
      }
    }
  }

  private spawnBubble(width: number, bottomY: number, level: number): void {
    const aq = storage.getAquarium();
    const theme = aq.theme || 'nature';
    const streams = AquariumBackground.getDiffuserPositions(theme, width, level);

    let spawnX: number;
    if (streams && streams.length > 0) {
      const picked = streams[Math.floor(Math.random() * streams.length)];
      if (level === 5 && Math.random() < 0.25) {
        // Effervescent micro-bubble wall drift
        spawnX = (width * 0.08) + Math.random() * (width * 0.84);
      } else {
        // Precise stream rising right above the physical diffuser stone
        spawnX = picked + (Math.random() - 0.5) * 16;
      }
    } else {
      spawnX = this.aeratorX + (Math.random() - 0.5) * 20;
    }

    const b = this.scene.add.sprite(spawnX, bottomY - 12, 'bubble_particle');
    
    // Level 4 and 5 have micro-bubbles and occasional large shiny bubbles
    let scale = 0.2 + Math.random() * 0.45;
    if (level >= 4 && Math.random() < 0.25) {
      scale = 0.65 + Math.random() * 0.3; // Large buoyant bubble
    } else if (level === 5 && Math.random() < 0.4) {
      scale = 0.15 + Math.random() * 0.15; // Fizzy micro bubble
    }

    b.setScale(scale);
    b.setAlpha(0.65 + (level * 0.06));
    b.setDepth(15);
    
    const baseSpeed = 45 + (level * 14);
    b.setData('speed', baseSpeed + Math.random() * 60);
    b.setData('wobble', 1 + Math.random() * 2.5);
    b.setData('initialX', spawnX);

    this.bubbles.push(b);
  }

  private popBubble(b: Phaser.GameObjects.Sprite): void {
    this.scene.tweens.add({
      targets: b,
      scaleX: b.scaleX * 1.5,
      scaleY: b.scaleY * 1.5,
      alpha: 0,
      duration: 90,
      onComplete: () => {
        b.destroy();
      }
    });
  }

  public destroy(): void {
    this.bubbles.forEach((b) => b.destroy());
    this.bubbles = [];
  }
}
