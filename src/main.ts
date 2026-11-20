import './styles/main.css';
import './styles/hud.css';
import './styles/modals.css';

import Phaser from 'phaser';
import { createPhaserConfig } from './game/config/phaserConfig';
import { AquariumScene } from './game/scenes/AquariumScene';
import { HUD } from './components/HUD';
import { sound } from './services/soundService';
import { PlayerFish } from './types/game';

window.addEventListener('DOMContentLoaded', () => {
  const phaserContainer = document.getElementById('phaser-container');
  if (!phaserContainer) return;

  // 1. Initialize Phaser 3 Game Engine
  const config = createPhaserConfig(phaserContainer);
  const game = new Phaser.Game(config);

  // 2. Initialize Modern Aquatic HUD & Modals
  const hud = new HUD();

  // 3. Connect Scene and HUD once scene is ready
  game.events.once('ready', () => {
    const aquariumScene = game.scene.getScene('AquariumScene') as AquariumScene;
    if (aquariumScene) {
      // Direct feed button hook
      hud.onFeedRequested = () => {
        const { width, height } = aquariumScene.scale;
        aquariumScene.dropFood(width / 2, height * 0.25);
      };

      // Fish click inspection hook
      aquariumScene.onInspectFish = (fish: PlayerFish) => {
        hud.inspectFish(fish);
      };
    }
  });

  // 4. Start soft aquatic ambient on first interaction
  const startAudioOnGesture = () => {
    sound.startAmbient();
    window.removeEventListener('pointerdown', startAudioOnGesture);
    window.removeEventListener('keydown', startAudioOnGesture);
  };
  window.addEventListener('pointerdown', startAudioOnGesture);
  window.addEventListener('keydown', startAudioOnGesture);

  // 5. Mobile Chrome Landscape Orientation Manager
  const rotateOverlay = document.getElementById('rotate-overlay');
  const btnFullscreen = document.getElementById('btn-fullscreen-landscape');

  const checkOrientation = () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (rotateOverlay) {
      if (isPortrait) {
        rotateOverlay.classList.add('force-show');
        rotateOverlay.classList.remove('force-hide');
      } else {
        rotateOverlay.classList.remove('force-show');
        rotateOverlay.classList.add('force-hide');
      }
    }
  };

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 150);
  });
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', checkOrientation);
  }
  checkOrientation();

  // Fullscreen & Screen Orientation Lock for Android / Chrome Mobile
  btnFullscreen?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      }
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {
      // Browser permissions or platform-specific catch
    }
    setTimeout(checkOrientation, 250);
  });
});
