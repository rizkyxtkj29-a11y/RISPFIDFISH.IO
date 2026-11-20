import { FishSpecies } from '../types/game';
import { FISH_SPECIES_LIST } from '../data/fishSpecies';

export class AssetGenerator {
  /**
   * Generates a high-quality stylized SVG / Canvas 2D fish illustration
   */
  public static generateFishDataUrl(species: FishSpecies, width: number = 320, height: number = 190): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    this.drawFish(ctx, species, width / 2, height / 2, width * 0.85, height * 0.85, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * Core Anatomical Fish Drawing Engine (Real Biological Shapes & Textures)
   */
  public static drawFish(
    ctx: CanvasRenderingContext2D,
    species: FishSpecies,
    cx: number,
    cy: number,
    w: number,
    h: number,
    tailWaggle: number = 0
  ): void {
    ctx.save();
    ctx.translate(cx, cy);

    // Dispatch to specialized anatomical renderers based on species morphology
    if (species.id.includes('arwana')) {
      this.drawArowana(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'channa_pleuro') {
      this.drawChanna(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'puffer_palembang') {
      this.drawPuffer(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'clown_loach') {
      this.drawClownLoach(ctx, species, w, h, tailWaggle);
    } else if (species.id.includes('betta')) {
      this.drawWildBetta(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'tiger_barb') {
      this.drawTigerBarb(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'datnioides_microlepis') {
      this.drawTigerfish(ctx, species, w, h, tailWaggle);
    } else if (species.id === 'woworae_ricefish') {
      this.drawMedaka(ctx, species, w, h, tailWaggle);
    } else if (species.id.includes('rainbow') || species.id.includes('incisus') || species.id === 'beseng_beseng') {
      this.drawRainbowFish(ctx, species, w, h, tailWaggle);
    } else {
      this.drawRainbowFish(ctx, species, w, h, tailWaggle);
    }

    ctx.restore();
  }

  // ============================================================================
  // REALISTIC ANATOMICAL FISH RENDERING ENGINE
  // ============================================================================

  /**
   * Helper: Realistic biological fish eye with iris depth, metallic glow, and corneal glints
   */
  private static drawRealisticEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    irisColor: string,
    pupilRatio: number = 0.52,
    specularAngle: number = -0.7
  ): void {
    ctx.save();
    // 1. Subtle dark eye socket contour
    ctx.fillStyle = 'rgba(10, 10, 15, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Iris with metallic depth
    const irisGrad = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
    irisGrad.addColorStop(0, '#FFFFFF');
    irisGrad.addColorStop(0.25, irisColor);
    irisGrad.addColorStop(0.85, irisColor);
    irisGrad.addColorStop(1, 'rgba(15, 15, 20, 0.7)');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Deep obsidian pupil
    const pRadius = radius * pupilRatio;
    ctx.fillStyle = '#08080C';
    ctx.beginPath();
    ctx.arc(x + 0.2, y, pRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. Corneal specular highlights (lifelike glints)
    const glintX = x + Math.cos(specularAngle) * (radius * 0.45);
    const glintY = y + Math.sin(specularAngle) * (radius * 0.45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(glintX, glintY, radius * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Secondary fill reflection
    const fillX = x - Math.cos(specularAngle) * (radius * 0.35);
    const fillY = y - Math.sin(specularAngle) * (radius * 0.35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(fillX, fillY, radius * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ============================================================================
  // 1. AROWANA (Arwana Super Red Kalimantan & Arwana Papua Jardini)
  // Ultra-Realistic Dragon Fish Anatomy: Spoon-head, underbite chin, rigid barbels,
  // blade pectoral wings, pelvic filaments, 5-level 24K gold scales, broad fan tail
  // ============================================================================
  private static drawArowana(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const isSuperRed = sp.id === 'arwana_super_red';
    const waggleOffset = Math.sin(waggle) * 4;

    // Palette Definitions
    const darkMaroon = isSuperRed ? '#590D22' : '#3A271D';
    const brightRuby = isSuperRed ? '#C9182B' : '#7F5539';
    const flameRed = isSuperRed ? '#FF4D6D' : '#9C6644';
    const goldRim = isSuperRed ? '#FFD166' : '#DDA15E';
    const brightGold = isSuperRed ? '#FFE57F' : '#E6BE8A';
    const finBorder = isSuperRed ? 'rgba(255, 209, 102, 0.85)' : 'rgba(221, 161, 94, 0.85)';

    // --------------------------------------------------------------------------
    // 1. POSTERIOR DORSAL FIN (Sirip Punggung Jauh di Belakang)
    // --------------------------------------------------------------------------
    ctx.save();
    const dorsalGrad = ctx.createLinearGradient(-w * 0.20, -h * 0.14, -w * 0.32, -h * 0.30);
    dorsalGrad.addColorStop(0, darkMaroon);
    dorsalGrad.addColorStop(0.5, brightRuby);
    dorsalGrad.addColorStop(1, flameRed);

    ctx.fillStyle = dorsalGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, -h * 0.13); // Start of dorsal base
    ctx.quadraticCurveTo(-w * 0.26, -h * 0.30, -w * 0.38, -h * 0.22); // High curved crest
    ctx.quadraticCurveTo(-w * 0.41, -h * 0.14, -w * 0.42, -h * 0.05); // Merges towards tail peduncle
    ctx.lineTo(-w * 0.38, -h * 0.07);
    ctx.closePath();
    ctx.fill();

    // Dorsal Fin Rays (Lepidotrichia)
    ctx.strokeStyle = finBorder;
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 8; i++) {
      const rx = -w * (0.19 + i * 0.026);
      ctx.beginPath();
      ctx.moveTo(rx, -h * 0.12);
      ctx.lineTo(rx - w * 0.04, -h * (0.22 - Math.abs(i - 4) * 0.015));
      ctx.stroke();
    }
    // Radiant top rim
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, -h * 0.13);
    ctx.quadraticCurveTo(-w * 0.26, -h * 0.30, -w * 0.38, -h * 0.22);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 2. POSTERIOR ANAL FIN (Sirip Dubur Panjang yang Mengalir Anggun)
    // --------------------------------------------------------------------------
    ctx.save();
    const analGrad = ctx.createLinearGradient(-w * 0.06, h * 0.14, -w * 0.24, h * 0.32);
    analGrad.addColorStop(0, darkMaroon);
    analGrad.addColorStop(0.5, brightRuby);
    analGrad.addColorStop(1, flameRed);

    ctx.fillStyle = analGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, h * 0.145); // Start of anal fin on lower belly
    ctx.quadraticCurveTo(-w * 0.22, h * 0.32, -w * 0.39, h * 0.21); // Broad downward sweep
    ctx.quadraticCurveTo(-w * 0.42, h * 0.13, -w * 0.42, h * 0.05); // Merges near tail base
    ctx.closePath();
    ctx.fill();

    // Anal Fin Rays
    ctx.strokeStyle = finBorder;
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i++) {
      const ax = -w * (0.07 + i * 0.032);
      ctx.beginPath();
      ctx.moveTo(ax, h * 0.14);
      ctx.lineTo(ax - w * 0.045, h * (0.24 - Math.abs(i - 5) * 0.012));
      ctx.stroke();
    }
    // Radiant bottom rim
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, h * 0.145);
    ctx.quadraticCurveTo(-w * 0.22, h * 0.32, -w * 0.39, h * 0.21);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 3. CAUDAL FAN TAIL FIN (Ekor Kipas Naga Megah dengan Kibasan)
    // --------------------------------------------------------------------------
    ctx.save();
    ctx.translate(-w * 0.42, waggleOffset);

    const tailGrad = ctx.createRadialGradient(-w * 0.02, 0, 4, -w * 0.12, 0, w * 0.22);
    tailGrad.addColorStop(0, darkMaroon);
    tailGrad.addColorStop(0.45, brightRuby);
    tailGrad.addColorStop(0.85, flameRed);
    tailGrad.addColorStop(1, isSuperRed ? '#FF758F' : '#B08968');

    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    // Authentic wide paddle fan tail
    ctx.moveTo(0, -h * 0.06);
    ctx.quadraticCurveTo(-w * 0.10, -h * 0.26, -w * 0.21, -h * 0.18);
    ctx.quadraticCurveTo(-w * 0.24, 0, -w * 0.21, h * 0.18);
    ctx.quadraticCurveTo(-w * 0.10, h * 0.26, 0, h * 0.06);
    ctx.closePath();
    ctx.fill();

    // 12 Radiating Bony Tail Rays
    ctx.strokeStyle = finBorder;
    ctx.lineWidth = 1.3;
    const rayAngles = [-0.22, -0.18, -0.14, -0.10, -0.06, -0.02, 0.02, 0.06, 0.10, 0.14, 0.18, 0.22];
    rayAngles.forEach((ang) => {
      ctx.beginPath();
      ctx.moveTo(0, ang * (h * 0.2));
      ctx.lineTo(-w * 0.20, ang * (h * 0.85));
      ctx.stroke();
    });

    // Outer margin rim
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.20, -h * 0.17);
    ctx.quadraticCurveTo(-w * 0.24, 0, -w * 0.20, h * 0.17);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 4. MAIN AROWANA BODY (Contour Sendok / Spoon-Head & Tubuh Naga Gagah)
    // --------------------------------------------------------------------------
    ctx.save();
    const bodyPath = new Path2D();

    bodyPath.moveTo(w * 0.46, -h * 0.035); // Lower jaw tip (sharp prominent underbite)
    bodyPath.lineTo(w * 0.44, -h * 0.065); // Oblique mouth entrance to upper lip
    bodyPath.quadraticCurveTo(w * 0.32, -h * 0.115, w * 0.16, -h * 0.155); // Spoon-head curve into arched shoulder
    bodyPath.quadraticCurveTo(0, -h * 0.145, -w * 0.22, -h * 0.135); // Proud straight dorsal back
    bodyPath.lineTo(-w * 0.42, -h * 0.05); // Caudal peduncle top
    bodyPath.lineTo(-w * 0.42, h * 0.05); // Caudal peduncle bottom
    bodyPath.quadraticCurveTo(-w * 0.24, h * 0.14, -w * 0.06, h * 0.145); // Tapering belly to anal fin
    bodyPath.quadraticCurveTo(w * 0.14, h * 0.175, w * 0.30, h * 0.14); // Deep muscular keel chest
    bodyPath.quadraticCurveTo(w * 0.42, h * 0.08, w * 0.46, -h * 0.035); // Heavy muscular lower jaw
    bodyPath.closePath();

    // Luxurious 3D Body Gradient
    const bodyGrad = ctx.createLinearGradient(-w * 0.45, 0, w * 0.46, 0);
    if (isSuperRed) {
      bodyGrad.addColorStop(0, '#480410'); // Deep dark blood-red tail base
      bodyGrad.addColorStop(0.25, '#800F2F');
      bodyGrad.addColorStop(0.55, '#A4133C');
      bodyGrad.addColorStop(0.80, '#C9182B'); // Saturated chili red flanks
      bodyGrad.addColorStop(1, '#FF4D6D'); // Brilliant glowing dragon head
    } else {
      // Jardini Australian/Papua Bronze
      bodyGrad.addColorStop(0, '#281C14');
      bodyGrad.addColorStop(0.30, '#4F3522');
      bodyGrad.addColorStop(0.65, '#7F5539');
      bodyGrad.addColorStop(0.85, '#A67C52');
      bodyGrad.addColorStop(1, '#C89658');
    }
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // --------------------------------------------------------------------------
    // 5. BODY INTERIOR: DRAGON ARMOR SCALES (Level 1-6 Scales)
    // --------------------------------------------------------------------------
    ctx.clip(bodyPath);

    // Dorsal Dark Counter-Shading (Level 6 Cross-Back Base)
    const dorsalShadow = ctx.createLinearGradient(0, -h * 0.16, 0, -h * 0.02);
    dorsalShadow.addColorStop(0, 'rgba(10, 2, 4, 0.55)');
    dorsalShadow.addColorStop(1, 'rgba(10, 2, 4, 0)');
    ctx.fillStyle = dorsalShadow;
    ctx.fillRect(-w * 0.45, -h * 0.20, w * 0.95, h * 0.25);

    // Ventral Counter-Shading (Silvery Gold Belly Sheen)
    const bellySheen = ctx.createLinearGradient(0, h * 0.18, 0, h * 0.04);
    bellySheen.addColorStop(0, isSuperRed ? 'rgba(255, 215, 0, 0.25)' : 'rgba(230, 200, 160, 0.22)');
    bellySheen.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bellySheen;
    ctx.fillRect(-w * 0.45, h * 0.04, w * 0.95, h * 0.20);

    // Authentic Overlapping Large Hexagonal-Arched Dragon Armor Scales (5 Distinct Rows)
    const numRows = 5;
    const cols = 9;
    const scaleW = w * 0.082;
    const scaleH = h * 0.058;

    for (let r = 0; r < numRows; r++) {
      const rowY = -h * 0.11 + r * scaleH;
      const xOffset = (r % 2 === 0) ? 0 : scaleW * 0.5;

      for (let c = 0; c < cols; c++) {
        const scaleX = -w * 0.36 + c * scaleW + xOffset;

        // Skip scales outside torso
        if (scaleX > w * 0.24 || scaleX < -w * 0.39) continue;

        ctx.save();
        ctx.beginPath();
        ctx.arc(scaleX, rowY, scaleW * 0.48, -0.4, Math.PI + 0.4, false);

        if (isSuperRed) {
          // Inner metallic purple/dark ruby core
          ctx.fillStyle = (r === 2) ? 'rgba(90, 5, 25, 0.35)' : 'rgba(130, 10, 35, 0.30)';
          ctx.fill();

          // 1st Grade Outer Rim: Fiery blood red
          ctx.strokeStyle = 'rgba(201, 24, 74, 0.75)';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // 2nd Grade Inner Rim: 24K Metallic Gold Shine!
          ctx.beginPath();
          ctx.arc(scaleX - 1.2, rowY, scaleW * 0.38, -0.3, Math.PI + 0.3, false);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
          ctx.lineWidth = 1.1;
          ctx.stroke();
        } else {
          // Jardini: Bronze armor with signature crescent pinkish-salmon spot!
          ctx.strokeStyle = 'rgba(224, 169, 109, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 140, 150, 0.75)';
          ctx.beginPath();
          ctx.arc(scaleX + 2, rowY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Longitudinal Specular Sheen (Reflecting aquarium light along spine)
    const spineGlint = ctx.createLinearGradient(-w * 0.35, -h * 0.08, w * 0.25, -h * 0.08);
    spineGlint.addColorStop(0, 'rgba(255, 255, 255, 0)');
    spineGlint.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    spineGlint.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spineGlint;
    ctx.fillRect(-w * 0.35, -h * 0.10, w * 0.60, 4);

    ctx.restore(); // Exit clipped body

    // --------------------------------------------------------------------------
    // 6. PELVIC / VENTRAL FINS WITH TRAILING FILAMENTS (Sirip Perut & Sungut)
    // --------------------------------------------------------------------------
    ctx.save();
    const pelvicX = w * 0.06;
    const pelvicY = h * 0.16;

    ctx.fillStyle = isSuperRed ? 'rgba(164, 19, 60, 0.90)' : 'rgba(92, 64, 51, 0.90)';
    ctx.beginPath();
    ctx.moveTo(pelvicX, pelvicY);
    ctx.lineTo(pelvicX - w * 0.06, pelvicY + h * 0.12);
    ctx.lineTo(pelvicX - w * 0.02, pelvicY + h * 0.04);
    ctx.closePath();
    ctx.fill();

    // Trailing Sensory Filament Streamer
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(pelvicX, pelvicY);
    ctx.quadraticCurveTo(pelvicX - w * 0.08, pelvicY + h * 0.14, pelvicX - w * 0.14, pelvicY + h * 0.18);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 7. PECTORAL FIN ("SAYAP PEDANG NAGA" / BLADE WINGS)
    // --------------------------------------------------------------------------
    ctx.save();
    const pecX = w * 0.25;
    const pecY = h * 0.05;

    const pecGrad = ctx.createLinearGradient(pecX, pecY, pecX - w * 0.22, pecY + h * 0.24);
    pecGrad.addColorStop(0, darkMaroon);
    pecGrad.addColorStop(0.5, brightRuby);
    pecGrad.addColorStop(1, flameRed);

    ctx.fillStyle = pecGrad;
    ctx.beginPath();
    ctx.moveTo(pecX, pecY); // Base at shoulder
    ctx.quadraticCurveTo(pecX - w * 0.10, pecY + h * 0.28, pecX - w * 0.22, pecY + h * 0.24);
    ctx.quadraticCurveTo(pecX - w * 0.12, pecY + h * 0.12, pecX - w * 0.04, pecY + h * 0.04);
    ctx.closePath();
    ctx.fill();

    // Fin rays on pectoral wing
    ctx.strokeStyle = finBorder;
    ctx.lineWidth = 1.1;
    for (let i = 1; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(pecX - i * 3, pecY + i * 2);
      ctx.quadraticCurveTo(pecX - w * 0.08, pecY + h * (0.06 + i * 0.035), pecX - w * (0.16 + i * 0.01), pecY + h * (0.18 + i * 0.01));
      ctx.stroke();
    }

    // Glowing leading edge of pectoral blade
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pecX, pecY);
    ctx.quadraticCurveTo(pecX - w * 0.10, pecY + h * 0.28, pecX - w * 0.22, pecY + h * 0.24);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 8. OPERCULUM / GILL PLATE (Pelat Tutup Insang Metalik & Blush A-Grade)
    // --------------------------------------------------------------------------
    ctx.save();
    const opercX = w * 0.26;
    const opercY = h * 0.01;
    const opercRadius = h * 0.13;

    const opercFill = ctx.createRadialGradient(opercX + 8, opercY - 5, 2, opercX, opercY, opercRadius);
    if (isSuperRed) {
      opercFill.addColorStop(0, '#FFE57F'); // 24K Gold center highlight
      opercFill.addColorStop(0.4, '#FF4D6D'); // Chili red blush
      opercFill.addColorStop(0.85, '#C9182B');
      opercFill.addColorStop(1, '#590D22');
    } else {
      opercFill.addColorStop(0, '#E6BE8A');
      opercFill.addColorStop(0.4, '#A67C52');
      opercFill.addColorStop(1, '#4F3522');
    }

    ctx.fillStyle = opercFill;
    ctx.beginPath();
    ctx.arc(opercX, opercY, opercRadius, -Math.PI * 0.45, Math.PI * 0.42);
    ctx.closePath();
    ctx.fill();

    // Embossed gill rim
    ctx.strokeStyle = goldRim;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(opercX, opercY, opercRadius, -Math.PI * 0.45, Math.PI * 0.42);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 9. MOUTH CLEFT, TEETH RIDGE, & UNDERBITE GULAR PLATES
    // --------------------------------------------------------------------------
    ctx.save();
    // Oblique mouth cleft slit
    ctx.strokeStyle = isSuperRed ? '#370617' : '#231812';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.44, -h * 0.065); // Upper mouth opening
    ctx.lineTo(w * 0.33, -h * 0.02);  // Angles down and back into cheek
    ctx.stroke();

    // Lower jaw gular crease
    ctx.strokeStyle = isSuperRed ? 'rgba(89, 13, 34, 0.7)' : 'rgba(40, 28, 20, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.04);
    ctx.quadraticCurveTo(w * 0.36, h * 0.06, w * 0.30, h * 0.09);
    ctx.stroke();

    // Radiant vermilion lip lining
    ctx.strokeStyle = isSuperRed ? '#FF4D6D' : '#DDA15E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.46, -h * 0.035);
    ctx.lineTo(w * 0.44, -h * 0.065);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 10. DRAGON BARBELS (Sepasang Kumis Naga Lurus Gagah Menghadap ke Depan)
    // --------------------------------------------------------------------------
    ctx.save();
    ctx.strokeStyle = goldRim;
    ctx.fillStyle = brightGold;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // Upper Barbel (pointing forward-upward)
    ctx.beginPath();
    ctx.moveTo(w * 0.46, -h * 0.04);
    ctx.quadraticCurveTo(w * 0.52, -h * 0.06, w * 0.56, -h * 0.05);
    ctx.stroke();

    // Lower Barbel (parallel, forward-pointing)
    ctx.beginPath();
    ctx.moveTo(w * 0.455, -h * 0.015);
    ctx.quadraticCurveTo(w * 0.51, -h * 0.025, w * 0.55, -h * 0.01);
    ctx.stroke();
    ctx.restore();

    // --------------------------------------------------------------------------
    // 11. REALISTIC COMMANDING DRAGON EYE (Mata Predator Permukaan Berpendar)
    // --------------------------------------------------------------------------
    const eyeX = w * 0.35;
    const eyeY = -h * 0.075;
    const eyeRadius = 6.2;
    const irisColor = isSuperRed ? '#FF3B56' : '#E0A96D';

    this.drawRealisticEye(ctx, eyeX, eyeY, eyeRadius, irisColor, 0.50, -0.65);

    // Glowing golden eye brow ridge contour
    ctx.save();
    ctx.strokeStyle = isSuperRed ? 'rgba(255, 215, 0, 0.85)' : 'rgba(235, 185, 130, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeRadius + 1.8, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // 2. CHANNA PLEUROPHTHALMA (Toman Bunga / Snakehead)
  // ============================================================================
  private static drawChanna(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Long Continuous Dorsal Fin (Runs along 65% of the back!)
    ctx.save();
    const dorsalGrad = ctx.createLinearGradient(0, -h * 0.30, 0, -h * 0.12);
    dorsalGrad.addColorStop(0, '#03045E');
    dorsalGrad.addColorStop(0.5, '#0077B6');
    dorsalGrad.addColorStop(1, '#00B4D8');
    ctx.fillStyle = dorsalGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, -h * 0.14);
    ctx.quadraticCurveTo(-w * 0.15, -h * 0.32, -w * 0.44, -h * 0.06);
    ctx.lineTo(-w * 0.41, -h * 0.02);
    ctx.lineTo(w * 0.18, -h * 0.10);
    ctx.closePath();
    ctx.fill();
    // Fine iridescent fin rays
    ctx.strokeStyle = '#90E0EF';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 11; i++) {
      ctx.beginPath();
      ctx.moveTo(w * (0.16 - i * 0.055), -h * 0.13);
      ctx.lineTo(w * (0.13 - i * 0.055), -h * 0.25);
      ctx.stroke();
    }
    ctx.restore();

    // B. Long Anal Fin
    ctx.save();
    ctx.fillStyle = dorsalGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.04, h * 0.15);
    ctx.quadraticCurveTo(-w * 0.24, h * 0.28, -w * 0.44, h * 0.06);
    ctx.lineTo(-w * 0.41, h * 0.02);
    ctx.lineTo(-w * 0.04, h * 0.10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#90E0EF';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(-w * (0.06 + i * 0.045), h * 0.12);
      ctx.lineTo(-w * (0.09 + i * 0.045), h * 0.23);
      ctx.stroke();
    }
    ctx.restore();

    // C. Caudal Tail Fin (Rounded paddle tail)
    ctx.save();
    ctx.translate(-w * 0.44, waggleOffset);
    ctx.fillStyle = '#023E8A';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-w * 0.20, -h * 0.26, -w * 0.24, 0);
    ctx.quadraticCurveTo(-w * 0.20, h * 0.26, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#48CAE4';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // D. Sleek Torpedo Snakehead Body
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.47, 0); // Pointed snakehead snout
    bodyPath.quadraticCurveTo(w * 0.20, -h * 0.18, -w * 0.44, -h * 0.05); // Streamlined back
    bodyPath.lineTo(-w * 0.44, h * 0.05); // Peduncle
    bodyPath.quadraticCurveTo(w * 0.20, h * 0.18, w * 0.47, 0); // Slender belly
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(-w * 0.45, 0, w * 0.47, 0);
    bodyGrad.addColorStop(0, '#001219');
    bodyGrad.addColorStop(0.35, '#005F73');
    bodyGrad.addColorStop(0.70, '#0A9396'); // Iridescent teal-emerald
    bodyGrad.addColorStop(1, '#94D2BD');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // E. Clipped Interior: Reticulated pattern + Concentric Target Ocelli
    ctx.clip(bodyPath);

    // Iridescent flank highlight
    const flankGrad = ctx.createLinearGradient(0, -h * 0.10, 0, h * 0.10);
    flankGrad.addColorStop(0, 'rgba(148, 210, 189, 0.35)');
    flankGrad.addColorStop(0.5, 'rgba(238, 155, 0, 0.20)');
    flankGrad.addColorStop(1, 'rgba(0, 95, 115, 0.4)');
    ctx.fillStyle = flankGrad;
    ctx.fillRect(-w * 0.45, -h * 0.2, w, h * 0.4);

    // 4 Magnificent Concentric Target Ocelli (Bunga Toman)
    const ocelliX = [-w * 0.26, -w * 0.12, w * 0.02, w * 0.16];
    ocelliX.forEach((ox) => {
      // 1. Radiant fiery orange halo
      ctx.fillStyle = '#EE9B00';
      ctx.beginPath();
      ctx.arc(ox, -h * 0.01, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Metallic deep indigo ring
      ctx.fillStyle = '#001219';
      ctx.beginPath();
      ctx.arc(ox, -h * 0.01, 5.8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Central black core
      ctx.fillStyle = '#000814';
      ctx.beginPath();
      ctx.arc(ox, -h * 0.01, 3.4, 0, Math.PI * 2);
      ctx.fill();

      // 4. White sparkle glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ox + 1.2, -h * 0.01 - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // F. Operculum
    ctx.strokeStyle = '#0A9396';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(w * 0.24, 0, h * 0.14, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.stroke();

    // G. Realistic Reptilian Eye
    const eyeX = w * 0.36;
    const eyeY = -h * 0.04;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.2, '#EE9B00', 0.52);

    // H. Pectoral Fin
    ctx.fillStyle = 'rgba(72, 202, 228, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w * 0.20, h * 0.06, 12, 6, Math.PI * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ============================================================================
  // 3. PUFFERFISH (Buntal Palembang / Pao palembangensis)
  // ============================================================================
  private static drawPuffer(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 5;

    // A. Small Fluttering Dorsal & Anal Fins (Near tail)
    ctx.save();
    ctx.fillStyle = 'rgba(230, 200, 150, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.24, -h * 0.24);
    ctx.quadraticCurveTo(-w * 0.35, -h * 0.40, -w * 0.36, -h * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-w * 0.24, h * 0.24);
    ctx.quadraticCurveTo(-w * 0.35, h * 0.40, -w * 0.36, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // B. Caudal Tail
    ctx.save();
    ctx.translate(-w * 0.36, waggleOffset);
    ctx.fillStyle = 'rgba(217, 180, 130, 0.88)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-w * 0.18, -h * 0.25, -w * 0.20, 0);
    ctx.quadraticCurveTo(-w * 0.18, h * 0.25, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // C. Plump Boxy Puffer Body
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.ellipse(0, 0, w * 0.38, h * 0.34, 0, 0, Math.PI * 2);

    const bodyGrad = ctx.createRadialGradient(w * 0.1, -h * 0.1, 10, 0, 0, w * 0.45);
    bodyGrad.addColorStop(0, '#E9D8A6');
    bodyGrad.addColorStop(0.5, '#BB9457');
    bodyGrad.addColorStop(1, '#6F4E37');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // D. Clipped Interior: Creamy White Belly & Leopard Rosettes
    ctx.clip(bodyPath);

    // Creamy white belly
    ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
    ctx.beginPath();
    ctx.ellipse(w * 0.05, h * 0.14, w * 0.28, h * 0.18, 0, 0, Math.PI);
    ctx.fill();

    // Leopard camouflage spots
    ctx.fillStyle = '#3E2723';
    const spots = [
      { x: -w * 0.15, y: -h * 0.15, r: 7 },
      { x: -w * 0.02, y: -h * 0.20, r: 8 },
      { x: w * 0.12, y: -h * 0.14, r: 7 },
      { x: -w * 0.20, y: 0, r: 6 },
      { x: -w * 0.05, y: -h * 0.02, r: 9 },
      { x: w * 0.10, y: h * 0.02, r: 7 }
    ];
    spots.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#DDA15E';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();

    // E. Fused Parrot-like Dental Beak
    ctx.fillStyle = '#F8F9FA';
    ctx.beginPath();
    ctx.moveTo(w * 0.36, -h * 0.06);
    ctx.lineTo(w * 0.43, 0);
    ctx.lineTo(w * 0.36, h * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6C757D';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // F. Realistic Expressive Eye (High position)
    const eyeX = w * 0.24;
    const eyeY = -h * 0.14;
    this.drawRealisticEye(ctx, eyeX, eyeY, 7.2, '#EE9B00', 0.52);

    // G. Fluttering Pectoral Fin
    ctx.fillStyle = 'rgba(230, 200, 150, 0.8)';
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 0.08, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================================================================
  // 4. CLOWN LOACH (Botia Badut / Chromobotia macracanthus)
  // ============================================================================
  private static drawClownLoach(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Scarlet Red Dorsal Fin
    ctx.save();
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(-w * 0.02, -h * 0.28);
    ctx.quadraticCurveTo(-w * 0.16, -h * 0.52, -w * 0.28, -h * 0.18);
    ctx.lineTo(-w * 0.12, -h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // B. Scarlet Red Anal Fin
    ctx.save();
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, h * 0.20);
    ctx.quadraticCurveTo(-w * 0.20, h * 0.42, -w * 0.28, h * 0.15);
    ctx.lineTo(-w * 0.14, h * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // C. Deeply Forked Scarlet Caudal Tail
    ctx.save();
    ctx.translate(-w * 0.40, waggleOffset);
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.24, -h * 0.35);
    ctx.quadraticCurveTo(-w * 0.12, 0, -w * 0.24, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // D. Arched Back & Flat Belly Body Profile
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.44, h * 0.06); // Downward snout
    bodyPath.quadraticCurveTo(w * 0.10, -h * 0.38, -w * 0.40, 0); // Arched back
    bodyPath.lineTo(-w * 0.40, h * 0.10); // Peduncle
    bodyPath.quadraticCurveTo(w * 0.05, h * 0.22, w * 0.44, h * 0.06); // Flat belly
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -h * 0.35, 0, h * 0.25);
    bodyGrad.addColorStop(0, '#F4A261');
    bodyGrad.addColorStop(0.5, '#E76F51');
    bodyGrad.addColorStop(1, '#E9C46A');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // E. Clipped Interior: 3 Iconic Curving Jet-Black Saddle Stripes
    ctx.clip(bodyPath);
    ctx.fillStyle = '#1D1E2C';

    // Stripe 1: Over eye and cheek
    ctx.beginPath();
    ctx.moveTo(w * 0.22, -h * 0.30);
    ctx.lineTo(w * 0.33, -h * 0.18);
    ctx.lineTo(w * 0.26, h * 0.20);
    ctx.lineTo(w * 0.15, h * 0.20);
    ctx.closePath();
    ctx.fill();

    // Stripe 2: Wide saddle over mid-body
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, -h * 0.38);
    ctx.lineTo(w * 0.08, -h * 0.30);
    ctx.lineTo(0, h * 0.22);
    ctx.lineTo(-w * 0.15, h * 0.22);
    ctx.closePath();
    ctx.fill();

    // Stripe 3: Caudal peduncle wrap
    ctx.beginPath();
    ctx.moveTo(-w * 0.26, -h * 0.20);
    ctx.lineTo(-w * 0.15, -h * 0.25);
    ctx.lineTo(-w * 0.24, h * 0.20);
    ctx.lineTo(-w * 0.35, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // F. Downward Sensory Whiskers (Barbels for foraging)
    ctx.strokeStyle = '#E76F51';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.06);
    ctx.lineTo(w * 0.49, h * 0.13);
    ctx.moveTo(w * 0.40, h * 0.08);
    ctx.lineTo(w * 0.47, h * 0.17);
    ctx.stroke();

    // G. Realistic Eye with subocular defensive spine contour
    const eyeX = w * 0.25;
    const eyeY = -h * 0.08;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.2, '#FFD166', 0.52);

    // H. Scarlet Red Pectoral Fin
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.ellipse(w * 0.20, h * 0.14, 12, 6, Math.PI * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================================================================
  // 5. WILD BETTA (Betta channoides & Betta albimarginata)
  // ============================================================================
  private static drawWildBetta(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Flowing Dorsal Fin with Crisp White Margin (Albimarginata signature!)
    ctx.save();
    ctx.fillStyle = '#800F2F';
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, -h * 0.18);
    ctx.bezierCurveTo(-w * 0.20, -h * 0.48, -w * 0.40, -h * 0.40, -w * 0.38, -h * 0.10);
    ctx.lineTo(-w * 0.20, -h * 0.16);
    ctx.closePath();
    ctx.fill();
    // Black submarginal band + Brilliant White outer border
    ctx.strokeStyle = '#101014';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();

    // B. Flowing Anal Fin with White Margin
    ctx.save();
    ctx.fillStyle = '#800F2F';
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, h * 0.16);
    ctx.bezierCurveTo(-w * 0.20, h * 0.46, -w * 0.38, h * 0.36, -w * 0.36, h * 0.08);
    ctx.lineTo(-w * 0.16, h * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#101014';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();

    // C. Spade Caudal Tail with White Margin
    ctx.save();
    ctx.translate(-w * 0.40, waggleOffset);
    ctx.fillStyle = '#9B111E';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-w * 0.20, -h * 0.38, -w * 0.32, -h * 0.24, -w * 0.30, 0);
    ctx.bezierCurveTo(-w * 0.32, h * 0.24, -w * 0.20, h * 0.38, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#101014';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();

    // D. Slender Velvety Mahogany-Ruby Body
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.44, -h * 0.02);
    bodyPath.quadraticCurveTo(w * 0.15, -h * 0.22, -w * 0.40, -h * 0.04);
    bodyPath.lineTo(-w * 0.40, h * 0.04);
    bodyPath.quadraticCurveTo(w * 0.15, h * 0.22, w * 0.44, -h * 0.02);
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(-w * 0.42, 0, w * 0.44, 0);
    bodyGrad.addColorStop(0, '#590D22');
    bodyGrad.addColorStop(0.5, '#A4133C');
    bodyGrad.addColorStop(1, '#FF4D6D');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // E. Clipped Interior: Subtle dark scale shading
    ctx.clip(bodyPath);
    const dorsalGrad = ctx.createLinearGradient(0, -h * 0.22, 0, 0);
    dorsalGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
    dorsalGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dorsalGrad;
    ctx.fillRect(-w * 0.45, -h * 0.25, w, h * 0.5);
    ctx.restore();

    // F. Realistic Wild Betta Eye
    const eyeX = w * 0.32;
    const eyeY = -h * 0.05;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.2, '#FFD166', 0.52);

    // G. Flared Pectoral Fin with White Tip
    ctx.fillStyle = '#C9184A';
    ctx.beginPath();
    ctx.ellipse(w * 0.18, h * 0.08, 11, 5, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // H. White-tipped pelvic filaments
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.16, h * 0.14);
    ctx.quadraticCurveTo(w * 0.12, h * 0.35, w * 0.05, h * 0.48);
    ctx.stroke();
  }

  // ============================================================================
  // 6. RAINBOWFISH (Boesemani, Sentani, Kurumoi, Celebes Beseng-beseng)
  // ============================================================================
  private static drawRainbowFish(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;
    const isBoesemani = sp.id === 'boesemani_rainbow';
    const isSentani = sp.id === 'incisus_rainbow';
    const isBeseng = sp.id === 'beseng_beseng';
    const isKurumoi = sp.id === 'rainbow_kurumoi';

    // A. Double Dorsal Fins (Anatomical hallmark of Melanotaeniidae)
    // 1st Spiny Small Dorsal Fin
    ctx.save();
    ctx.fillStyle = sp.colors.fins;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, -h * 0.24);
    ctx.lineTo(w * 0.02, -h * 0.40);
    ctx.lineTo(-w * 0.04, -h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Filamentous black rays for Celebes Rainbow (Beseng-beseng)
    if (isBeseng) {
      ctx.strokeStyle = '#101014';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.02, -h * 0.40);
      ctx.lineTo(-w * 0.06, -h * 0.58);
      ctx.stroke();
    }
    ctx.restore();

    // 2nd Broad Soft-Rayed Dorsal Fin
    ctx.save();
    ctx.fillStyle = isKurumoi ? '#C9184A' : sp.colors.fins;
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, -h * 0.26);
    ctx.quadraticCurveTo(-w * 0.24, -h * 0.48, -w * 0.38, -h * 0.14);
    ctx.lineTo(-w * 0.20, -h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isKurumoi ? '#101014' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // B. Broad Anal Fin
    ctx.save();
    ctx.fillStyle = isKurumoi ? '#A4133C' : sp.colors.fins;
    ctx.beginPath();
    ctx.moveTo(-w * 0.04, h * 0.24);
    ctx.quadraticCurveTo(-w * 0.22, h * 0.44, -w * 0.38, h * 0.12);
    ctx.lineTo(-w * 0.18, h * 0.20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isKurumoi ? '#101014' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // C. Forked Caudal Tail
    ctx.save();
    ctx.translate(-w * 0.42, waggleOffset);
    ctx.fillStyle = isKurumoi ? '#C9184A' : sp.colors.fins;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.22, -h * 0.30);
    ctx.quadraticCurveTo(-w * 0.12, 0, -w * 0.22, h * 0.30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isKurumoi ? '#101014' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // D. High-Backed Diamond Body Profile
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.44, 0); // Pointed snout
    bodyPath.quadraticCurveTo(w * 0.10, -h * 0.42, -w * 0.42, 0); // High arched back
    bodyPath.quadraticCurveTo(w * 0.10, h * 0.38, w * 0.44, 0); // Deep rounded chest
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(-w * 0.45, 0, w * 0.45, 0);
    if (isBoesemani) {
      // Signature Boesemani two-tone split: cobalt-blue head to sunset-orange tail
      bodyGrad.addColorStop(0, '#E76F51');
      bodyGrad.addColorStop(0.48, '#F4A261');
      bodyGrad.addColorStop(0.52, '#2A6F97');
      bodyGrad.addColorStop(1, '#01497C');
    } else if (isSentani) {
      // Radiant ruby red "burning coal"
      bodyGrad.addColorStop(0, '#6A040F');
      bodyGrad.addColorStop(0.5, '#C9182B');
      bodyGrad.addColorStop(1, '#FF4D6D');
    } else if (isKurumoi) {
      // Royal purple & electric magenta
      bodyGrad.addColorStop(0, '#3C096C');
      bodyGrad.addColorStop(0.45, '#7B2CBF');
      bodyGrad.addColorStop(0.80, '#C77DFF');
      bodyGrad.addColorStop(1, '#E0AAFF');
    } else if (isBeseng) {
      // Translucent honey-amber
      bodyGrad.addColorStop(0, '#DDA15E');
      bodyGrad.addColorStop(0.5, '#EE9B00');
      bodyGrad.addColorStop(1, '#CA6702');
    } else {
      bodyGrad.addColorStop(0, sp.colors.secondary);
      bodyGrad.addColorStop(0.6, sp.colors.primary);
      bodyGrad.addColorStop(1, sp.colors.accent || sp.colors.primary);
    }
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // E. Clipped Interior: Shimmer, Scale Highlights, Species Cues
    ctx.clip(bodyPath);

    // Counter-shading
    const dorsalGrad = ctx.createLinearGradient(0, -h * 0.42, 0, 0);
    dorsalGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    dorsalGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dorsalGrad;
    ctx.fillRect(-w * 0.45, -h * 0.45, w, h * 0.5);

    // Sentani sparkling silver dorsal flecks ("bara api")
    if (isSentani) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.3;
      for (let i = -3; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * (w * 0.08), -h * 0.16, 4.5, 0.4, Math.PI - 0.4);
        ctx.stroke();
      }
    }

    // Beseng-beseng glowing electric turquoise lateral spine line
    if (isBeseng) {
      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.38, 0);
      ctx.lineTo(w * 0.20, 0);
      ctx.stroke();
    }

    // Boesemani subtle scale pinstripes
    if (isBoesemani) {
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
      ctx.lineWidth = 1;
      [-h * 0.1, 0, h * 0.1].forEach((yPos) => {
        ctx.beginPath();
        ctx.moveTo(w * 0.05, yPos);
        ctx.lineTo(w * 0.35, yPos * 0.5);
        ctx.stroke();
      });
    }
    ctx.restore();

    // F. Operculum
    ctx.strokeStyle = isSentani ? '#FF99A8' : '#DDA15E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(w * 0.24, 0, h * 0.14, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.stroke();

    // G. Realistic Eye
    const eyeX = w * 0.32;
    const eyeY = -h * 0.05;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.4, isSentani ? '#FFD166' : '#C77DFF', 0.52);

    // H. Pectoral Fin
    ctx.fillStyle = sp.colors.fins;
    ctx.beginPath();
    ctx.ellipse(w * 0.18, h * 0.06, 11, 5, Math.PI * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ============================================================================
  // 7. TIGER BARB (Ikan Sumatra / Puntigrus tetrazona)
  // ============================================================================
  private static drawTigerBarb(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Dorsal Fin (Jet black base with blazing red crest)
    ctx.save();
    ctx.fillStyle = '#101014';
    ctx.beginPath();
    ctx.moveTo(w * 0.02, -h * 0.28);
    ctx.lineTo(-w * 0.08, -h * 0.54);
    ctx.lineTo(-w * 0.22, -h * 0.18);
    ctx.closePath();
    ctx.fill();
    // Blazing red crest
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(w * 0.02, -h * 0.28);
    ctx.lineTo(-w * 0.08, -h * 0.54);
    ctx.lineTo(-w * 0.03, -h * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // B. Ventral / Anal Fins (Bright orange-red)
    ctx.save();
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, h * 0.22);
    ctx.lineTo(-w * 0.16, h * 0.44);
    ctx.lineTo(-w * 0.22, h * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // C. Caudal Tail Fin (Forked with red borders)
    ctx.save();
    ctx.translate(-w * 0.40, waggleOffset);
    ctx.fillStyle = 'rgba(235, 195, 135, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.20, -h * 0.30);
    ctx.quadraticCurveTo(-w * 0.10, 0, -w * 0.20, h * 0.30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // D. Compact Diamond Body Profile
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.44, 0); // Pointed snout
    bodyPath.quadraticCurveTo(w * 0.05, -h * 0.42, -w * 0.40, 0);
    bodyPath.quadraticCurveTo(w * 0.05, h * 0.38, w * 0.44, 0);
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -h * 0.35, 0, h * 0.25);
    bodyGrad.addColorStop(0, '#E9C46A');
    bodyGrad.addColorStop(0.5, '#F4A261');
    bodyGrad.addColorStop(1, '#FFF3B0');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // E. Clipped Interior: 4 Sharp Vertical Black Bars (CLIPPED, NEVER BLEED!)
    ctx.clip(bodyPath);

    ctx.fillStyle = '#101014';
    [-w * 0.26, -w * 0.06, w * 0.12, w * 0.28].forEach((bx, idx) => {
      ctx.beginPath();
      const barHeight = idx === 1 ? h * 0.44 : idx === 2 ? h * 0.42 : h * 0.35;
      ctx.ellipse(bx, 0, w * 0.042, barHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // F. Brilliant Fiery Orange-Red Snout Tip!
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(w * 0.43, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // G. Realistic Eye (Sits naturally in 4th bar)
    const eyeX = w * 0.28;
    const eyeY = -h * 0.04;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.0, '#E63946', 0.55);
  }

  // ============================================================================
  // 8. TIGERFISH (Datnioides microlepis / Ikan Elang)
  // ============================================================================
  private static drawTigerfish(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Spiny Anterior Dorsal Fin (Prominent sharp spines)
    ctx.save();
    ctx.fillStyle = '#1D1E2C';
    ctx.beginPath();
    ctx.moveTo(w * 0.08, -h * 0.28);
    ctx.lineTo(w * 0.02, -h * 0.48);
    ctx.lineTo(-w * 0.12, -h * 0.38);
    ctx.lineTo(-w * 0.10, -h * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#DDA15E';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // B. Soft Posterior Dorsal Fin
    ctx.save();
    ctx.fillStyle = 'rgba(221, 161, 94, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.10, -h * 0.28);
    ctx.quadraticCurveTo(-w * 0.25, -h * 0.44, -w * 0.38, -h * 0.14);
    ctx.lineTo(-w * 0.20, -h * 0.20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 20, 20, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // C. Soft Anal Fin
    ctx.save();
    ctx.fillStyle = 'rgba(221, 161, 94, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.06, h * 0.26);
    ctx.quadraticCurveTo(-w * 0.22, h * 0.42, -w * 0.38, h * 0.12);
    ctx.lineTo(-w * 0.18, h * 0.20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // D. Caudal Tail Fin (Fan-shaped with black basal bar)
    ctx.save();
    ctx.translate(-w * 0.40, waggleOffset);
    ctx.fillStyle = 'rgba(235, 195, 135, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-w * 0.18, -h * 0.28, -w * 0.22, 0);
    ctx.quadraticCurveTo(-w * 0.18, h * 0.28, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1D1E2C';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Black bar at base of tail
    ctx.fillStyle = '#101014';
    ctx.fillRect(-w * 0.06, -h * 0.15, w * 0.04, h * 0.30);
    ctx.restore();

    // E. Massive Rhomboid Predator Body (Steep concave forehead slope)
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.45, h * 0.05); // Protruding predatory jaw
    bodyPath.quadraticCurveTo(w * 0.30, -h * 0.16, w * 0.12, -h * 0.30); // Concave forehead slope
    bodyPath.quadraticCurveTo(0, -h * 0.44, -w * 0.40, -h * 0.08); // High dorsal hump to peduncle
    bodyPath.lineTo(-w * 0.40, h * 0.08); // Peduncle
    bodyPath.quadraticCurveTo(0, h * 0.42, w * 0.45, h * 0.05); // Deep chest and belly
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -h * 0.38, 0, h * 0.30);
    bodyGrad.addColorStop(0, '#9A6B2F');
    bodyGrad.addColorStop(0.40, '#DDA15E');
    bodyGrad.addColorStop(0.75, '#BC6C25');
    bodyGrad.addColorStop(1, '#FFE3A8');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // F. Clipped Interior: 6-7 Bold Organic Vertical Tiger Bars (NEVER BLEED OUT!)
    ctx.clip(bodyPath);

    // Soft dorsal shading
    const dorsalGrad = ctx.createLinearGradient(0, -h * 0.44, 0, 0);
    dorsalGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    dorsalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = dorsalGrad;
    ctx.fillRect(-w * 0.45, -h * 0.45, w, h * 0.5);

    // Vertical Tiger Bars (Tapered, organic, beautifully following the contour)
    ctx.fillStyle = '#101014';
    const tigerBars = [
      { x: w * 0.22, topW: w * 0.045, botW: w * 0.035, angle: 0.15 },  // Over eye & operculum
      { x: w * 0.06, topW: w * 0.060, botW: w * 0.040, angle: 0.05 },  // Spiny dorsal to pelvic
      { x: -w * 0.10, topW: w * 0.075, botW: w * 0.050, angle: -0.05 }, // Major central body bar
      { x: -w * 0.25, topW: w * 0.055, botW: w * 0.035, angle: -0.10 }, // Posterior bar
      { x: -w * 0.35, topW: w * 0.040, botW: w * 0.025, angle: -0.08 }  // Peduncle bar
    ];

    tigerBars.forEach((bar) => {
      ctx.save();
      ctx.translate(bar.x, 0);
      ctx.rotate(bar.angle);
      ctx.beginPath();
      ctx.moveTo(-bar.topW / 2, -h * 0.45);
      ctx.lineTo(bar.topW / 2, -h * 0.45);
      ctx.lineTo(bar.botW / 2, h * 0.45);
      ctx.lineTo(-bar.botW / 2, h * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Subtle scale texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let r = -2; r <= 2; r++) {
      for (let c = -3; c <= 2; c++) {
        ctx.beginPath();
        ctx.arc(c * (w * 0.09), r * (h * 0.08), 7, 0.3, Math.PI - 0.3);
        ctx.stroke();
      }
    }
    ctx.restore();

    // G. Operculum (Gill Plate with Golden Luster)
    ctx.strokeStyle = '#DDA15E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(w * 0.22, 0, h * 0.18, -Math.PI * 0.40, Math.PI * 0.40);
    ctx.stroke();

    // H. Realistic Predatory Eye
    const eyeX = w * 0.28;
    const eyeY = -h * 0.08;
    this.drawRealisticEye(ctx, eyeX, eyeY, 6.2, '#DDA15E', 0.55);

    // I. Pectoral Fin
    ctx.fillStyle = 'rgba(221, 161, 94, 0.85)';
    ctx.beginPath();
    ctx.ellipse(w * 0.15, h * 0.10, 14, 7, Math.PI * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1D1E2C';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ============================================================================
  // 9. MEDAKA SULAWESI (Oryzias woworae)
  // ============================================================================
  private static drawMedaka(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    const waggleOffset = Math.sin(waggle) * 4;

    // A. Scissor Tail with Fiery Red Edges & Clear Center
    ctx.save();
    ctx.translate(-w * 0.40, waggleOffset);
    // Upper red margin
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.20, -h * 0.22);
    ctx.lineTo(-w * 0.14, -h * 0.10);
    ctx.closePath();
    ctx.fill();
    // Lower red margin
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.20, h * 0.22);
    ctx.lineTo(-w * 0.14, h * 0.10);
    ctx.closePath();
    ctx.fill();
    // Clear center
    ctx.fillStyle = 'rgba(200, 240, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.14, -h * 0.10);
    ctx.lineTo(-w * 0.14, h * 0.10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // B. Slender Translucent Bluish Body Profile
    ctx.save();
    const bodyPath = new Path2D();
    bodyPath.moveTo(w * 0.44, 0);
    bodyPath.quadraticCurveTo(w * 0.15, -h * 0.18, -w * 0.40, 0);
    bodyPath.quadraticCurveTo(w * 0.15, h * 0.18, w * 0.44, 0);
    bodyPath.closePath();

    const bodyGrad = ctx.createLinearGradient(-w * 0.40, 0, w * 0.42, 0);
    bodyGrad.addColorStop(0, '#90E0EF');
    bodyGrad.addColorStop(0.5, '#48CAE4');
    bodyGrad.addColorStop(1, '#00B4D8');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    // C. Clipped Interior: Shimmer
    ctx.clip(bodyPath);
    const bellyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.18);
    bellyGrad.addColorStop(0, 'rgba(255,255,255,0)');
    bellyGrad.addColorStop(1, 'rgba(255, 117, 143, 0.35)'); // Reddish throat/belly
    ctx.fillStyle = bellyGrad;
    ctx.fillRect(-w * 0.4, 0, w * 0.8, h * 0.2);
    ctx.restore();

    // D. Electric Cyan-Blue Neon Eye (Mata Biru Khas Woworae!)
    const eyeX = w * 0.28;
    const eyeY = -h * 0.04;
    this.drawRealisticEye(ctx, eyeX, eyeY, 5.8, '#00F5D4', 0.50);
  }

  // ============================================================================
  // GENERIC REALISTIC FISH (Fallback)
  // ============================================================================
  private static drawGenericRealFish(ctx: CanvasRenderingContext2D, sp: FishSpecies, w: number, h: number, waggle: number): void {
    this.drawRainbowFish(ctx, sp, w, h, waggle);
  }

  /**
   * Pre-renders all game textures into Phaser's Texture Manager (High-DPI 320x180 resolution)
   */
  public static initPhaserTextures(scene: Phaser.Scene): void {
    // 1. Generate High-Definition Fish Textures
    FISH_SPECIES_LIST.forEach((sp) => {
      const texKey = `fish_${sp.id}`;
      if (!scene.textures.exists(texKey)) {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.drawFish(ctx, sp, 160, 90, 260, 150, 0);
          scene.textures.addCanvas(texKey, canvas);
        }
      }
    });

    // 2. Bubble Texture
    if (!scene.textures.exists('bubble_particle')) {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 32;
      bCanvas.height = 32;
      const bCtx = bCanvas.getContext('2d');
      if (bCtx) {
        const grad = bCtx.createRadialGradient(12, 12, 2, 16, 16, 15);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.3, 'rgba(180, 240, 255, 0.6)');
        grad.addColorStop(0.8, 'rgba(100, 200, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        bCtx.fillStyle = grad;
        bCtx.beginPath();
        bCtx.arc(16, 16, 14, 0, Math.PI * 2);
        bCtx.fill();

        // High glint
        bCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        bCtx.beginPath();
        bCtx.arc(11, 10, 3, 0, Math.PI * 2);
        bCtx.fill();

        scene.textures.addCanvas('bubble_particle', bCanvas);
      }
    }

    // 3. Food Flake / Pellet Texture
    if (!scene.textures.exists('food_flake')) {
      const fCanvas = document.createElement('canvas');
      fCanvas.width = 16;
      fCanvas.height = 16;
      const fCtx = fCanvas.getContext('2d');
      if (fCtx) {
        fCtx.fillStyle = '#D97706';
        fCtx.beginPath();
        fCtx.ellipse(8, 8, 6, 4, 0.2, 0, Math.PI * 2);
        fCtx.fill();

        fCtx.fillStyle = '#F59E0B';
        fCtx.beginPath();
        fCtx.arc(7, 7, 2, 0, Math.PI * 2);
        fCtx.fill();

        scene.textures.addCanvas('food_flake', fCanvas);
      }
    }

    // 4. Plant Vallisneria Texture
    if (!scene.textures.exists('plant_vallisneria')) {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 90;
      pCanvas.height = 240;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        // Draw 3 waving aquatic leaves
        const leaves = [
          { startX: 45, cpX: 20, endX: 30, h: 220, col: '#2D6A4F' },
          { startX: 45, cpX: 65, endX: 55, h: 200, col: '#40916C' },
          { startX: 45, cpX: 35, endX: 40, h: 230, col: '#52B788' }
        ];

        leaves.forEach((lf) => {
          pCtx.strokeStyle = lf.col;
          pCtx.lineWidth = 8;
          pCtx.lineCap = 'round';
          pCtx.beginPath();
          pCtx.moveTo(lf.startX, 240);
          pCtx.quadraticCurveTo(lf.cpX, 240 - lf.h * 0.5, lf.endX, 240 - lf.h);
          pCtx.stroke();
        });

        scene.textures.addCanvas('plant_vallisneria', pCanvas);
      }
    }

    // 5. River Rock Texture
    if (!scene.textures.exists('rock_karst')) {
      const rCanvas = document.createElement('canvas');
      rCanvas.width = 120;
      rCanvas.height = 80;
      const rCtx = rCanvas.getContext('2d');
      if (rCtx) {
        const grad = rCtx.createLinearGradient(0, 0, 0, 80);
        grad.addColorStop(0, '#5C677D');
        grad.addColorStop(1, '#33415C');

        rCtx.fillStyle = grad;
        rCtx.beginPath();
        rCtx.moveTo(20, 75);
        rCtx.quadraticCurveTo(10, 40, 35, 20);
        rCtx.quadraticCurveTo(60, 5, 85, 25);
        rCtx.quadraticCurveTo(115, 45, 105, 75);
        rCtx.closePath();
        rCtx.fill();

        // Highlight
        rCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        rCtx.lineWidth = 2;
        rCtx.stroke();

        scene.textures.addCanvas('rock_karst', rCanvas);
      }
    }

    // 6. Aerator Diffuser Stone
    if (!scene.textures.exists('aerator_diffuser')) {
      const aCanvas = document.createElement('canvas');
      aCanvas.width = 40;
      aCanvas.height = 30;
      const aCtx = aCanvas.getContext('2d');
      if (aCtx) {
        // Air stone cylinder
        const grad = aCtx.createLinearGradient(0, 5, 0, 25);
        grad.addColorStop(0, '#709775');
        grad.addColorStop(0.5, '#415D43');
        grad.addColorStop(1, '#111D13');
        aCtx.fillStyle = grad;
        aCtx.beginPath();
        aCtx.roundRect(8, 10, 24, 15, 4);
        aCtx.fill();

        // Porous texture dots
        aCtx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 8; i++) {
          aCtx.fillRect(10 + (i % 4) * 5, 12 + Math.floor(i / 4) * 5, 2, 2);
        }

        // Connector tube
        aCtx.fillStyle = '#A0C4E2';
        aCtx.fillRect(17, 2, 6, 8);

        scene.textures.addCanvas('aerator_diffuser', aCanvas);
      }
    }

    // 7. Bio-Sponge Filter Hardware
    if (!scene.textures.exists('filter_sponge_unit')) {
      const fCanvas = document.createElement('canvas');
      fCanvas.width = 70;
      fCanvas.height = 140;
      const fCtx = fCanvas.getContext('2d');
      if (fCtx) {
        // Vertical riser pipe
        const pipeGrad = fCtx.createLinearGradient(30, 0, 40, 0);
        pipeGrad.addColorStop(0, 'rgba(200, 230, 255, 0.7)');
        pipeGrad.addColorStop(1, 'rgba(100, 160, 210, 0.5)');
        fCtx.fillStyle = pipeGrad;
        fCtx.fillRect(32, 10, 8, 100);

        // Angled exhaust outlet at top
        fCtx.beginPath();
        fCtx.moveTo(32, 10);
        fCtx.lineTo(20, 4);
        fCtx.lineTo(20, 14);
        fCtx.lineTo(40, 18);
        fCtx.closePath();
        fCtx.fill();

        // Sponge block (dark ribbed foam)
        const spongeGrad = fCtx.createLinearGradient(12, 60, 58, 60);
        spongeGrad.addColorStop(0, '#212529');
        spongeGrad.addColorStop(0.4, '#343A40');
        spongeGrad.addColorStop(1, '#1A1D20');
        fCtx.fillStyle = spongeGrad;
        fCtx.beginPath();
        fCtx.roundRect(16, 55, 38, 75, 6);
        fCtx.fill();

        // Ribs
        fCtx.strokeStyle = 'rgba(255,255,255,0.12)';
        fCtx.lineWidth = 2;
        for (let y = 65; y < 125; y += 10) {
          fCtx.beginPath();
          fCtx.moveTo(18, y);
          fCtx.lineTo(52, y);
          fCtx.stroke();
        }

        // Suction cup
        fCtx.fillStyle = 'rgba(220, 240, 255, 0.4)';
        fCtx.beginPath();
        fCtx.arc(36, 134, 8, 0, Math.PI * 2);
        fCtx.fill();

        scene.textures.addCanvas('filter_sponge_unit', fCanvas);
      }
    }

    // 8. Advanced Bio-Canister Filter Unit
    if (!scene.textures.exists('filter_canister_unit')) {
      const cCanvas = document.createElement('canvas');
      cCanvas.width = 90;
      cCanvas.height = 150;
      const cCtx = cCanvas.getContext('2d');
      if (cCtx) {
        // Acrylic transparent chamber
        cCtx.fillStyle = 'rgba(18, 61, 80, 0.85)';
        cCtx.strokeStyle = 'rgba(128, 237, 153, 0.6)';
        cCtx.lineWidth = 2;
        cCtx.beginPath();
        cCtx.roundRect(15, 20, 60, 115, 8);
        cCtx.fill();
        cCtx.stroke();

        // Internal ceramic bio-rings
        cCtx.fillStyle = '#E9ECEF';
        for (let i = 0; i < 9; i++) {
          const cx = 28 + (i % 3) * 17;
          const cy = 60 + Math.floor(i / 3) * 18;
          cCtx.beginPath();
          cCtx.arc(cx, cy, 6, 0, Math.PI * 2);
          cCtx.fill();
          cCtx.fillStyle = '#6C757D';
          cCtx.beginPath();
          cCtx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          cCtx.fill();
          cCtx.fillStyle = '#E9ECEF';
        }

        // Horizontal spray bar at top with water jets
        cCtx.fillStyle = '#0B5367';
        cCtx.fillRect(10, 12, 70, 7);

        // Green power LED
        cCtx.fillStyle = '#80ED99';
        cCtx.beginPath();
        cCtx.arc(22, 28, 3, 0, Math.PI * 2);
        cCtx.fill();

        scene.textures.addCanvas('filter_canister_unit', cCanvas);
      }
    }

    // 9. Lush Anubias Broad-leaf Plant
    if (!scene.textures.exists('plant_anubias')) {
      const aCanvas = document.createElement('canvas');
      aCanvas.width = 90;
      aCanvas.height = 90;
      const aCtx = aCanvas.getContext('2d');
      if (aCtx) {
        // Dark green broad leaves
        const leaves = [
          { x: 45, y: 55, rx: 20, ry: 13, rot: -0.4, col: '#1E4620' },
          { x: 30, y: 40, rx: 18, ry: 11, rot: -0.8, col: '#2D6A4F' },
          { x: 60, y: 42, rx: 19, ry: 12, rot: 0.5, col: '#2D6A4F' },
          { x: 45, y: 30, rx: 22, ry: 14, rot: 0, col: '#40916C' },
          { x: 35, y: 18, rx: 16, ry: 10, rot: -0.2, col: '#52B788' }
        ];

        leaves.forEach((lf) => {
          aCtx.save();
          aCtx.translate(lf.x, lf.y);
          aCtx.rotate(lf.rot);
          aCtx.fillStyle = lf.col;
          aCtx.beginPath();
          aCtx.ellipse(0, 0, lf.rx, lf.ry, 0, 0, Math.PI * 2);
          aCtx.fill();

          // Central leaf vein
          aCtx.strokeStyle = 'rgba(255,255,255,0.25)';
          aCtx.lineWidth = 1.5;
          aCtx.beginPath();
          aCtx.moveTo(-lf.rx * 0.8, 0);
          aCtx.lineTo(lf.rx * 0.8, 0);
          aCtx.stroke();
          aCtx.restore();
        });

        // Stems
        aCtx.strokeStyle = '#1E4620';
        aCtx.lineWidth = 3;
        aCtx.beginPath();
        aCtx.moveTo(45, 85);
        aCtx.lineTo(45, 45);
        aCtx.stroke();

        scene.textures.addCanvas('plant_anubias', aCanvas);
      }
    }

    // 10. Tropical Root Driftwood
    if (!scene.textures.exists('wood_driftwood')) {
      const dCanvas = document.createElement('canvas');
      dCanvas.width = 160;
      dCanvas.height = 110;
      const dCtx = dCanvas.getContext('2d');
      if (dCtx) {
        dCtx.strokeStyle = '#583101';
        dCtx.lineWidth = 12;
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';

        // Main trunk
        dCtx.beginPath();
        dCtx.moveTo(15, 100);
        dCtx.quadraticCurveTo(60, 70, 110, 45);
        dCtx.quadraticCurveTo(135, 30, 150, 15);
        dCtx.stroke();

        // Branch 1
        dCtx.lineWidth = 7;
        dCtx.strokeStyle = '#6F4E37';
        dCtx.beginPath();
        dCtx.moveTo(75, 62);
        dCtx.quadraticCurveTo(90, 85, 120, 100);
        dCtx.stroke();

        // Branch 2
        dCtx.lineWidth = 5;
        dCtx.strokeStyle = '#8B5A2B';
        dCtx.beginPath();
        dCtx.moveTo(110, 45);
        dCtx.quadraticCurveTo(120, 60, 145, 70);
        dCtx.stroke();

        // Highlights
        dCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        dCtx.lineWidth = 2;
        dCtx.beginPath();
        dCtx.moveTo(25, 95);
        dCtx.quadraticCurveTo(60, 68, 105, 43);
        dCtx.stroke();

        scene.textures.addCanvas('wood_driftwood', dCanvas);
      }
    }

    // 11. River Pebbles Cluster
    if (!scene.textures.exists('rock_pebbles')) {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 80;
      pCanvas.height = 50;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        const pebbles = [
          { x: 22, y: 35, rx: 16, ry: 10, col: '#495057' },
          { x: 55, y: 36, rx: 18, ry: 11, col: '#6C757D' },
          { x: 38, y: 22, rx: 14, ry: 9, col: '#ADB5BD' },
          { x: 62, y: 20, rx: 11, ry: 7, col: '#495057' }
        ];

        pebbles.forEach((peb) => {
          pCtx.fillStyle = peb.col;
          pCtx.beginPath();
          pCtx.ellipse(peb.x, peb.y, peb.rx, peb.ry, 0, 0, Math.PI * 2);
          pCtx.fill();

          pCtx.strokeStyle = 'rgba(255,255,255,0.3)';
          pCtx.lineWidth = 1.2;
          pCtx.beginPath();
          pCtx.arc(peb.x - 3, peb.y - 3, peb.ry * 0.5, 0.8, Math.PI * 0.9);
          pCtx.stroke();
        });

        scene.textures.addCanvas('rock_pebbles', pCanvas);
      }
    }

    // 12. Slim LED Aquarium Light Fixture
    if (!scene.textures.exists('led_light_bar')) {
      const lCanvas = document.createElement('canvas');
      lCanvas.width = 400;
      lCanvas.height = 20;
      const lCtx = lCanvas.getContext('2d');
      if (lCtx) {
        // Slim black aluminum bar
        lCtx.fillStyle = '#1A1D20';
        lCtx.roundRect(10, 4, 380, 10, 4);
        lCtx.fill();

        // Glowing LED strip underneath
        const ledGrad = lCtx.createLinearGradient(20, 0, 380, 0);
        ledGrad.addColorStop(0, '#A0E8AF');
        ledGrad.addColorStop(0.3, '#FFFFFF');
        ledGrad.addColorStop(0.7, '#CAF0F8');
        ledGrad.addColorStop(1, '#A0E8AF');
        lCtx.fillStyle = ledGrad;
        lCtx.fillRect(25, 12, 350, 2);

        // Mounting leg brackets on ends
        lCtx.fillStyle = '#CED4DA';
        lCtx.fillRect(6, 0, 8, 18);
        lCtx.fillRect(386, 0, 8, 18);

        scene.textures.addCanvas('led_light_bar', lCanvas);
      }
    }

    // 13. Ancient Sriwijaya Relic / Temple Ruin (Arca Kuno)
    if (!scene.textures.exists('ruin_sriwijaya')) {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 90;
      sCanvas.height = 120;
      const sCtx = sCanvas.getContext('2d');
      if (sCtx) {
        // Base Tier
        sCtx.fillStyle = '#3A444C';
        sCtx.fillRect(10, 80, 70, 36);

        // Mid Tier
        sCtx.fillStyle = '#49535C';
        sCtx.fillRect(20, 48, 50, 32);

        // Stupa Crown
        sCtx.fillStyle = '#5A6570';
        sCtx.beginPath();
        sCtx.moveTo(45, 12);
        sCtx.lineTo(62, 48);
        sCtx.lineTo(28, 48);
        sCtx.closePath();
        sCtx.fill();

        // Carved niche
        sCtx.fillStyle = '#222831';
        sCtx.fillRect(36, 56, 18, 22);

        // Moss & aquatic algae highlights
        sCtx.fillStyle = 'rgba(54, 166, 92, 0.65)';
        sCtx.fillRect(12, 106, 66, 8);
        sCtx.fillRect(18, 76, 30, 6);
        sCtx.fillRect(45, 42, 18, 5);

        // Stone cracks
        sCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        sCtx.lineWidth = 1.5;
        sCtx.beginPath();
        sCtx.moveTo(25, 60);
        sCtx.lineTo(30, 72);
        sCtx.lineTo(28, 85);
        sCtx.moveTo(58, 88);
        sCtx.lineTo(64, 102);
        sCtx.stroke();

        scene.textures.addCanvas('ruin_sriwijaya', sCanvas);
      }
    }

    // Aliases to guarantee texture lookups never fail
    if (scene.textures.exists('plant_vallisneria') && !scene.textures.exists('deco_vallisneria')) {
      scene.textures.addCanvas('deco_vallisneria', scene.textures.get('plant_vallisneria').getSourceImage() as HTMLCanvasElement);
    }
    if (scene.textures.exists('plant_anubias') && !scene.textures.exists('deco_anubias')) {
      scene.textures.addCanvas('deco_anubias', scene.textures.get('plant_anubias').getSourceImage() as HTMLCanvasElement);
    }
    if (scene.textures.exists('wood_driftwood') && !scene.textures.exists('deco_driftwood')) {
      scene.textures.addCanvas('deco_driftwood', scene.textures.get('wood_driftwood').getSourceImage() as HTMLCanvasElement);
    }
    if (scene.textures.exists('rock_karst') && !scene.textures.exists('deco_maros_rock')) {
      scene.textures.addCanvas('deco_maros_rock', scene.textures.get('rock_karst').getSourceImage() as HTMLCanvasElement);
    }
    if (scene.textures.exists('ruin_sriwijaya') && !scene.textures.exists('deco_sriwijaya_ruin')) {
      scene.textures.addCanvas('deco_sriwijaya_ruin', scene.textures.get('ruin_sriwijaya').getSourceImage() as HTMLCanvasElement);
    }
  }
}
