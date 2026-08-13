/**
 * Application Entry Point
 */

import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIController();
  ui.init();
  console.log("Barcode Battler initialized successfully!");
});
