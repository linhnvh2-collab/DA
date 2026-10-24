import * as THREE from 'three';

// Cache generated textures to avoid redundant canvas rendering
const textureCache: Record<string, THREE.CanvasTexture> = {};

export function getProceduralTexture(type: string, renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  if (textureCache[type]) {
    return textureCache[type];
  }

  let canvas: HTMLCanvasElement;
  switch (type) {
    case 'sun':
      canvas = createSunCanvas();
      break;
    case 'mercury':
      canvas = createMercuryCanvas();
      break;
    case 'venus':
      canvas = createVenusCanvas();
      break;
    case 'earth':
      canvas = createEarthCanvas();
      break;
    case 'earth_clouds':
      canvas = createEarthCloudsCanvas();
      break;
    case 'moon':
      canvas = createMoonCanvas();
      break;
    case 'mars':
      canvas = createMarsCanvas();
      break;
    case 'jupiter':
      canvas = createJupiterCanvas();
      break;
    case 'saturn':
      canvas = createSaturnCanvas();
      break;
    case 'saturn_rings':
      canvas = createSaturnRingsCanvas();
      break;
    case 'uranus':
      canvas = createUranusCanvas();
      break;
    case 'neptune':
      canvas = createNeptuneCanvas();
      break;
    case 'star_glow':
      canvas = createStarGlowCanvas();
      break;
    case 'galaxy_core':
      canvas = createGalaxyCoreCanvas();
      break;
    default:
      canvas = createDefaultNoiseCanvas('#888888');
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (renderer) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  texture.needsUpdate = true;
  textureCache[type] = texture;
  return texture;
}

// 1. Sun Texture
function createSunCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#ff7700');
  grad.addColorStop(0.3, '#ffaa00');
  grad.addColorStop(0.5, '#ffee55');
  grad.addColorStop(0.7, '#ffaa00');
  grad.addColorStop(1, '#ff6600');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solar granulation noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 8 + 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 220, 0.25)' : 'rgba(200, 50, 0, 0.2)';
    ctx.fill();
  }

  // Solar flares / sunspots
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
    const r = Math.random() * 15 + 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120, 20, 0, 0.45)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40, 5, 0, 0.6)';
    ctx.fill();
  }

  return canvas;
}

// 2. Mercury Texture
function createMercuryCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e6c69';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Surface variegation
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 20 + 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 146, 142, 0.15)' : 'rgba(45, 43, 40, 0.18)';
    ctx.fill();
  }

  // Impact craters
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 22 + 4;
    // Outer crater rim
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(210, 205, 200, 0.5)';
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.stroke();
    // Inner crater bowl
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 28, 26, 0.35)';
    ctx.fill();
  }

  return canvas;
}

// 3. Venus Texture
function createVenusCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGrad.addColorStop(0, '#caa266');
  baseGrad.addColorStop(0.2, '#e5be82');
  baseGrad.addColorStop(0.5, '#edd29d');
  baseGrad.addColorStop(0.8, '#e5be82');
  baseGrad.addColorStop(1, '#caa266');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Swirling sulfuric cloud bands
  for (let y = 0; y < canvas.height; y += 4) {
    const alpha = 0.15 + Math.sin(y * 0.08) * 0.08;
    ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
    ctx.fillRect(0, y, canvas.width, 4);
  }

  // Wavy chevron jet-streams
  ctx.lineWidth = 12;
  for (let i = 0; i < 16; i++) {
    const y = (i / 16) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 40) {
      const offset = Math.sin((x + i * 50) * 0.02) * 20;
      ctx.lineTo(x, y + offset);
    }
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(195, 145, 80, 0.2)' : 'rgba(255, 248, 220, 0.22)';
    ctx.stroke();
  }

  return canvas;
}

// 4. Earth Texture: Continents & Oceans
function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#103060');
  oceanGrad.addColorStop(0.5, '#0b2046');
  oceanGrad.addColorStop(1, '#103060');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shallow ocean shelf coastlines
  ctx.fillStyle = '#174a7a';
  function drawShelf(x: number, y: number, rx: number, ry: number) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 1.15, ry * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Continents representation (Rough world geography layout)
  // [North America, South America, Eurasia, Africa, Australia, Antarctica]
  const landmasses = [
    // North America
    { x: 450, y: 320, rx: 170, ry: 130 },
    { x: 380, y: 240, rx: 110, ry: 70 }, // Canada
    { x: 580, y: 150, rx: 80, ry: 60 },  // Greenland
    // South America
    { x: 600, y: 640, rx: 110, ry: 180 },
    // Europe
    { x: 1050, y: 270, rx: 110, ry: 75 },
    // Africa
    { x: 1080, y: 550, rx: 140, ry: 170 },
    // Asia
    { x: 1400, y: 320, rx: 250, ry: 150 },
    { x: 1320, y: 460, rx: 90, ry: 80 },  // India
    { x: 1650, y: 340, rx: 70, ry: 90 },  // East Asia
    // Australia & Pacific
    { x: 1700, y: 730, rx: 120, ry: 85 },
    { x: 1850, y: 790, rx: 40, ry: 50 },  // New Zealand
  ];

  // Draw shelves
  landmasses.forEach((m) => drawShelf(m.x, m.y, m.rx, m.ry));

  // Draw Landmasses (Green/brown continents)
  landmasses.forEach((m) => {
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    const landGrad = ctx.createRadialGradient(m.x, m.y, m.rx * 0.2, m.x, m.y, m.rx);
    landGrad.addColorStop(0, '#3e6b27'); // lush green
    landGrad.addColorStop(0.6, '#4f7d32');
    landGrad.addColorStop(0.85, '#8c7d4b'); // arid/savanna
    landGrad.addColorStop(1, '#b09b63'); // coast sand
    ctx.fillStyle = landGrad;
    ctx.fill();
  });

  // Sahara Desert
  ctx.beginPath();
  ctx.ellipse(1080, 470, 100, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#cbb26a';
  ctx.fill();

  // Arabian Peninsula
  ctx.beginPath();
  ctx.ellipse(1230, 440, 50, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bfa55a';
  ctx.fill();

  // Mountain ridges (Himalayas, Rockies, Andes)
  ctx.strokeStyle = '#ded3be';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(1300, 360);
  ctx.lineTo(1450, 350);
  ctx.stroke();

  // Polar Ice Caps
  // North Pole (Arctic)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 40, canvas.width / 2, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // South Pole (Antarctica)
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 30, canvas.width / 2, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// 5. Earth Clouds Texture
function createEarthCloudsCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Swirling white clouds with soft alpha
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height - 100) + 50;
    const rx = Math.random() * 120 + 40;
    const ry = Math.random() * 35 + 10;
    const rot = (Math.random() - 0.5) * 0.8;
    const alpha = Math.random() * 0.45 + 0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  // Intertropical Convergence Zone (ITCZ) equatorial cloud strip
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let x = 0; x < canvas.width; x += 30) {
    const y = canvas.height * 0.5 + Math.sin(x * 0.015) * 25;
    ctx.beginPath();
    ctx.arc(x, y, 20 + Math.random() * 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyclonic spirals (Tropical storms)
  for (let c = 0; c < 4; c++) {
    const cx = (c + 0.5) * (canvas.width / 4);
    const cy = c % 2 === 0 ? 300 : 700;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.2) {
      const r = a * 12;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  return canvas;
}

// 6. Moon Texture
function createMoonCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#a8a59f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lunar maria (Dark basaltic lava plains)
  const maria = [
    { x: 350, y: 220, r: 120 }, // Oceanus Procellarum
    { x: 500, y: 200, r: 85 },  // Mare Imbrium
    { x: 580, y: 260, r: 70 },  // Mare Serenitatis
    { x: 660, y: 290, r: 60 },  // Mare Tranquillitatis
    { x: 620, y: 380, r: 65 },  // Mare Fecunditatis
  ];

  maria.forEach((m) => {
    const grad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
    grad.addColorStop(0, 'rgba(55, 53, 50, 0.7)');
    grad.addColorStop(0.7, 'rgba(70, 68, 65, 0.55)');
    grad.addColorStop(1, 'rgba(120, 118, 115, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bright ray craters (Tycho, Copernicus)
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 12 + 3;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240, 240, 235, 0.8)';
    ctx.fill();

    // Crater rays
    if (i < 8) {
      ctx.strokeStyle = 'rgba(255, 255, 250, 0.3)';
      ctx.lineWidth = 1.5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * (r * 6), y + Math.sin(angle) * (r * 6));
        ctx.stroke();
      }
    }
  }

  return canvas;
}

// 7. Mars Texture
function createMarsCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rusty red base
  const baseGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGrad.addColorStop(0, '#a53e14');
  baseGrad.addColorStop(0.5, '#c8501e');
  baseGrad.addColorStop(1, '#a53e14');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark volcanic plains (Syrtis Major, Acidalia Planitia)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.7) + canvas.height * 0.15;
    const rx = Math.random() * 100 + 40;
    const ry = Math.random() * 60 + 20;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(65, 25, 12, 0.45)';
    ctx.fill();
  }

  // Valles Marineris canyon rift
  ctx.strokeStyle = '#351206';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(350, 280);
  ctx.bezierCurveTo(450, 270, 550, 290, 650, 285);
  ctx.stroke();

  // Olympus Mons volcano summit
  ctx.beginPath();
  ctx.arc(280, 240, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#65230d';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(280, 240, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#220802';
  ctx.fill();

  // White polar ice caps
  ctx.fillStyle = '#f8f8ff';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 20, 180, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 15, 150, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// 8. Jupiter Texture
function createJupiterCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Alternating ammonia and phosphor cloud belts
  const colors = [
    '#d6b080', '#b9804b', '#e8d2b2', '#8c4826',
    '#caa075', '#d4aa73', '#9c542e', '#f0dcbc',
    '#9e552a', '#e3c69c', '#b67a48', '#d0ab78'
  ];

  const bandHeight = canvas.height / colors.length;
  colors.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, idx * bandHeight, canvas.width, bandHeight);
  });

  // Turbulent horizontal eddies
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.strokeStyle = Math.sin(y * 0.1) > 0 ? 'rgba(255, 250, 235, 0.25)' : 'rgba(90, 40, 15, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 30) {
      const dy = Math.sin(x * 0.04 + y * 0.05) * 5;
      ctx.lineTo(x, y + dy);
    }
    ctx.stroke();
  }

  // Great Red Spot (Vết Đỏ Lớn)
  const grsX = 650;
  const grsY = 320;
  const grsW = 85;
  const grsH = 45;

  const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, grsW);
  grsGrad.addColorStop(0, '#c73a1d');
  grsGrad.addColorStop(0.6, '#a83218');
  grsGrad.addColorStop(0.85, '#d47b53');
  grsGrad.addColorStop(1, 'rgba(200, 130, 80, 0)');
  ctx.fillStyle = grsGrad;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsW, grsH, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // White oval storms
  for (let i = 0; i < 8; i++) {
    const ox = 200 + i * 110;
    const oy = 380;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

// 9. Saturn Texture
function createSaturnCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bands = [
    '#c8ba97', '#dcd0af', '#c2b28c', '#e3d9be',
    '#b8a77d', '#d6caa6', '#c9ba95', '#e9e1c9',
    '#b4a275', '#d2c5a2', '#c1b18b', '#dfd4b7'
  ];

  const bandH = canvas.height / bands.length;
  bands.forEach((b, idx) => {
    ctx.fillStyle = b;
    ctx.fillRect(0, idx * bandH, canvas.width, bandH);
  });

  // Subtle golden atmospheric shimmer
  for (let y = 0; y < canvas.height; y += 6) {
    ctx.fillStyle = 'rgba(255, 245, 215, 0.08)';
    ctx.fillRect(0, y, canvas.width, 3);
  }

  return canvas;
}

// 10. Saturn Rings Texture (Radial alpha concentric rings with Cassini division)
function createSaturnRingsCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ringGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  ringGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
  ringGrad.addColorStop(0.15, 'rgba(180, 165, 135, 0.25)'); // Ring C (Crepe)
  ringGrad.addColorStop(0.35, 'rgba(215, 195, 160, 0.85)'); // Ring B inner
  ringGrad.addColorStop(0.65, 'rgba(235, 220, 185, 0.95)'); // Ring B outer
  ringGrad.addColorStop(0.67, 'rgba(10, 8, 6, 0.05)');      // Cassini Division
  ringGrad.addColorStop(0.72, 'rgba(20, 18, 14, 0.05)');    // Cassini Division
  ringGrad.addColorStop(0.74, 'rgba(195, 180, 150, 0.75)'); // Ring A inner
  ringGrad.addColorStop(0.92, 'rgba(175, 160, 130, 0.65)'); // Ring A outer
  ringGrad.addColorStop(0.93, 'rgba(0,0,0,0)');             // Encke Gap
  ringGrad.addColorStop(0.95, 'rgba(155, 140, 115, 0.4)');
  ringGrad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = ringGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine striations
  for (let x = 0; x < canvas.width; x += 4) {
    if (Math.random() > 0.4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(x, 0, 1, canvas.height);
    }
  }

  return canvas;
}

// 11. Uranus Texture
function createUranusCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#5fa8a3');
  grad.addColorStop(0.3, '#75c2bd');
  grad.addColorStop(0.5, '#8de0db');
  grad.addColorStop(0.7, '#75c2bd');
  grad.addColorStop(1, '#5fa8a3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle pale methane haze bands
  for (let y = 0; y < canvas.height; y += 12) {
    ctx.fillStyle = 'rgba(230, 255, 250, 0.08)';
    ctx.fillRect(0, y, canvas.width, 6);
  }

  return canvas;
}

// 12. Neptune Texture
function createNeptuneCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1c3d78');
  grad.addColorStop(0.5, '#2855a8');
  grad.addColorStop(1, '#1c3d78');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Great Dark Spot
  ctx.beginPath();
  ctx.ellipse(320, 160, 40, 22, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 22, 50, 0.7)';
  ctx.fill();

  // White cirrus methane clouds
  ctx.strokeStyle = 'rgba(220, 235, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(270, 185);
  ctx.lineTo(380, 182);
  ctx.stroke();

  return canvas;
}

// 13. Star Glow Billboard
function createStarGlowCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(200, 230, 255, 0.8)');
  grad.addColorStop(0.5, 'rgba(100, 180, 255, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

// 14. Galaxy Core Glow
function createGalaxyCoreCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 250, 230, 1)');
  grad.addColorStop(0.2, 'rgba(255, 200, 120, 0.7)');
  grad.addColorStop(0.5, 'rgba(180, 100, 255, 0.3)');
  grad.addColorStop(0.8, 'rgba(50, 80, 200, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
}

// Default fallback noise
function createDefaultNoiseCanvas(color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
}
