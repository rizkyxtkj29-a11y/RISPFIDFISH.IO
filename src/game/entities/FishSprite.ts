import Phaser from 'phaser';
import { PlayerFish, FishSpecies } from '../../types/game';
import { SPECIES_MAP } from '../../data/fishSpecies';
import { FoodParticle } from './FoodParticle';
import { sound } from '../../services/soundService';

export class FishSprite extends Phaser.GameObjects.Container {
  public fishData: PlayerFish;
  public species: FishSpecies;

  private bodySprite: Phaser.GameObjects.Sprite;
  private nameText: Phaser.GameObjects.Text;
  private timerBadgeText: Phaser.GameObjects.Text;
  private statusIcon?: Phaser.GameObjects.Text;

  private targetX: number = 0;
  private targetY: number = 0;
  private speed: number = 80;
  private isFacingRight: boolean = true;
  private swimTimer: number = 0;
  private nextDecisionTime: number = 0;
  private currentScale: number = 0.4;

  private bounds = { minX: 80, maxX: 900, minY: 100, maxY: 520 };
  public onClickCallback?: (fish: PlayerFish) => void;

  constructor(scene: Phaser.Scene, fishData: PlayerFish, x: number, y: number) {
    super(scene, x, y);
    this.fishData = fishData;
    this.species = SPECIES_MAP.get(fishData.speciesId) || SPECIES_MAP.get('tiger_barb')!;
    this.speed = this.species.swimSpeed || 80;

    scene.add.existing(this);
    this.setDepth(20);

    // 1. Body Sprite
    const texKey = `fish_${this.species.id}`;
    this.bodySprite = scene.add.sprite(0, 0, texKey);
    this.add(this.bodySprite);

    // 2. Nickname Text Label
    this.nameText = scene.add.text(0, -32, this.fishData.nickname, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#0B5367',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    this.add(this.nameText);

    // 3. Timer & Adult Ready Badge (Menentukan kapan dewasa dan bisa dijual)
    this.timerBadgeText = scene.add.text(0, -18, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#FFD166',
      stroke: '#0B5367',
      strokeThickness: 2.5,
      backgroundColor: 'rgba(11, 83, 103, 0.85)',
      padding: { x: 5, y: 2 },
      align: 'center'
    }).setOrigin(0.5);
    this.add(this.timerBadgeText);

    // 4. Status icon (Hungry / Sick indicators)
    this.statusIcon = scene.add.text(28, -32, '', {
      fontSize: '14px'
    }).setOrigin(0.5);
    this.add(this.statusIcon);

    // Apply stage scale (After text labels & badges exist)
    this.updateScale();

    // Interactivity
    this.setSize(100, 60);
    this.setInteractive({ cursor: 'pointer' });
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.onClicked();
    });

    // Random initial target
    this.pickNewTarget();
    this.nextDecisionTime = 2000 + Math.random() * 3000;
  }

  public setBounds(minX: number, maxX: number, minY: number, maxY: number): void {
    const halfW = (260 * (this.currentScale || 0.4)) / 2;
    const halfH = (150 * (this.currentScale || 0.4)) / 2;
    this.bounds = {
      minX: Math.max(30, minX + halfW * 0.4),
      maxX: Math.min(maxX, maxX - halfW * 0.4),
      minY: Math.max(45, minY + halfH * 0.3),
      maxY: Math.max(minY + 50, maxY - halfH * 0.3)
    };
  }

  private updateScale(): void {
    const maxSize = this.species.maxSizeCm || 10;
    let actualCm = this.fishData.currentSizeCm;

    // Biological centimeter verification
    if (!actualCm || actualCm <= 0) {
      if (this.fishData.stage === 'adult') {
        actualCm = maxSize;
      } else if (this.fishData.stage === 'medium') {
        actualCm = Math.round(maxSize * 0.65 * 10) / 10;
      } else {
        const progress = Math.min(1, Math.max(0, (this.fishData.ageSeconds || 0) / (this.species.growthTimeSeconds || 120)));
        actualCm = Math.round((maxSize * (0.32 + 0.68 * progress)) * 10) / 10;
      }
    }

    // Realistic biological on-screen length calculation (in pixels)
    // Medaka 3.5cm -> ~46px, Sumatra 7cm -> ~71px, Botia 15cm -> ~116px, Channa 35cm -> ~200px, Arwana 70cm -> ~311px
    const targetLengthPx = Math.max(28, Math.pow(actualCm, 0.64) * 20.5);

    // AssetGenerator creates fish texture with a ~260px wide body inside 320x180 canvas
    const targetScale = targetLengthPx / 260;
    this.currentScale = targetScale;
    this.bodySprite.setScale(targetScale);

    // Height of texture body is ~150px at scale 1.0
    const visualHalfH = (150 * targetScale) / 2;
    const visualHalfW = (260 * targetScale) / 2;

    // Float labels & badges gracefully above fish without obscuring high dorsal fins or bodies
    const badgeY = -visualHalfH - 10;
    const nameY = badgeY - 14;

    if (this.timerBadgeText) this.timerBadgeText.setPosition(0, badgeY);
    if (this.nameText) this.nameText.setPosition(0, nameY);
    if (this.statusIcon) this.statusIcon.setPosition(Math.min(50, visualHalfW * 0.65), nameY);

    // Interactive hitbox adapts to fish size
    const hitW = Math.max(55, visualHalfW * 1.8);
    const hitH = Math.max(38, visualHalfH * 2.2);
    this.setSize(hitW, hitH);
  }

  private pickNewTarget(): void {
    this.targetX = Phaser.Math.Between(this.bounds.minX, this.bounds.maxX);
    this.targetY = Phaser.Math.Between(this.bounds.minY, this.bounds.maxY);
  }

  public update(time: number, delta: number, activeFoods: FoodParticle[]): void {
    const dt = delta / 1000;
    this.swimTimer += delta;

    // Check if food is available and fish is hungry
    let chasedFood: FoodParticle | null = null;
    if (this.fishData.hunger < 95 && activeFoods.length > 0) {
      let minDist = 400;
      for (const food of activeFoods) {
        if (!food.isEaten && food.active) {
          const d = Phaser.Math.Distance.Between(this.x, this.y, food.x, food.y);
          if (d < minDist) {
            minDist = d;
            chasedFood = food;
          }
        }
      }
    }

    if (chasedFood) {
      this.targetX = chasedFood.x;
      this.targetY = chasedFood.y;

      // Eat food when reached
      const distToFood = Phaser.Math.Distance.Between(this.x, this.y, chasedFood.x, chasedFood.y);
      const eatDistance = Math.max(22, (260 * this.currentScale) * 0.28);
      if (distToFood < eatDistance) {
        chasedFood.isEaten = true;
        chasedFood.destroy();
        this.fishData.hunger = Math.min(100, this.fishData.hunger + 15);
        this.fishData.health = Math.min(100, this.fishData.health + 5);
        sound.playBubble();
        this.emitHeartBubble();
        this.pickNewTarget();
      }
    } else {
      // Normal wandering
      if (this.swimTimer >= this.nextDecisionTime) {
        this.swimTimer = 0;
        this.nextDecisionTime = 2500 + Math.random() * 4000;
        this.pickNewTarget();
      }
    }

    // Move towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      const currentSpeed = chasedFood ? this.speed * 1.5 : this.speed;
      const vx = (dx / dist) * currentSpeed;
      const vy = (dy / dist) * currentSpeed;

      this.x += vx * dt;
      this.y += vy * dt;

      // Orientation
      const shouldFaceRight = vx > 0;
      if (shouldFaceRight !== this.isFacingRight) {
        this.isFacingRight = shouldFaceRight;
        this.flipFish(shouldFaceRight);
      }

      // Tail and body swimming motion
      const waggleFreq = chasedFood ? 0.015 : 0.008;
      const waggleAmt = Math.sin(time * waggleFreq) * 0.08;
      this.bodySprite.setRotation((vy / currentSpeed) * 0.25 + waggleAmt);
    } else {
      this.pickNewTarget();
    }

    // Status display update
    this.updateStatusDisplay();
  }

  private flipFish(faceRight: boolean): void {
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: 0,
      duration: 80,
      yoyo: true,
      onYoyo: () => {
        this.bodySprite.setFlipX(!faceRight);
      },
      onComplete: () => {
        this.bodySprite.scaleX = this.currentScale;
      }
    });
  }

  private updateStatusDisplay(): void {
    if (this.fishData.health < 40) {
      this.bodySprite.setTint(0x99DDAA);
      this.statusIcon?.setText('🩹');
    } else if (this.fishData.hunger < 25) {
      this.bodySprite.clearTint();
      this.statusIcon?.setText('💭');
    } else {
      this.bodySprite.clearTint();
      this.statusIcon?.setText('');
    }

    // Timer & Status Badge (Menentukan kapan berukuran dewasa dan siap dijual)
    if (this.fishData.stage === 'adult') {
      this.timerBadgeText.setText('💰 SIAP JUAL');
      this.timerBadgeText.setColor('#80ED99');
      this.timerBadgeText.setStroke('#0B5367', 3);
      this.timerBadgeText.setBackgroundColor('rgba(11, 83, 103, 0.90)');
    } else {
      const remaining = Math.max(0, Math.ceil(this.species.growthTimeSeconds - this.fishData.ageSeconds));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (this.fishData.hunger <= 30) {
        this.timerBadgeText.setText(`⚠️ Lapar: ${timeStr}`);
        this.timerBadgeText.setColor('#FF758F');
        this.timerBadgeText.setStroke('#4A0E17', 3);
        this.timerBadgeText.setBackgroundColor('rgba(50, 10, 20, 0.90)');
      } else {
        this.timerBadgeText.setText(`⏳ ${timeStr}`);
        this.timerBadgeText.setColor('#FFD166');
        this.timerBadgeText.setStroke('#0B5367', 3);
        this.timerBadgeText.setBackgroundColor('rgba(11, 83, 103, 0.85)');
      }
    }
  }

  public onClicked(): void {
    sound.playBubble();
    this.emitHeartBubble();

    // Friendly bounce animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 15,
      yoyo: true,
      duration: 150,
      ease: 'Quad.easeInOut'
    });

    if (this.onClickCallback) {
      this.onClickCallback(this.fishData);
    }
  }

  private emitHeartBubble(): void {
    const bubble = this.scene.add.text(this.x, this.y - 30, '✨', { fontSize: '18px' });
    bubble.setDepth(30);
    this.scene.tweens.add({
      targets: bubble,
      y: bubble.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => bubble.destroy()
    });
  }

  public syncData(freshData: PlayerFish): void {
    this.fishData = freshData;
    this.nameText.setText(freshData.nickname);
    this.updateScale();
  }
}
