import Phaser from 'phaser';

export class FoodParticle extends Phaser.GameObjects.Sprite {
  public vy: number = 30 + Math.random() * 20;
  public vx: number = (Math.random() - 0.5) * 15;
  public isEaten: boolean = false;
  public lifetime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'food_flake');
    scene.add.existing(this);
    this.setScale(0.85 + Math.random() * 0.3);
    this.setAlpha(0.9);
  }

  public update(time: number, delta: number, bottomY: number): void {
    if (this.isEaten) return;
    const dt = delta / 1000;
    this.lifetime += dt;

    this.y += this.vy * dt;
    this.x += Math.sin(time * 0.003 + this.y * 0.05) * 12 * dt;

    // Settle on bottom
    if (this.y >= bottomY - 10) {
      this.y = bottomY - 10;
      this.vy = 0;
      this.vx = 0;
      // Dissolve after 15 seconds if not eaten
      if (this.lifetime > 15) {
        this.destroy();
      }
    }
  }
}
