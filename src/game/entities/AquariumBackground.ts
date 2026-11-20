import Phaser from 'phaser';
import { storage } from '../../services/storageService';

export class AquariumBackground {
  private scene: Phaser.Scene;
  private bgGraphics: Phaser.GameObjects.Graphics;
  private causticsGraphics: Phaser.GameObjects.Graphics;
  private sandGraphics: Phaser.GameObjects.Graphics;
  private hardwareGraphics: Phaser.GameObjects.Graphics;
  private decorationSprites: Phaser.GameObjects.Sprite[] = [];
  private hardwareSprites: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.setDepth(0);

    this.causticsGraphics = scene.add.graphics();
    this.causticsGraphics.setDepth(2);

    this.sandGraphics = scene.add.graphics();
    this.sandGraphics.setDepth(5);

    this.hardwareGraphics = scene.add.graphics();
    this.hardwareGraphics.setDepth(9);
  }

  public render(width: number, height: number): void {
    const aquarium = storage.getAquarium();
    const theme = (aquarium.theme || 'nature').toLowerCase();

    // 1. CLEAR GRAPHICS
    this.bgGraphics.clear();
    this.sandGraphics.clear();
    this.hardwareGraphics.clear();

    // 2. RENDER THEMED WATER BACKGROUND & HORIZON
    this.renderThemedBackground(width, height, theme, aquarium.waterQuality, aquarium.filterLevel);

    // 3. RENDER THEMED SUBSTRATE (Sand / Aqua-soil / Carpet Grass / Terraces)
    const sandHeight = Math.max(90, height * 0.18);
    const sandY = height - sandHeight;
    this.renderThemedSubstrate(width, height, sandY, sandHeight, theme);

    // 4. RENDER THEMED HARDSCAPE (Stones / Driftwood / Dutch Streets / Roots / Biotope)
    this.renderThemedHardscape(width, height, sandY, theme, aquarium.capacity || 8);

    // 5. REBUILD PHYSICAL HARDWARE (Aerators, Filters, LED)
    this.rebuildHardware(width, height, sandY, aquarium, theme);

    // 6. REBUILD USER DECORATIONS
    this.rebuildDecorations(width, height, sandY, aquarium, theme);
  }

  /**
   * 1. Themed Water Background & Horizon Lighting
   */
  private renderThemedBackground(
    width: number,
    height: number,
    theme: string,
    waterQuality: number,
    filterLevel: number
  ): void {
    const qRatio = waterQuality / 100;
    const filterBonus = (filterLevel - 1) * 0.05;
    const effectiveRatio = Math.min(1, qRatio + filterBonus);

    let topHex = 0x0C3B2E;
    let botHex = 0x16869A;

    if (theme === 'iwagumi') {
      // Iwagumi Style: Minimalist, crystal-clear serene sky-water gradient
      const topCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x023E8A),
        Phaser.Display.Color.ValueToColor(0x0077B6),
        100,
        effectiveRatio * 100
      );
      const botCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0096C7),
        Phaser.Display.Color.ValueToColor(0x48CAE4),
        100,
        effectiveRatio * 100
      );
      topHex = Phaser.Display.Color.GetColor(topCol.r, topCol.g, topCol.b);
      botHex = Phaser.Display.Color.GetColor(botCol.r, botCol.g, botCol.b);

      this.bgGraphics.fillGradientStyle(topHex, topHex, botHex, botHex, 1);
      this.bgGraphics.fillRect(0, 0, width, height);

      // Clean Zen sky-glow at upper horizon
      this.bgGraphics.fillStyle(0xADE8F4, 0.22);
      this.bgGraphics.fillRect(0, 0, width, height * 0.4);

      // Pristine water surface ripple
      this.bgGraphics.fillStyle(0xFFFFFF, 0.35);
      this.bgGraphics.fillRect(0, 0, width, 16);
      this.bgGraphics.fillStyle(0xCAF0F8, 0.22);
      this.bgGraphics.fillRect(0, 16, width, 12);
    } else if (theme === 'dutch') {
      // Dutch Style: Deep botanical exhibition teal highlighting vibrant red & green plant contrast
      const topCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x08252B),
        Phaser.Display.Color.ValueToColor(0x0B3C49),
        100,
        effectiveRatio * 100
      );
      const botCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x104550),
        Phaser.Display.Color.ValueToColor(0x1A6B7A),
        100,
        effectiveRatio * 100
      );
      topHex = Phaser.Display.Color.GetColor(topCol.r, topCol.g, topCol.b);
      botHex = Phaser.Display.Color.GetColor(botCol.r, botCol.g, botCol.b);

      this.bgGraphics.fillGradientStyle(topHex, topHex, botHex, botHex, 1);
      this.bgGraphics.fillRect(0, 0, width, height);

      // Subtle warm botanical gallery sunbeams
      this.bgGraphics.fillStyle(0xFFEAA7, 0.08);
      this.bgGraphics.fillRect(width * 0.15, 0, width * 0.2, height);
      this.bgGraphics.fillRect(width * 0.65, 0, width * 0.2, height);

      this.bgGraphics.fillStyle(0xFFFFFF, 0.28);
      this.bgGraphics.fillRect(0, 0, width, 16);
      this.bgGraphics.fillStyle(0x80ED99, 0.16);
      this.bgGraphics.fillRect(0, 16, width, 12);
    } else if (theme === 'jungle') {
      // Jungle Style: Mysterious, primal tropical rainforest canopy water
      const topCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x02130E),
        Phaser.Display.Color.ValueToColor(0x06281E),
        100,
        effectiveRatio * 100
      );
      const botCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0A3326),
        Phaser.Display.Color.ValueToColor(0x13533D),
        100,
        effectiveRatio * 100
      );
      topHex = Phaser.Display.Color.GetColor(topCol.r, topCol.g, topCol.b);
      botHex = Phaser.Display.Color.GetColor(botCol.r, botCol.g, botCol.b);

      this.bgGraphics.fillGradientStyle(topHex, topHex, botHex, botHex, 1);
      this.bgGraphics.fillRect(0, 0, width, height);

      // Dark hanging jungle canopy vine shadows from water surface
      this.bgGraphics.fillStyle(0x041712, 0.6);
      for (let i = 0; i < 7; i++) {
        const vx = (width / 7) * i + 35;
        const vLen = 60 + ((i * 37) % 65);
        this.bgGraphics.fillRect(vx, 0, 8, vLen);
      }

      this.bgGraphics.fillStyle(0xFFFFFF, 0.2);
      this.bgGraphics.fillRect(0, 0, width, 14);
      this.bgGraphics.fillStyle(0x52B788, 0.2);
      this.bgGraphics.fillRect(0, 14, width, 14);
    } else if (theme === 'biotope') {
      // Biotope Style: Authentic Indonesian Blackwater / Peat Swamp tannin-rich amber glow
      const topCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x2E1703),
        Phaser.Display.Color.ValueToColor(0x452306),
        100,
        effectiveRatio * 100
      );
      const botCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x613508),
        Phaser.Display.Color.ValueToColor(0x8A4B0E),
        100,
        effectiveRatio * 100
      );
      topHex = Phaser.Display.Color.GetColor(topCol.r, topCol.g, topCol.b);
      botHex = Phaser.Display.Color.GetColor(botCol.r, botCol.g, botCol.b);

      this.bgGraphics.fillGradientStyle(topHex, topHex, botHex, botHex, 1);
      this.bgGraphics.fillRect(0, 0, width, height);

      // Rich golden amber tea-water volumetric warmth
      this.bgGraphics.fillStyle(0xFFA200, 0.08);
      this.bgGraphics.fillRect(0, height * 0.25, width, height * 0.5);

      this.bgGraphics.fillStyle(0xFFFFFF, 0.22);
      this.bgGraphics.fillRect(0, 0, width, 16);
      this.bgGraphics.fillStyle(0xFFD166, 0.22);
      this.bgGraphics.fillRect(0, 16, width, 14);
    } else {
      // Nature Style (Takashi Amano Mountain Canyon / Valley):
      // Clean, bright illuminated backdrop with central sunbeams like the reference aquascape photo!
      const topCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xDCF2F7),
        Phaser.Display.Color.ValueToColor(0xFAFDFE),
        100,
        effectiveRatio * 100
      );
      const botCol = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x6EA7B4),
        Phaser.Display.Color.ValueToColor(0xA5D8E2),
        100,
        effectiveRatio * 100
      );
      topHex = Phaser.Display.Color.GetColor(topCol.r, topCol.g, topCol.b);
      botHex = Phaser.Display.Color.GetColor(botCol.r, botCol.g, botCol.b);

      this.bgGraphics.fillGradientStyle(topHex, topHex, botHex, botHex, 1);
      this.bgGraphics.fillRect(0, 0, width, height);

      // Soft sunlit backlight glow in the central valley (canyon notch light)
      this.bgGraphics.fillStyle(0xFFFFFF, 0.45);
      this.bgGraphics.fillRect(width * 0.35, 0, width * 0.30, height * 0.7);

      // Volumetric god rays breaking down through the water into the canyon opening
      this.bgGraphics.fillStyle(0xFFFFFF, 0.14);
      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(width * 0.40, 0);
      this.bgGraphics.lineTo(width * 0.52, height * 0.75);
      this.bgGraphics.lineTo(width * 0.46, height * 0.75);
      this.bgGraphics.lineTo(width * 0.36, 0);
      this.bgGraphics.closePath();
      this.bgGraphics.fill();

      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(width * 0.58, 0);
      this.bgGraphics.lineTo(width * 0.56, height * 0.75);
      this.bgGraphics.lineTo(width * 0.50, height * 0.75);
      this.bgGraphics.lineTo(width * 0.50, 0);
      this.bgGraphics.closePath();
      this.bgGraphics.fill();

      // Background dense stem plant hills (Rotala rotundifolia & H'ra red tips)
      // Left high stem plant hill
      this.bgGraphics.fillStyle(0x234E20, 0.75);
      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(0, height * 0.7);
      this.bgGraphics.lineTo(0, height * 0.16);
      this.bgGraphics.lineTo(width * 0.10, height * 0.14);
      this.bgGraphics.lineTo(width * 0.20, height * 0.18);
      this.bgGraphics.lineTo(width * 0.30, height * 0.32);
      this.bgGraphics.lineTo(width * 0.36, height * 0.48);
      this.bgGraphics.lineTo(width * 0.36, height);
      this.bgGraphics.lineTo(0, height);
      this.bgGraphics.closePath();
      this.bgGraphics.fill();

      // Right high stem plant hill
      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(width, height * 0.7);
      this.bgGraphics.lineTo(width, height * 0.14);
      this.bgGraphics.lineTo(width * 0.90, height * 0.12);
      this.bgGraphics.lineTo(width * 0.80, height * 0.16);
      this.bgGraphics.lineTo(width * 0.70, height * 0.30);
      this.bgGraphics.lineTo(width * 0.62, height * 0.48);
      this.bgGraphics.lineTo(width * 0.62, height);
      this.bgGraphics.lineTo(width, height);
      this.bgGraphics.closePath();
      this.bgGraphics.fill();

      // Fiery reddish-orange Rotala H'ra tips near the surface (as seen in the reference photo!)
      this.bgGraphics.fillStyle(0xB83A28, 0.65);
      this.bgGraphics.fillEllipse(width * 0.15, height * 0.17, width * 0.19, 22);
      this.bgGraphics.fillEllipse(width * 0.85, height * 0.15, width * 0.19, 24);
      this.bgGraphics.fillStyle(0xE05A3A, 0.55);
      this.bgGraphics.fillEllipse(width * 0.12, height * 0.15, width * 0.15, 16);
      this.bgGraphics.fillEllipse(width * 0.88, height * 0.13, width * 0.15, 18);

      // Water surface rim
      this.bgGraphics.fillStyle(0xFFFFFF, 0.45);
      this.bgGraphics.fillRect(0, 0, width, 14);
      this.bgGraphics.fillStyle(0xCAF0F8, 0.25);
      this.bgGraphics.fillRect(0, 14, width, 12);
    }
  }

  /**
   * 2. Themed Substrate & Bottom Ground
   */
  private renderThemedSubstrate(
    width: number,
    height: number,
    sandY: number,
    sandHeight: number,
    theme: string
  ): void {
    if (theme === 'iwagumi') {
      // Iwagumi Substrate: Volcanic Amazonia dark aqua-soil completely carpeted with Monte Carlo / Glossostigma
      // Dark aqua soil base
      this.sandGraphics.fillStyle(0x1E232A, 1);
      this.sandGraphics.fillRect(0, sandY + 16, width, sandHeight);

      // Vibrant, thick unbroken green carpet grass across the entire bottom
      this.sandGraphics.fillStyle(0x2D6A4F, 1);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(0, sandY + 6);
      const waveCount = 9;
      for (let i = 0; i <= waveCount; i++) {
        const segX = (width / waveCount) * i;
        const segY = sandY + (i % 2 === 0 ? 0 : 8);
        this.sandGraphics.lineTo(segX, segY);
      }
      this.sandGraphics.lineTo(width, height);
      this.sandGraphics.lineTo(0, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Fluffy carpet grass top highlight layer (#70E000 / #38B000)
      this.sandGraphics.fillStyle(0x70E000, 0.85);
      for (let i = 0; i <= waveCount * 3; i++) {
        const gx = (width / (waveCount * 3)) * i;
        const gy = sandY + (i % 2 === 0 ? 2 : 6);
        this.sandGraphics.fillEllipse(gx, gy, 18, 9);
      }

      // Small tufts of Monte Carlo grass blades along the crest
      this.sandGraphics.fillStyle(0x80ED99, 1);
      for (let x = 15; x < width; x += 32) {
        this.sandGraphics.fillTriangle(x - 3, sandY + 4, x, sandY - 6, x + 3, sandY + 4);
      }
    } else if (theme === 'dutch') {
      // Dutch Substrate: Terraced rich dark peat with stepped manicured levels
      this.sandGraphics.fillStyle(0x2B1A0E, 1);
      this.sandGraphics.fillRect(0, sandY + 24, width, sandHeight);

      // Terraced stepped substrate shelves
      this.sandGraphics.fillStyle(0x422B1B, 1);
      this.sandGraphics.fillRect(0, sandY + 8, width * 0.35, sandHeight);
      this.sandGraphics.fillRect(width * 0.65, sandY + 6, width * 0.35, sandHeight);

      // Center sunken avenue (Dutch plant street pathway)
      this.sandGraphics.fillStyle(0x563824, 0.9);
      this.sandGraphics.fillRect(width * 0.32, sandY + 16, width * 0.36, sandHeight);
    } else if (theme === 'jungle') {
      // Jungle Substrate: Wild organic dark river bottom with decaying organic sediment
      this.sandGraphics.fillStyle(0x382516, 1);
      this.sandGraphics.fillRect(0, sandY + 18, width, sandHeight);

      this.sandGraphics.fillStyle(0x4E3522, 1);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(0, sandY + 4);
      for (let i = 0; i <= 6; i++) {
        const segX = (width / 6) * i;
        const segY = sandY + (i % 2 === 0 ? 0 : 10);
        this.sandGraphics.lineTo(segX, segY);
      }
      this.sandGraphics.lineTo(width, height);
      this.sandGraphics.lineTo(0, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Silt patches and dark gravel spots
      this.sandGraphics.fillStyle(0x23160D, 0.7);
      for (let i = 0; i < 8; i++) {
        this.sandGraphics.fillEllipse((width / 9) * (i + 1), sandY + 20, 24, 8);
      }
    } else if (theme === 'biotope') {
      // Biotope Substrate: Light natural silica river sand with real Ketapang (almond) leaves
      this.sandGraphics.fillStyle(0xD8C29D, 1);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(0, sandY);
      for (let i = 0; i <= 6; i++) {
        const segX = (width / 6) * i;
        const segY = sandY + (i % 2 === 0 ? 0 : 6);
        this.sandGraphics.lineTo(segX, segY);
      }
      this.sandGraphics.lineTo(width, height);
      this.sandGraphics.lineTo(0, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      this.sandGraphics.fillStyle(0xC4AB82, 0.8);
      this.sandGraphics.fillRect(0, sandY + 20, width, sandHeight - 20);

      // Fallen dry Ketapang leaves resting on the silica sand bed
      const leaves = [
        { x: width * 0.18, y: sandY + 14, w: 38, h: 18, angle: -0.2 },
        { x: width * 0.44, y: sandY + 22, w: 44, h: 20, angle: 0.15 },
        { x: width * 0.76, y: sandY + 16, w: 40, h: 19, angle: -0.1 }
      ];
      leaves.forEach((lf) => {
        // Shadow
        this.sandGraphics.fillStyle(0x000000, 0.28);
        this.sandGraphics.fillEllipse(lf.x + 2, lf.y + 3, lf.w, lf.h * 0.8);
        // Dry almond leaf body (Brown tannin color)
        this.sandGraphics.fillStyle(0x6A3816, 1);
        this.sandGraphics.fillEllipse(lf.x, lf.y, lf.w, lf.h);
        // Leaf midrib vein
        this.sandGraphics.fillStyle(0x3E1E09, 0.9);
        this.sandGraphics.fillRect(lf.x - lf.w * 0.45, lf.y - 1, lf.w * 0.9, 2);
      });
    } else {
      // Nature Style: Rolling green Monte Carlo carpet with central winding white silica sand path!
      // 1. Dark aqua-soil base
      this.sandGraphics.fillStyle(0x1F241A, 1);
      this.sandGraphics.fillRect(0, sandY + 10, width, sandHeight);

      // 2. Thick green Monte Carlo carpet on left and right
      this.sandGraphics.fillStyle(0x2D6A4F, 1);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(0, sandY - 8);
      this.sandGraphics.lineTo(width * 0.38, sandY + 8);
      this.sandGraphics.lineTo(width * 0.42, height);
      this.sandGraphics.lineTo(0, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width, sandY - 6);
      this.sandGraphics.lineTo(width * 0.62, sandY + 10);
      this.sandGraphics.lineTo(width * 0.58, height);
      this.sandGraphics.lineTo(width, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // 3. Central Winding Cosmetic Silica Sand Path (The Takashi Amano Canyon Path)
      // Disappears in perspective into the misty canyon gorge
      this.sandGraphics.fillStyle(0x000000, 0.22);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width * 0.48, sandY - 26);
      this.sandGraphics.lineTo(width * 0.52, sandY - 26);
      this.sandGraphics.lineTo(width * 0.60, height);
      this.sandGraphics.lineTo(width * 0.40, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Pristine White Silica Sand Path with realistic winding S-curve
      this.sandGraphics.fillStyle(0xFFFEF7, 1);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width * 0.49, sandY - 24);
      this.sandGraphics.lineTo(width * 0.48, sandY);
      this.sandGraphics.lineTo(width * 0.46, sandY + 25);
      this.sandGraphics.lineTo(width * 0.44, sandY + 55);
      this.sandGraphics.lineTo(width * 0.43, height);
      this.sandGraphics.lineTo(width * 0.57, height);
      this.sandGraphics.lineTo(width * 0.56, sandY + 55);
      this.sandGraphics.lineTo(width * 0.54, sandY + 25);
      this.sandGraphics.lineTo(width * 0.52, sandY);
      this.sandGraphics.lineTo(width * 0.51, sandY - 24);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Soft warm sand grain shading
      this.sandGraphics.fillStyle(0xECE3CE, 0.6);
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width * 0.485, sandY);
      this.sandGraphics.lineTo(width * 0.515, sandY);
      this.sandGraphics.lineTo(width * 0.555, height);
      this.sandGraphics.lineTo(width * 0.445, height);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Tiny river gravel pebbles bordering the path
      const pathPebbles = [
        { x: width * 0.43, y: sandY + 16, r: 3 },
        { x: width * 0.42, y: sandY + 36, r: 4 },
        { x: width * 0.44, y: sandY + 60, r: 5 },
        { x: width * 0.57, y: sandY + 22, r: 3.5 },
        { x: width * 0.58, y: sandY + 44, r: 4.5 },
        { x: width * 0.56, y: sandY + 70, r: 5 }
      ];
      this.sandGraphics.fillStyle(0x7D6853, 0.85);
      pathPebbles.forEach((p) => this.sandGraphics.fillCircle(p.x, p.y, p.r));

      // Vibrant Monte Carlo / Hydrocotyle clover leaf clusters along the green banks
      this.sandGraphics.fillStyle(0x70E000, 0.9);
      for (let i = 0; i < 18; i++) {
        const lx = (width * 0.38 / 18) * i;
        const ly = sandY + (i % 2 === 0 ? 4 : 10);
        this.sandGraphics.fillEllipse(lx, ly, 14, 7);
      }
      for (let i = 0; i < 18; i++) {
        const rx = width * 0.62 + ((width * 0.38) / 18) * i;
        const ry = sandY + (i % 2 === 0 ? 5 : 12);
        this.sandGraphics.fillEllipse(rx, ry, 14, 7);
      }

      // Creeping Hydrocotyle tripartita clovers spilling slightly onto the path edge!
      this.sandGraphics.fillStyle(0x80ED99, 1);
      this.sandGraphics.fillCircle(width * 0.435, sandY + 25, 4);
      this.sandGraphics.fillCircle(width * 0.44, sandY + 45, 5);
      this.sandGraphics.fillCircle(width * 0.565, sandY + 30, 4.5);
      this.sandGraphics.fillCircle(width * 0.56, sandY + 55, 5.5);
    }
  }

  /**
   * 3. Themed Hardscape (Stones, Wood, Dutch Rows, Jungle Roots, Biotope Reeds)
   */
  private renderThemedHardscape(
    width: number,
    height: number,
    sandY: number,
    theme: string,
    capacity: number
  ): void {
    if (theme === 'iwagumi') {
      // --- IWAGUMI STYLE: Sanzon Iwagumi (3 Sacred Stones Formation) ---
      // Pure stones + carpet grass, strictly no wood, no tall chaotic stems
      const stones = [
        // 1. Oyaishi (Primary focal stone, towering, sharp angular, leaning at 65 degrees)
        { x: width * 0.66, y: sandY + 12, w: 90, h: 105, col: 0x2A3446, tilt: -0.25 },
        // 2. Fukuishi (Second stone, supporting, tilted counter-balancing)
        { x: width * 0.32, y: sandY + 14, w: 68, h: 72, col: 0x33415C, tilt: 0.22 },
        // 3. Soeishi (Accent stone adjacent to Oyaishi)
        { x: width * 0.79, y: sandY + 18, w: 46, h: 48, col: 0x3D4A5E, tilt: -0.15 },
        // 4. Suteishi (Sacrificial grounding stone near Fukuishi)
        { x: width * 0.21, y: sandY + 20, w: 40, h: 38, col: 0x475569, tilt: 0.3 }
      ];

      stones.forEach((st) => {
        // Shadow on carpet
        this.sandGraphics.fillStyle(0x000000, 0.45);
        this.sandGraphics.fillEllipse(st.x, st.y + 4, st.w * 0.9, st.h * 0.3);

        // Stone angular polygon body
        this.sandGraphics.fillStyle(st.col, 1);
        this.sandGraphics.beginPath();
        this.sandGraphics.moveTo(st.x - st.w * 0.5, st.y);
        this.sandGraphics.lineTo(st.x - st.w * 0.2, st.y - st.h);
        this.sandGraphics.lineTo(st.x + st.w * 0.35, st.y - st.h * 0.85);
        this.sandGraphics.lineTo(st.x + st.w * 0.5, st.y);
        this.sandGraphics.closePath();
        this.sandGraphics.fill();

        // Shaded right facet
        this.sandGraphics.fillStyle(0x1E293B, 0.65);
        this.sandGraphics.beginPath();
        this.sandGraphics.moveTo(st.x + st.w * 0.05, st.y - st.h * 0.95);
        this.sandGraphics.lineTo(st.x + st.w * 0.35, st.y - st.h * 0.85);
        this.sandGraphics.lineTo(st.x + st.w * 0.5, st.y);
        this.sandGraphics.lineTo(st.x + st.w * 0.05, st.y);
        this.sandGraphics.closePath();
        this.sandGraphics.fill();

        // White crystalline strata lines (Seiryu stone characteristic)
        this.sandGraphics.fillStyle(0xE2E8F0, 0.75);
        this.sandGraphics.fillRect(st.x - st.w * 0.25, st.y - st.h * 0.6, st.w * 0.6, 2.5);
        this.sandGraphics.fillRect(st.x - st.w * 0.15, st.y - st.h * 0.35, st.w * 0.5, 2);

        // Top specular edge highlight
        this.sandGraphics.fillStyle(0xFFFFFF, 0.35);
        this.sandGraphics.fillCircle(st.x - st.w * 0.18, st.y - st.h + 2, 4);
      });
    } else if (theme === 'dutch') {
      // --- DUTCH STYLE: Stepped Colorful Plant Terraces & Streets ---
      // Vibrant red Alternanthera, lime green Rotala, copper Ludwigia (No hardscape rock/wood)
      // A. Left Street: Vibrant Crimson Red (Alternanthera reineckii)
      const redX = width * 0.16;
      for (let r = 0; r < 5; r++) {
        const px = redX + (r * 18);
        const py = sandY - 20 - (r * 12);
        this.sandGraphics.fillStyle(0x9B2226, 1);
        this.sandGraphics.fillEllipse(px, py, 26, 38);
        this.sandGraphics.fillStyle(0xE63946, 0.85);
        this.sandGraphics.fillEllipse(px - 2, py - 4, 18, 26);
      }

      // B. Center Street: Manicured Bright Lime Green Hedges (Rotala rotundifolia)
      const limeX = width * 0.44;
      for (let l = 0; l < 6; l++) {
        const px = limeX + (l * 16) - 35;
        const py = sandY - 15 - (l % 2 === 0 ? 8 : 0);
        this.sandGraphics.fillStyle(0x38B000, 1);
        this.sandGraphics.fillEllipse(px, py, 24, 44);
        this.sandGraphics.fillStyle(0x70E000, 0.85);
        this.sandGraphics.fillEllipse(px, py - 6, 16, 28);
      }

      // C. Right Terrace: Golden-Orange Ludwigia Arcuata
      const orangeX = width * 0.74;
      for (let o = 0; o < 5; o++) {
        const px = orangeX + (o * 18);
        const py = sandY - 25 - (o * 10);
        this.sandGraphics.fillStyle(0xD97706, 1);
        this.sandGraphics.fillEllipse(px, py, 25, 40);
        this.sandGraphics.fillStyle(0xF59E0B, 0.9);
        this.sandGraphics.fillEllipse(px + 2, py - 4, 17, 28);
      }

      // D. Deep Background Corner: Tall Feathered Emerald Stems
      this.sandGraphics.fillStyle(0x1B4332, 0.85);
      this.sandGraphics.fillRect(width * 0.04, sandY - 95, 30, 95);
      this.sandGraphics.fillRect(width * 0.92, sandY - 95, 30, 95);
    } else if (theme === 'jungle') {
      // --- JUNGLE STYLE: Wild Tangled Aerial Roots & Dense Ferns ---
      // Tangled mangrove / rasamala aerial roots descending into the bed
      this.sandGraphics.fillStyle(0x2B1A0E, 1);
      // Large root arch on left
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width * 0.12, 0);
      this.sandGraphics.lineTo(width * 0.17, 0);
      this.sandGraphics.lineTo(width * 0.28, sandY + 18);
      this.sandGraphics.lineTo(width * 0.22, sandY + 18);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Right branching root arch
      this.sandGraphics.beginPath();
      this.sandGraphics.moveTo(width * 0.84, 0);
      this.sandGraphics.lineTo(width * 0.89, 0);
      this.sandGraphics.lineTo(width * 0.75, sandY + 16);
      this.sandGraphics.lineTo(width * 0.70, sandY + 16);
      this.sandGraphics.closePath();
      this.sandGraphics.fill();

      // Wild Java Fern clusters clinging to the roots
      const fernPoints = [
        { x: width * 0.24, y: sandY - 45 },
        { x: width * 0.27, y: sandY - 20 },
        { x: width * 0.73, y: sandY - 40 },
        { x: width * 0.76, y: sandY - 15 }
      ];
      fernPoints.forEach((fp) => {
        this.sandGraphics.fillStyle(0x2D6A4F, 1);
        this.sandGraphics.fillEllipse(fp.x, fp.y, 28, 48);
        this.sandGraphics.fillStyle(0x52B788, 0.85);
        this.sandGraphics.fillEllipse(fp.x + 2, fp.y - 6, 18, 34);
      });
    } else if (theme === 'biotope') {
      // --- BIOTOPE STYLE: Weathered Sunken River Timber & Wild Reeds ---
      // Sunken horizontal river log resting naturally on sand
      const logX = width * 0.48;
      const logY = sandY + 12;
      this.sandGraphics.fillStyle(0x000000, 0.4);
      this.sandGraphics.fillEllipse(logX, logY + 5, width * 0.28, 16);

      this.sandGraphics.fillStyle(0x4E311B, 1);
      this.sandGraphics.fillEllipse(logX, logY, width * 0.26, 14);

      // Log bark highlights
      this.sandGraphics.fillStyle(0x6D4527, 0.85);
      this.sandGraphics.fillRect(logX - width * 0.1, logY - 3, width * 0.2, 5);

      // Wild emergent riparian marsh reeds on left and right wings
      this.sandGraphics.fillStyle(0x6A5C3D, 0.9);
      for (let i = 0; i < 5; i++) {
        const rx = width * 0.08 + (i * 9);
        this.sandGraphics.fillRect(rx, sandY - 80 - (i * 8), 3, 90 + (i * 8));
      }
      for (let i = 0; i < 5; i++) {
        const rx = width * 0.88 + (i * 9);
        this.sandGraphics.fillRect(rx, sandY - 85 - (i * 8), 3, 95 + (i * 8));
      }
    } else {
      // --- NATURE STYLE: Ultra-Realistic Dragon Stone Canyon Aquascape (Takashi Amano) ---
      this.renderNatureCanyonAquascape(width, height, sandY, capacity);
    }
  }

  /**
   * Renders the iconic Dragon Stone (Ohko Rock) canyon massifs, lush Monte Carlo mounds,
   * Hydrocotyle tripartita clovers, and Hygrophila pinnatifida foliage matching the reference aquascape!
   */
  private renderNatureCanyonAquascape(width: number, height: number, sandY: number, capacity: number): void {
    // A. LEFT DRAGON STONE CANYON MASSIF
    // 1. Soft Shadow on Substrate
    this.sandGraphics.fillStyle(0x000000, 0.4);
    this.sandGraphics.fillEllipse(width * 0.26, sandY + 10, width * 0.30, 26);

    // 2. High Summit Dragon Stone (Left Cliff Peak)
    this.sandGraphics.fillStyle(0x5A3819, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.12, sandY + 12);
    this.sandGraphics.lineTo(width * 0.18, sandY - 70);
    this.sandGraphics.lineTo(width * 0.24, sandY - 145);
    this.sandGraphics.lineTo(width * 0.28, sandY - 155); // Peak
    this.sandGraphics.lineTo(width * 0.34, sandY - 95);
    this.sandGraphics.lineTo(width * 0.40, sandY + 8);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Warm Ochre-Amber Body & Stratified Planes
    this.sandGraphics.fillStyle(0x9E692D, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.15, sandY + 8);
    this.sandGraphics.lineTo(width * 0.20, sandY - 65);
    this.sandGraphics.lineTo(width * 0.26, sandY - 140);
    this.sandGraphics.lineTo(width * 0.28, sandY - 155);
    this.sandGraphics.lineTo(width * 0.32, sandY - 90);
    this.sandGraphics.lineTo(width * 0.37, sandY + 5);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Sunlit Golden Facets (Light from top-center canyon)
    this.sandGraphics.fillStyle(0xD8A250, 0.95);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.22, sandY - 75);
    this.sandGraphics.lineTo(width * 0.26, sandY - 140);
    this.sandGraphics.lineTo(width * 0.28, sandY - 155);
    this.sandGraphics.lineTo(width * 0.31, sandY - 95);
    this.sandGraphics.lineTo(width * 0.27, sandY - 70);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Deep Dark Fissures and Crags (Signature Dragon Stone cavities)
    this.sandGraphics.fillStyle(0x241407, 0.95);
    this.sandGraphics.fillTriangle(width * 0.24, sandY - 110, width * 0.27, sandY - 105, width * 0.25, sandY - 90);
    this.sandGraphics.fillTriangle(width * 0.20, sandY - 60, width * 0.23, sandY - 55, width * 0.22, sandY - 40);
    this.sandGraphics.fillTriangle(width * 0.30, sandY - 75, width * 0.33, sandY - 70, width * 0.31, sandY - 55);

    // 3. Foreground Left Gorge Boulder (Framing the white silica path)
    this.sandGraphics.fillStyle(0x4E3014, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.28, sandY + 10);
    this.sandGraphics.lineTo(width * 0.32, sandY - 55);
    this.sandGraphics.lineTo(width * 0.38, sandY - 50);
    this.sandGraphics.lineTo(width * 0.42, sandY + 12);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    this.sandGraphics.fillStyle(0xB88036, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.30, sandY + 8);
    this.sandGraphics.lineTo(width * 0.33, sandY - 50);
    this.sandGraphics.lineTo(width * 0.37, sandY - 46);
    this.sandGraphics.lineTo(width * 0.40, sandY + 10);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    this.sandGraphics.fillStyle(0xE0AC58, 0.85);
    this.sandGraphics.fillRect(width * 0.33, sandY - 48, 22, 6);

    // Left foliage: Hygrophila pinnatifida & creeping Hydrocotyle clovers
    this.sandGraphics.fillStyle(0x2D5A27, 0.95);
    this.sandGraphics.fillEllipse(width * 0.18, sandY - 40, 24, 38);
    this.sandGraphics.fillEllipse(width * 0.24, sandY - 20, 28, 42);
    this.sandGraphics.fillEllipse(width * 0.35, sandY - 15, 26, 36);

    this.sandGraphics.fillStyle(0x70E000, 0.95);
    this.sandGraphics.fillCircle(width * 0.19, sandY - 42, 8);
    this.sandGraphics.fillCircle(width * 0.25, sandY - 22, 10);
    this.sandGraphics.fillCircle(width * 0.36, sandY - 18, 9);
    this.sandGraphics.fillCircle(width * 0.38, sandY - 28, 7);

    // B. RIGHT DRAGON STONE CANYON MASSIF
    // 1. Soft Shadow on Substrate
    this.sandGraphics.fillStyle(0x000000, 0.4);
    this.sandGraphics.fillEllipse(width * 0.74, sandY + 10, width * 0.32, 26);

    // 2. High Summit Dragon Stone (Right Cliff Peak)
    this.sandGraphics.fillStyle(0x5A3819, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.58, sandY + 10);
    this.sandGraphics.lineTo(width * 0.65, sandY - 85);
    this.sandGraphics.lineTo(width * 0.72, sandY - 150);
    this.sandGraphics.lineTo(width * 0.76, sandY - 165); // Peak
    this.sandGraphics.lineTo(width * 0.84, sandY - 95);
    this.sandGraphics.lineTo(width * 0.92, sandY + 12);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Warm Ochre-Amber Body & Stratified Planes
    this.sandGraphics.fillStyle(0x9E692D, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.61, sandY + 8);
    this.sandGraphics.lineTo(width * 0.67, sandY - 80);
    this.sandGraphics.lineTo(width * 0.74, sandY - 145);
    this.sandGraphics.lineTo(width * 0.76, sandY - 165);
    this.sandGraphics.lineTo(width * 0.82, sandY - 90);
    this.sandGraphics.lineTo(width * 0.89, sandY + 10);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Sunlit Golden Facets (Light from top-center canyon)
    this.sandGraphics.fillStyle(0xD8A250, 0.95);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.68, sandY - 70);
    this.sandGraphics.lineTo(width * 0.74, sandY - 145);
    this.sandGraphics.lineTo(width * 0.76, sandY - 165);
    this.sandGraphics.lineTo(width * 0.78, sandY - 110);
    this.sandGraphics.lineTo(width * 0.72, sandY - 65);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    // Deep Dark Fissures and Crags
    this.sandGraphics.fillStyle(0x241407, 0.95);
    this.sandGraphics.fillTriangle(width * 0.73, sandY - 115, width * 0.76, sandY - 110, width * 0.74, sandY - 95);
    this.sandGraphics.fillTriangle(width * 0.67, sandY - 65, width * 0.70, sandY - 60, width * 0.68, sandY - 45);
    this.sandGraphics.fillTriangle(width * 0.80, sandY - 80, width * 0.83, sandY - 75, width * 0.81, sandY - 60);

    // 3. Foreground Right Gorge Boulder (Framing the right side of the white path)
    this.sandGraphics.fillStyle(0x4E3014, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.58, sandY + 12);
    this.sandGraphics.lineTo(width * 0.61, sandY - 50);
    this.sandGraphics.lineTo(width * 0.67, sandY - 45);
    this.sandGraphics.lineTo(width * 0.71, sandY + 10);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    this.sandGraphics.fillStyle(0xB88036, 1);
    this.sandGraphics.beginPath();
    this.sandGraphics.moveTo(width * 0.60, sandY + 10);
    this.sandGraphics.lineTo(width * 0.62, sandY - 46);
    this.sandGraphics.lineTo(width * 0.66, sandY - 42);
    this.sandGraphics.lineTo(width * 0.69, sandY + 8);
    this.sandGraphics.closePath();
    this.sandGraphics.fill();

    this.sandGraphics.fillStyle(0xE0AC58, 0.85);
    this.sandGraphics.fillRect(width * 0.62, sandY - 44, 24, 6);

    // Right foliage: Pinnatifida & cascading Hydrocotyle clovers
    this.sandGraphics.fillStyle(0x2D5A27, 0.95);
    this.sandGraphics.fillEllipse(width * 0.65, sandY - 20, 26, 38);
    this.sandGraphics.fillEllipse(width * 0.76, sandY - 35, 28, 44);
    this.sandGraphics.fillEllipse(width * 0.84, sandY - 15, 24, 34);

    this.sandGraphics.fillStyle(0x70E000, 0.95);
    this.sandGraphics.fillCircle(width * 0.64, sandY - 22, 9);
    this.sandGraphics.fillCircle(width * 0.75, sandY - 38, 10);
    this.sandGraphics.fillCircle(width * 0.83, sandY - 18, 8);
    this.sandGraphics.fillCircle(width * 0.62, sandY - 30, 7.5);

    // C. CAPACITY-BASED AQUASCAPE EXPANSIONS (Capacity 8 -> 11 -> 14 -> 17 -> 20)
    // Upgrading tank capacity adds further rich hardscape layers and flourishing greenery!
    const step = Math.min(4, Math.max(0, Math.floor((capacity - 8) / 3)));
    if (step >= 1) {
      // Tier 2: Additional mossy river pebbles along the outer slopes
      this.sandGraphics.fillStyle(0x6D4527, 1);
      this.sandGraphics.fillEllipse(width * 0.08, sandY + 6, 16, 10);
      this.sandGraphics.fillEllipse(width * 0.92, sandY + 6, 16, 10);
      this.sandGraphics.fillStyle(0x70E000, 0.8);
      this.sandGraphics.fillCircle(width * 0.08, sandY + 4, 6);
      this.sandGraphics.fillCircle(width * 0.92, sandY + 4, 6);
    }
    if (step >= 2) {
      // Tier 3: Additional mid-ground Ohko rock accent and fern fronds
      this.sandGraphics.fillStyle(0x8C5824, 1);
      this.sandGraphics.fillEllipse(width * 0.22, sandY + 14, 22, 12);
      this.sandGraphics.fillEllipse(width * 0.78, sandY + 14, 22, 12);
      this.sandGraphics.fillStyle(0x52B788, 0.9);
      this.sandGraphics.fillCircle(width * 0.22, sandY + 12, 7);
      this.sandGraphics.fillCircle(width * 0.78, sandY + 12, 7);
    }
    if (step >= 3) {
      // Tier 4: Lush Hydrocotyle trailing carpet expansion
      this.sandGraphics.fillStyle(0x80ED99, 0.95);
      this.sandGraphics.fillCircle(width * 0.40, sandY + 32, 6);
      this.sandGraphics.fillCircle(width * 0.60, sandY + 34, 6);
    }
    if (step >= 4) {
      // Tier 5: Max Capacity 20 - Golden mineral highlights & majestic lush canopy
      this.sandGraphics.fillStyle(0xFFEAA7, 0.4);
      this.sandGraphics.fillCircle(width * 0.28, sandY - 153, 5);
      this.sandGraphics.fillCircle(width * 0.76, sandY - 163, 5);
    }
  }

  /**
   * Generates tailored, harmonious aerator diffuser positions per theme
   * so equipment never collides with focal stones, driftwood, or plant streets!
   */
  public static getDiffuserPositions(theme: string, width: number, aeratorLevel: number): number[] {
    const level = Math.min(5, Math.max(1, aeratorLevel || 1));
    const t = (theme || 'nature').toLowerCase();

    if (t === 'iwagumi') {
      // Iwagumi: Focal stones at 0.21, 0.32, 0.66, 0.79.
      // Diffusers sit discreetly at outer Zen corners & center valley, never on stones!
      if (level === 1) return [width * 0.94];
      if (level === 2) return [width * 0.06, width * 0.94];
      if (level === 3) return [width * 0.06, width * 0.48, width * 0.94];
      if (level === 4) return [width * 0.06, width * 0.48, width * 0.90, width * 0.96];
      return [width * 0.05, width * 0.12, width * 0.48, width * 0.90, width * 0.96];
    }

    if (t === 'dutch') {
      // Dutch: Plant terraces occupy 0.16 (Red), 0.44 (Lime), 0.74 (Orange).
      // Diffusers hide behind corner emerald stems or in sunken avenue intervals.
      if (level === 1) return [width * 0.95];
      if (level === 2) return [width * 0.05, width * 0.95];
      if (level === 3) return [width * 0.05, width * 0.58, width * 0.95];
      if (level === 4) return [width * 0.05, width * 0.30, width * 0.58, width * 0.95];
      return [width * 0.04, width * 0.09, width * 0.30, width * 0.58, width * 0.96];
    }

    if (t === 'jungle') {
      // Jungle: Mangrove roots at 0.12-0.28 and 0.70-0.89.
      // Diffusers naturally flank the root trunks and back edges.
      if (level === 1) return [width * 0.94];
      if (level === 2) return [width * 0.06, width * 0.94];
      if (level === 3) return [width * 0.06, width * 0.50, width * 0.94];
      if (level === 4) return [width * 0.06, width * 0.22, width * 0.76, width * 0.94];
      return [width * 0.05, width * 0.08, width * 0.22, width * 0.76, width * 0.95];
    }

    if (t === 'biotope') {
      // Biotope: Fallen river timber at center (0.35-0.65).
      // Diffusers tuck into the riparian marsh reeds at the sides.
      if (level === 1) return [width * 0.94];
      if (level === 2) return [width * 0.06, width * 0.94];
      if (level === 3) return [width * 0.06, width * 0.22, width * 0.94];
      if (level === 4) return [width * 0.06, width * 0.18, width * 0.84, width * 0.94];
      return [width * 0.05, width * 0.12, width * 0.22, width * 0.84, width * 0.95];
    }

    // Nature Style (Takashi Amano Canyon):
    // Diffusers tucked behind rock margins, framing the central path
    if (level === 1) return [width * 0.93];
    if (level === 2) return [width * 0.07, width * 0.93];
    if (level === 3) return [width * 0.07, width * 0.38, width * 0.93];
    if (level === 4) return [width * 0.07, width * 0.38, width * 0.62, width * 0.93];
    return [width * 0.05, width * 0.16, width * 0.38, width * 0.62, width * 0.94];
  }

  private rebuildHardware(width: number, height: number, sandY: number, aq: any, theme: string): void {
    this.hardwareSprites.forEach((s) => s.destroy());
    this.hardwareSprites = [];

    // --- A. AERATOR DIFFUSERS AT THE BOTTOM SAND BED (Tailored per Theme) ---
    const aeratorLevel = aq.aeratorLevel || 1;
    const diffuserPositions = AquariumBackground.getDiffuserPositions(theme, width, aeratorLevel);

    diffuserPositions.forEach((xPos) => {
      if (this.scene.textures.exists('aerator_diffuser')) {
        const diffuser = this.scene.add.sprite(xPos, sandY + 8, 'aerator_diffuser');
        diffuser.setOrigin(0.5, 0.8);
        diffuser.setDepth(14);
        this.hardwareSprites.push(diffuser);

        // Draw translucent airline tubing running to bottom
        this.hardwareGraphics.lineStyle(1.8, 0xA0C4E2, 0.55);
        this.hardwareGraphics.beginPath();
        this.hardwareGraphics.moveTo(xPos, sandY + 8);
        this.hardwareGraphics.lineTo(xPos + 6, height);
        this.hardwareGraphics.stroke();
      }
    });

    // --- B. FILTER HARDWARE VISUALIZATION (Positioned discreetly per Theme) ---
    const filterLevel = aq.filterLevel || 1;
    let filterX = width * 0.06;
    let filterScale = 1.0;

    if (theme === 'iwagumi') {
      // In Iwagumi, tuck filter compactly into far left corner to preserve Zen minimalism
      filterX = width * 0.04;
      filterScale = 0.8;
    } else if (theme === 'dutch') {
      // In Dutch, hide filter behind the corner background stems
      filterX = width * 0.035;
      filterScale = 0.85;
    } else if (theme === 'jungle') {
      // In Jungle, camouflage filter behind the mangrove aerial root column
      filterX = width * 0.05;
      filterScale = 0.9;
    } else if (theme === 'biotope') {
      // In Biotope, place filter behind riparian reeds
      filterX = width * 0.045;
      filterScale = 0.85;
    }

    if (filterLevel <= 2 && this.scene.textures.exists('filter_sponge_unit')) {
      const sponge = this.scene.add.sprite(filterX, sandY - 20, 'filter_sponge_unit');
      sponge.setOrigin(0.5, 1);
      sponge.setDepth(7);
      sponge.setScale((filterLevel === 1 ? 0.85 : 1.05) * filterScale);
      this.hardwareSprites.push(sponge);
    } else if (filterLevel >= 3 && this.scene.textures.exists('filter_canister_unit')) {
      const canister = this.scene.add.sprite(filterX, sandY - 15, 'filter_canister_unit');
      canister.setOrigin(0.5, 1);
      canister.setDepth(8);
      canister.setScale((filterLevel === 5 ? 1.15 : 1.0) * filterScale);
      this.hardwareSprites.push(canister);

      // Water outflow ripples from spray bar
      this.hardwareGraphics.lineStyle(2, 0x80ED99, 0.4);
      this.hardwareGraphics.strokeCircle(filterX + 30, 22, 12);
      this.hardwareGraphics.strokeCircle(filterX + 50, 22, 16);
    }

    // --- C. SLIM LED LIGHTING BAR AT TOP ---
    if (this.scene.textures.exists('led_light_bar')) {
      const ledBar = this.scene.add.sprite(width / 2, 8, 'led_light_bar');
      ledBar.setOrigin(0.5, 0.5);
      ledBar.setDisplaySize(Math.min(width * 0.85, 750), 16);
      ledBar.setDepth(25);
      this.hardwareSprites.push(ledBar);
    }
  }

  private rebuildDecorations(width: number, height: number, sandY: number, aq: any, theme: string): void {
    this.decorationSprites.forEach((d) => d.destroy());
    this.decorationSprites = [];

    // The 5 World-Class Themes already natively render their own comprehensive,
    // pristine, contest-grade hardscape and botanical structures in renderThemedHardscape()!
    // We only render explicit user decorations if they exist AND are compatible with the theme.
    const userDecorations = (aq && aq.decorations && aq.decorations.length > 0)
      ? aq.decorations.filter((d: any) => !d.id.startsWith('deco_starter_') && d.id !== 'deco_vallisneria_1' && d.id !== 'deco_rock_1')
      : [];

    if (userDecorations.length === 0) {
      return; // Pristine authentic themed layout!
    }

    // Only render compatible items if player explicitly installed custom items:
    const t = (theme || 'nature').toLowerCase();
    userDecorations.forEach((deco: any, idx: number) => {
      const k = (deco.textureKey || '').toLowerCase();
      // Iwagumi: strictly no wood/castles/tall stems
      if (t === 'iwagumi' && (k.includes('wood') || k.includes('castle') || k.includes('ruin') || k.includes('vallisneria'))) return;
      // Dutch: strictly no rocks/wood/castles
      if (t === 'dutch' && (k.includes('rock') || k.includes('wood') || k.includes('castle') || k.includes('ruin'))) return;
      // Jungle & Biotope: no castles/ruins
      if ((t === 'jungle' || t === 'biotope') && (k.includes('castle') || k.includes('ruin'))) return;

      if (this.scene.textures.exists(deco.textureKey)) {
        const posX = width * (0.15 + (idx * 0.14));
        const sprite = this.scene.add.sprite(posX, sandY + 12, deco.textureKey);
        sprite.setOrigin(0.5, 1);
        sprite.setScale(Math.min(0.85, deco.scale || 0.85));
        sprite.setDepth(6);
        this.decorationSprites.push(sprite);
      }
    });
  }

  public update(time: number, width: number, height: number): void {
    // 1. Plant swaying motion (sinusoidal)
    this.decorationSprites.forEach((item, idx) => {
      const k = item.texture.key.toLowerCase();
      if (k.includes('plant') || k.includes('vallisneria') || k.includes('anubias')) {
        const sway = Math.sin(time * 0.0018 + idx * 1.5) * 0.055;
        item.setRotation(sway);
      }
    });

    // 2. Ambient light sunbeams / caustics shifting across the tank
    const aq = storage.getAquarium();
    const lightIntensity = 0.035 + (Math.min(5, aq.filterLevel) * 0.006);

    this.causticsGraphics.clear();
    const beamCount = 4;
    for (let i = 0; i < beamCount; i++) {
      const beamX = (width / (beamCount + 1)) * (i + 1) + Math.sin(time * 0.0008 + i) * 35;
      const alpha = lightIntensity + Math.sin(time * 0.0015 + i * 2) * 0.015;

      this.causticsGraphics.fillStyle(0xFFFFFF, alpha);
      this.causticsGraphics.beginPath();
      this.causticsGraphics.moveTo(beamX - 18, 0);
      this.causticsGraphics.lineTo(beamX + 18, 0);
      this.causticsGraphics.lineTo(beamX + 75, height);
      this.causticsGraphics.lineTo(beamX - 45, height);
      this.causticsGraphics.closePath();
      this.causticsGraphics.fill();
    }
  }

  public destroy(): void {
    this.bgGraphics.destroy();
    this.causticsGraphics.destroy();
    this.sandGraphics.destroy();
    this.hardwareGraphics.destroy();
    this.decorationSprites.forEach((d) => d.destroy());
    this.hardwareSprites.forEach((h) => h.destroy());
  }
}
