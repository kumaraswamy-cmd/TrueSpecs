import { Phone } from '@/types/phone';

export interface SpecsScoreBreakdown {
  overall: number;
  performance: { score: number; details: string };
  display: { score: number; details: string };
  camera: { score: number; details: string };
  battery: { score: number; details: string };
  buildConnectivity: { score: number; details: string };
  explanation: string;
}

// Map chipset to a raw capability score
function getChipsetTierScore(chipset: string): number {
  const c = String(chipset || '').toLowerCase();
  if (c.includes('a17 pro') || c.includes('8 gen 3') || c.includes('9300')) {
    return 100;
  }
  if (c.includes('8+ gen 1') || c.includes('8 gen 2') || c.includes('7 gen 3') || c.includes('7200 ultra')) {
    return 80;
  }
  if (c.includes('exynos 1380') || c.includes('7 gen 1') || c.includes('6 gen 1')) {
    return 60;
  }
  if (c.includes('7025') || c.includes('4 gen 2') || c.includes('g99')) {
    return 45;
  }
  return 30; // budget entry-level
}

// Map IP rating to a score
function getIpRatingScore(ip: string): number {
  if (!ip) return 0;
  if (ip.includes('68')) return 100;
  if (ip.includes('67')) return 85;
  if (ip.includes('65')) return 70;
  if (ip.includes('54')) return 50;
  if (ip.includes('53')) return 40;
  if (ip.includes('52')) return 30;
  return 10;
}

// Map Video resolution to a score
function getVideoScore(video: string): number {
  const v = String(video || '').toLowerCase();
  if (v.includes('8k')) return 100;
  if (v.includes('4k') && v.includes('60fps')) return 90;
  if (v.includes('4k')) return 75;
  if (v.includes('1080p') || v.includes('fhd')) return 50;
  return 30;
}

function getLaptopCpuTierScore(brand: string, model: string): number {
  const b = String(brand || '').toLowerCase();
  const m = String(model || '').toLowerCase();
  
  if (b.includes('apple')) {
    if (m.includes('max') || m.includes('pro')) return 100;
    return 85;
  }
  
  if (m.includes('h') || m.includes('hs') || m.includes('hx')) {
    if (m.includes('i9') || m.includes('ryzen 9')) return 100;
    if (m.includes('i7') || m.includes('ryzen 7')) return 90;
    return 80;
  }
  
  if (m.includes('u') || m.includes('p')) {
    if (m.includes('i7') || m.includes('ryzen 7')) return 80;
    if (m.includes('i5') || m.includes('ryzen 5')) return 70;
    return 60;
  }

  return 50;
}

function calculateLaptopSpecsScore(laptop: Phone, allLaptops: Phone[]): SpecsScoreBreakdown {
  let maxCores = 8;
  let maxRam = 16;
  let maxPixels = 2560 * 1600;
  let maxRefreshRate = 60;
  let maxBrightness = 400;
  let maxBatteryWh = 70;
  let maxClaimedHours = 12;
  let maxStorageGB = 512;
  let maxUsbA = 2;
  let maxUsbC = 2;

  let minWeight = 1.2;
  let minThickness = 12;

  allLaptops.forEach(l => {
    const specs = l.specs;
    if (!specs) return;
    
    const cores = Number(specs.performance?.cpuCores);
    if (cores > maxCores) maxCores = cores;
    
    const ram = Number(specs.performance?.ramSize);
    if (ram > maxRam) maxRam = ram;

    const res = specs.display?.resolution || '';
    const match = res.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (match) {
      const pixels = parseInt(match[1], 10) * parseInt(match[2], 10);
      if (pixels > maxPixels) maxPixels = pixels;
    }

    const rr = Number(specs.display?.refreshRate);
    if (rr > maxRefreshRate) maxRefreshRate = rr;

    const b = Number(specs.display?.brightness);
    if (b > maxBrightness) maxBrightness = b;

    const wh = Number(specs.battery?.capacityWh);
    if (wh > maxBatteryWh) maxBatteryWh = wh;

    const hrs = Number(specs.battery?.claimedBatteryHours);
    if (hrs > maxClaimedHours) maxClaimedHours = hrs;

    const w = Number(specs.build?.weight);
    if (w && w < minWeight) minWeight = w;

    const t = Number(specs.build?.thickness);
    if (t && t < minThickness) minThickness = t;

    const rawCap = specs.performance?.storageCapacity || '';
    const capStr = typeof rawCap === 'number' ? `${rawCap}GB` : String(rawCap);
    let cap = 512;
    if (capStr.toLowerCase().includes('tb')) {
      cap = parseFloat(capStr) * 1024;
    } else {
      cap = parseFloat(capStr) || 512;
    }
    if (cap > maxStorageGB) maxStorageGB = cap;

    const usbA = Number(specs.ports?.usbACount) || 0;
    if (usbA > maxUsbA) maxUsbA = usbA;
    const usbC = Number(specs.ports?.usbCCount) || 0;
    if (usbC > maxUsbC) maxUsbC = usbC;
  });

  const specs = laptop.specs;

  // 1. Performance (35%): CPU + GPU + RAM
  const cpuBrand = specs.performance?.cpuBrand || 'Intel';
  const cpuModel = specs.performance?.cpuModel || '';
  const cpuCores = Number(specs.performance?.cpuCores) || 4;
  
  const cpuTierPoints = getLaptopCpuTierScore(cpuBrand, cpuModel);
  const cpuCoresPoints = (cpuCores / maxCores) * 100;
  const cpuPoints = 0.6 * cpuTierPoints + 0.4 * cpuCoresPoints;

  const gpuType = specs.performance?.gpuType || 'integrated';
  const gpuModel = String(specs.performance?.gpuModel || '');
  const gpuVramStr = String(specs.performance?.gpuVRAM || '');
  let gpuPoints = 50;
  if (gpuType === 'dedicated') {
    let vram = 4;
    const vramMatch = gpuVramStr.match(/(\d+)\s*GB/i);
    if (vramMatch) vram = parseInt(vramMatch[1], 10);
    gpuPoints = 75 + (vram / 16) * 25;
  } else {
    gpuPoints = gpuModel.toLowerCase().includes('xe') || gpuModel.toLowerCase().includes('radeon') || String(cpuBrand || '').toLowerCase().includes('apple') ? 65 : 55;
  }

  const ramSize = Number(specs.performance?.ramSize) || 8;
  const ramType = specs.performance?.ramType || 'DDR4';
  const ramTypePoints = ramType.includes('5') ? 100 : 70;
  const ramSizePoints = (ramSize / maxRam) * 100;
  const ramPoints = 0.7 * ramSizePoints + 0.3 * ramTypePoints;

  const perfScore = Math.round(0.4 * cpuPoints + 0.3 * gpuPoints + 0.3 * ramPoints);
  const perfDetails = `${specs.performance?.cpuModel} CPU, ${specs.performance?.gpuModel} GPU, ${ramSize}GB ${ramType} RAM`;

  // 2. Display (20%)
  const res = specs.display?.resolution || '1920 x 1080';
  let pixels = 1920 * 1080;
  const match = res.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (match) {
    pixels = parseInt(match[1], 10) * parseInt(match[2], 10);
  }
  const resolutionPoints = (pixels / maxPixels) * 100;
  
  const rr = Number(specs.display?.refreshRate) || 60;
  const refreshPoints = (rr / maxRefreshRate) * 100;

  const b = Number(specs.display?.brightness) || 250;
  const brightnessPoints = (b / maxBrightness) * 100;

  const colorGamut = Number(specs.display?.colorGamutSRGBPercent) || 100;
  const gamutPoints = colorGamut >= 100 ? 100 : colorGamut;

  const panelType = String(specs.display?.panelType || 'IPS').toLowerCase();
  const panelPoints = panelType.includes('oled') || panelType.includes('mini') ? 100 : 80;

  const dispScore = Math.round(0.3 * resolutionPoints + 0.2 * refreshPoints + 0.2 * brightnessPoints + 0.2 * gamutPoints + 0.1 * panelPoints);
  const dispDetails = `${specs.display?.panelType}, ${res}, ${rr}Hz, ${b} nits`;

  // 3. Battery (15%)
  const wh = Number(specs.battery?.capacityWh) || 50;
  const hours = Number(specs.battery?.claimedBatteryHours) || 8;
  const fastCharging = !!specs.battery?.fastCharging;

  const capWhPoints = (wh / maxBatteryWh) * 100;
  const hoursPoints = (hours / maxClaimedHours) * 100;
  const fcPoints = fastCharging ? 100 : 50;

  const battScore = Math.round(0.5 * capWhPoints + 0.3 * hoursPoints + 0.2 * fcPoints);
  const battDetails = `${wh}Wh Battery, ${hours} Hrs claimed, Fast Charging: ${fastCharging ? 'Yes' : 'No'}`;

  // 4. Build & Ports (20%)
  const weight = Number(specs.build?.weight) || 1.5;
  const thickness = Number(specs.build?.thickness) || 15;
  
  const weightPoints = (minWeight / weight) * 100;
  const thicknessPoints = (minThickness / thickness) * 100;

  const usbA = Number(specs.ports?.usbACount) || 0;
  const usbC = Number(specs.ports?.usbCCount) || 0;
  const tb = !!specs.ports?.thunderboltSupport;
  const hdmi = !!specs.ports?.hdmiPort;
  const sd = !!specs.ports?.sdCardSlot;
  const jack = !!specs.ports?.headphoneJack;

  const usbAPoints = (usbA / maxUsbA) * 100;
  const usbCPoints = (usbC / maxUsbC) * 100;
  const portsSum = usbAPoints + usbCPoints + (tb ? 100 : 0) + (hdmi ? 100 : 0) + (sd ? 100 : 0) + (jack ? 100 : 0);
  const portsPoints = portsSum / 6;

  const buildPortsScore = Math.round(0.35 * weightPoints + 0.35 * thicknessPoints + 0.3 * portsPoints);
  const buildPortsDetails = `${weight}kg, ${thickness}mm thickness, Ports: ${usbA}xUSB-A, ${usbC}xUSB-C${tb ? '+TB' : ''}${hdmi ? ', HDMI' : ''}`;

  // 5. Storage/Upgradeability (10%)
  const rawCap = specs.performance?.storageCapacity || '512GB';
  const capStr = typeof rawCap === 'number' ? `${rawCap}GB` : String(rawCap);
  let cap = 512;
  if (capStr.toLowerCase().includes('tb')) {
    cap = parseFloat(capStr) * 1024;
  } else {
    cap = parseFloat(capStr) || 512;
  }
  const storagePoints = (cap / maxStorageGB) * 100;

  const ramUp = !!specs.performance?.ramUpgradeable;
  const storageUp = !!specs.performance?.storageUpgradeable;

  const ramUpPoints = ramUp ? 100 : 50;
  const storageUpPoints = storageUp ? 100 : 50;

  const upgradeScore = Math.round(0.4 * storagePoints + 0.3 * ramUpPoints + 0.3 * storageUpPoints);
  const upgradeDetails = `${capStr} SSD, RAM Upgradeable: ${ramUp ? 'Yes' : 'No'}, SSD Upgradeable: ${storageUp ? 'Yes' : 'No'}`;

  // Overall Score
  const overall = Math.round(
    0.35 * perfScore +
    0.2 * dispScore +
    0.15 * battScore +
    0.2 * buildPortsScore +
    0.1 * upgradeScore
  );

  // Generate dynamic explanation
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (perfScore >= 85) strengths.push('powerful CPU/GPU components');
  else if (perfScore < 60) weaknesses.push('entry-level performance hardware');

  if (dispScore >= 85) strengths.push('stunning high-res OLED/120Hz display');
  else if (dispScore < 60) weaknesses.push('standard low-brightness screen');

  if (wh >= 80) strengths.push('large battery capacity');
  else if (wh < 45) weaknesses.push('small battery capacity');

  if (weight <= 1.3) strengths.push('ultra-portable thin-and-light chassis');
  else if (weight >= 2.0) weaknesses.push('bulky chassis');

  let explanation = '';
  if (strengths.length > 0 && weaknesses.length > 0) {
    explanation = `Features ${strengths[0]}, but is impacted by its ${weaknesses[0]}.`;
  } else if (strengths.length > 0) {
    explanation = `A premium laptop with ${strengths.join(' and ')}.`;
  } else if (weaknesses.length > 0) {
    explanation = `Overall score is primarily affected by its ${weaknesses.join(' and ')}.`;
  } else {
    explanation = `Offers a solid set of balanced technical specs suitable for daily workflows.`;
  }

  return {
    overall,
    performance: { score: perfScore, details: perfDetails },
    display: { score: dispScore, details: dispDetails },
    camera: { score: buildPortsScore, details: buildPortsDetails },
    battery: { score: battScore, details: battDetails },
    buildConnectivity: { score: upgradeScore, details: upgradeDetails },
    explanation
  };
}

export function calculateSpecsScore(phone: Phone, allPhones: Phone[]): SpecsScoreBreakdown {
  const category = phone.category || 'phone';
  
  if (category === 'laptop') {
    const laptops = allPhones.filter(p => p.category === 'laptop');
    return calculateLaptopSpecsScore(phone, laptops.length ? laptops : [phone]);
  }

  const phonesOnly = allPhones.filter(p => (p.category || 'phone') === 'phone');
  const allPhonesToUse = phonesOnly.length ? phonesOnly : [phone];

  // Find maximum values in the dataset for normalization
  let maxRam = 8;
  let maxPixels = 2796 * 1290;
  let maxRefreshRate = 120;
  let maxBrightness = 2000;
  let maxPrimaryMp = 48;
  let maxRearLenses = 3;
  let maxBatteryCapacity = 5000;
  let maxChargingSpeed = 67;

  allPhonesToUse.forEach(p => {
    // RAM
    const pMaxRam = Math.max(...(p.specs.performance?.ram || [8]));
    if (pMaxRam > maxRam) maxRam = pMaxRam;

    // Display pixels
    const resParts = (p.specs.display?.resolution || '2400x1080').split('x').map((x: string) => parseInt(x.trim(), 10));
    if (resParts.length === 2 && !isNaN(resParts[0]) && !isNaN(resParts[1])) {
      const pixels = resParts[0] * resParts[1];
      if (pixels > maxPixels) maxPixels = pixels;
    }

    // Refresh rate
    if (p.specs.display?.refreshRate > maxRefreshRate) maxRefreshRate = p.specs.display.refreshRate;

    // Brightness
    if (p.specs.display?.peakBrightness > maxBrightness) maxBrightness = p.specs.display.peakBrightness;

    // Primary MP
    const mainMp = p.specs.camera?.rear?.[0]?.megapixel || 12;
    if (mainMp > maxPrimaryMp) maxPrimaryMp = mainMp;

    // Lenses count
    const lenses = p.specs.camera?.rear?.length || 0;
    if (lenses > maxRearLenses) maxRearLenses = lenses;

    // Battery capacity
    if (p.specs.battery?.capacity > maxBatteryCapacity) maxBatteryCapacity = p.specs.battery.capacity;

    // Charging speed
    if (p.specs.battery?.chargingSpeedWatts > maxChargingSpeed) maxChargingSpeed = p.specs.battery.chargingSpeedWatts;
  });

  // Calculate Sub-Scores

  // 1. Performance (30%)
  const phoneMaxRam = Math.max(...(phone.specs.performance?.ram || [8]));
  const chipsetPoints = getChipsetTierScore(phone.specs.performance?.chipset || '');
  const ramPoints = (phoneMaxRam / maxRam) * 100;
  const perfScore = Math.round(0.7 * chipsetPoints + 0.3 * ramPoints);
  const perfDetails = `${phone.specs.performance?.chipset} with ${phoneMaxRam}GB RAM (Max in database: ${maxRam}GB)`;

  // 2. Display (20%)
  let pixels = 2796 * 1290;
  const resParts = (phone.specs.display?.resolution || '2400x1080').split('x').map((x: string) => parseInt(x.trim(), 10));
  if (resParts.length === 2 && !isNaN(resParts[0]) && !isNaN(resParts[1])) {
    pixels = resParts[0] * resParts[1];
  }
  const resolutionPoints = (pixels / maxPixels) * 100;
  const refreshPoints = ((phone.specs.display?.refreshRate || 60) / maxRefreshRate) * 100;
  const brightnessPoints = ((phone.specs.display?.peakBrightness || 1000) / maxBrightness) * 100;
  const dispScore = Math.round(0.4 * resolutionPoints + 0.3 * refreshPoints + 0.3 * brightnessPoints);
  const dispDetails = `${phone.specs.display?.type}, ${phone.specs.display?.resolution}, ${phone.specs.display?.refreshRate}Hz, ${phone.specs.display?.peakBrightness} nits`;

  // 3. Camera (25%)
  const primaryMp = phone.specs.camera?.rear?.[0]?.megapixel || 12;
  const primaryMpPoints = (primaryMp / maxPrimaryMp) * 100;
  const lensCountPoints = ((phone.specs.camera?.rear?.length || 0) / maxRearLenses) * 100;
  const oisPoints = phone.specs.camera?.rear?.[0]?.ois ? 100 : 50;
  const videoPoints = getVideoScore(phone.specs.camera?.video || '');
  const camScore = Math.round(0.3 * primaryMpPoints + 0.2 * lensCountPoints + 0.3 * oisPoints + 0.2 * videoPoints);
  const camDetails = `${phone.specs.camera?.rear?.length || 0} cameras (${primaryMp}MP main ${phone.specs.camera?.rear?.[0]?.ois ? 'with OIS' : 'no OIS'}), ${phone.specs.camera?.video || ''}`;

  // 4. Battery (15%)
  const capPoints = ((phone.specs.battery?.capacity || 4000) / maxBatteryCapacity) * 100;
  const speedPoints = ((phone.specs.battery?.chargingSpeedWatts || 18) / maxChargingSpeed) * 100;
  const wirelessPoints = phone.specs.battery?.wirelessCharging ? 100 : 0;
  const battScore = Math.round(0.5 * capPoints + 0.3 * speedPoints + 0.2 * wirelessPoints);
  const battDetails = `${phone.specs.battery?.capacity || 4000}mAh battery, ${phone.specs.battery?.chargingSpeedWatts || 18}W charging ${phone.specs.battery?.wirelessCharging ? '+ Wireless' : ''}`;

  // 5. Build & Connectivity (10%)
  const ipPoints = getIpRatingScore(phone.specs.build?.ipRating || '');
  const conn5gPoints = phone.specs.connectivity?.network5G ? 100 : 0;
  const nfcPoints = phone.specs.connectivity?.nfc ? 100 : 0;
  const speakersPoints = phone.specs.build?.stereoSpeakers ? 100 : 0;
  const buildConnScore = Math.round(0.3 * ipPoints + 0.2 * conn5gPoints + 0.2 * nfcPoints + 0.3 * speakersPoints);
  const buildConnDetails = `IP Rating: ${phone.specs.build?.ipRating || 'None'}, 5G: ${phone.specs.connectivity?.network5G ? 'Yes' : 'No'}, NFC: ${phone.specs.connectivity?.nfc ? 'Yes' : 'No'}, Stereo speakers: ${phone.specs.build?.stereoSpeakers ? 'Yes' : 'No'}`;

  // Overall Score
  const overall = Math.round(
    0.3 * perfScore +
    0.2 * dispScore +
    0.25 * camScore +
    0.15 * battScore +
    0.1 * buildConnScore
  );

  // Generate dynamic explanation of strengths/weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (perfScore >= 85) strengths.push('top-tier performance');
  else if (perfScore < 60) weaknesses.push('entry-level processing speed');

  if ((phone.specs.display?.peakBrightness || 1000) < 1000) weaknesses.push('dimmer display panel');
  else if ((phone.specs.display?.refreshRate || 60) >= 120 && (phone.specs.display?.peakBrightness || 1000) >= 2000) strengths.push('ultra-bright 120Hz+ screen');

  if (phone.specs.camera?.rear?.[0]?.ois === false) weaknesses.push('lack of camera stabilization (OIS)');
  else if (camScore >= 85) strengths.push('outstanding camera capabilities');

  if ((phone.specs.battery?.chargingSpeedWatts || 18) <= 25 && (phone.specs.battery?.capacity || 4000) < 4500) weaknesses.push('slow charging speeds and small battery');
  else if ((phone.specs.battery?.chargingSpeedWatts || 18) >= 90) strengths.push('ultra-fast charging speed');

  if (!phone.specs.build?.ipRating || getIpRatingScore(phone.specs.build.ipRating) < 50) weaknesses.push('weak dust/water protection');

  let explanation = '';
  if (strengths.length > 0 && weaknesses.length > 0) {
    explanation = `Boosted by its ${strengths[0]}, but held back by its ${weaknesses[0]}.`;
  } else if (strengths.length > 0) {
    explanation = `A premium option featuring ${strengths.join(' and ')}.`;
  } else if (weaknesses.length > 0) {
    explanation = `Specs are impacted primarily by its ${weaknesses.join(' and ')}.`;
  } else {
    explanation = `Offers a well-balanced mid-range specification breakdown.`;
  }

  return {
    overall,
    performance: { score: perfScore, details: perfDetails },
    display: { score: dispScore, details: dispDetails },
    camera: { score: camScore, details: camDetails },
    battery: { score: battScore, details: battDetails },
    buildConnectivity: { score: buildConnScore, details: buildConnDetails },
    explanation
  };
}
