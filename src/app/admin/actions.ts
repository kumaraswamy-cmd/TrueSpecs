'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { Phone } from '@/types/phone';
import { calculateSpecsScore } from '@/utils/specsScore';

const FILE_PATH = path.join(process.cwd(), 'src/data/phones.json');

// Read phones helper
async function readPhones(): Promise<Phone[]> {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data) as Phone[];
  } catch (error) {
    console.error('Error reading phones data:', error);
    return [];
  }
}

// Write phones helper
async function writePhones(phones: Phone[]): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(phones, null, 2), 'utf-8');
}

// 1. Password verification & authentication
export async function loginAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  if (password === adminPassword) {
    const cookieStore = await cookies();
    await cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Incorrect password' };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  await cookieStore.delete('admin_session');
  return { success: true };
}

// Helper to validate url
function isValidUrl(urlString: string): boolean {
  if (!urlString) return true; // Empty is fine (optional)
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// 2. Save Phone (Create or Update)
export async function savePhone(phoneData: Phone, originalId?: string) {
  try {
    // Basic verification
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'true') {
      return { success: false, error: 'Unauthorized' };
    }

    // Backend validations
    if (!phoneData.brand?.trim()) return { success: false, error: 'Brand is required' };
    if (!phoneData.model?.trim()) return { success: false, error: 'Model is required' };

    // Validate affiliate links
    if (phoneData.affiliateLinks?.amazon && !isValidUrl(phoneData.affiliateLinks.amazon)) {
      return { success: false, error: 'Amazon affiliate link must be a valid URL' };
    }
    if (phoneData.affiliateLinks?.flipkart && !isValidUrl(phoneData.affiliateLinks.flipkart)) {
      return { success: false, error: 'Flipkart affiliate link must be a valid URL' };
    }

    // Validate other images/urls if present
    if (phoneData.images) {
      for (const imgUrl of phoneData.images) {
        if (imgUrl && !isValidUrl(imgUrl)) {
          return { success: false, error: `Invalid image URL: ${imgUrl}` };
        }
      }
    }

    const phones = await readPhones();

    // Auto-generate slug if not provided, or clean the custom one
    let targetSlug = phoneData.slug || `${phoneData.brand}-${phoneData.model}`;
    targetSlug = targetSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!targetSlug) {
      return { success: false, error: 'Could not generate a valid slug' };
    }

    // Ensure uniqueness of slug/id if it's new, or if slug has changed
    const isNew = !originalId;
    const isSlugChanged = originalId && originalId !== targetSlug;

    if (isNew || isSlugChanged) {
      let slugExists = phones.some((p) => p.slug === targetSlug);
      let counter = 1;
      const baseSlug = targetSlug;
      while (slugExists) {
        targetSlug = `${baseSlug}-${counter}`;
        slugExists = phones.some((p) => p.slug === targetSlug);
        counter++;
      }
    }

    // Set generated ID and slug
    phoneData.slug = targetSlug;
    phoneData.id = targetSlug;

    // Set updated date
    phoneData.lastUpdated = new Date().toISOString().split('T')[0];

    // Find and update, or push
    if (originalId) {
      const idx = phones.findIndex((p) => p.id === originalId);
      if (idx !== -1) {
        phones[idx] = phoneData;
      } else {
        phones.push(phoneData);
      }
    } else {
      phones.push(phoneData);
    }

    // Recalculate specsScore for ALL phones in the database to normalize scoring
    // First, map over each phone and update their specsScore
    const recalculatedPhones = phones.map((p) => {
      // Run score calculation with the current list of phones as context
      const breakdown = calculateSpecsScore(p, phones);
      return {
        ...p,
        specsScore: breakdown.overall,
      };
    });

    // Write back to JSON file
    await writePhones(recalculatedPhones);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath(`/phones/${targetSlug}`);
    if (originalId && originalId !== targetSlug) {
      revalidatePath(`/phones/${originalId}`);
    }
    revalidatePath('/admin/phones');

    return { success: true, phone: phoneData };
  } catch (error: any) {
    console.error('Error saving phone:', error);
    return { success: false, error: error?.message || 'An error occurred while saving the phone.' };
  }
}

// 3. Delete Phone
export async function deletePhone(phoneId: string) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'true') {
      return { success: false, error: 'Unauthorized' };
    }

    const phones = await readPhones();
    const phoneToDelete = phones.find((p) => p.id === phoneId);
    if (!phoneToDelete) {
      return { success: false, error: 'Phone not found' };
    }

    // Filter out the phone
    const updatedPhonesList = phones.filter((p) => p.id !== phoneId);

    // Recalculate specsScore for remaining phones
    const recalculatedPhones = updatedPhonesList.map((p) => {
      const breakdown = calculateSpecsScore(p, updatedPhonesList);
      return {
        ...p,
        specsScore: breakdown.overall,
      };
    });

    await writePhones(recalculatedPhones);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath(`/phones/${phoneToDelete.slug}`);
    revalidatePath('/admin/phones');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting phone:', error);
    return { success: false, error: error?.message || 'An error occurred while deleting the phone.' };
  }
}

// 4. Bulk Import Products
export async function bulkImportProducts(productsData: any) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'true') {
      return { success: false, error: 'Unauthorized' };
    }

    if (!Array.isArray(productsData)) {
      return { success: false, error: 'Input must be an array of products' };
    }

    const phones = await readPhones();
    const existingSlugsSet = new Set(phones.map((p) => p.slug));

    let successCount = 0;
    const skipped: { brand: string; model: string; slug: string; reason: string }[] = [];
    const failed: { brand: string; model: string; reason: string }[] = [];
    const productsToAppend: Phone[] = [];

    const isString = (val: any): boolean => typeof val === 'string' && val.trim().length > 0;
    const isNumber = (val: any): boolean => typeof val === 'number' && !isNaN(val);
    const normalizeBoolean = (val: any): boolean | null => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') {
        const cleaned = val.trim().toLowerCase();
        if (cleaned === 'yes' || cleaned === 'true') return true;
        if (cleaned === 'no' || cleaned === 'false') return false;
      }
      return null;
    };
    const isValidUrlString = (val: any): boolean => {
      if (typeof val !== 'string') return false;
      if (val.trim() === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    };

    for (let i = 0; i < productsData.length; i++) {
      const item = productsData[i];
      if (!item || typeof item !== 'object') {
        failed.push({ brand: '', model: '', reason: `Item at index ${i} is not a valid JSON object` });
        continue;
      }

      const brand = typeof item.brand === 'string' ? item.brand.trim() : '';
      const model = typeof item.model === 'string' ? item.model.trim() : '';

      // Validate category
      if (item.category !== 'phone' && item.category !== 'laptop') {
        failed.push({ brand, model, reason: 'Invalid or missing category. Must be "phone" or "laptop".' });
        continue;
      }

      // Validate basic fields
      if (!isString(item.brand)) {
        failed.push({ brand, model, reason: 'Missing or empty required field: brand' });
        continue;
      }
      if (!isString(item.model)) {
        failed.push({ brand, model, reason: 'Missing or empty required field: model' });
        continue;
      }
      if (!isString(item.releaseDate)) {
        failed.push({ brand, model, reason: 'Missing or empty required field: releaseDate' });
        continue;
      }

      // Validate Price
      if (!item.price || typeof item.price !== 'object') {
        failed.push({ brand, model, reason: 'Missing or invalid "price" object' });
        continue;
      }
      if (!isNumber(item.price.mrp) || !isNumber(item.price.amazonPrice) || !isNumber(item.price.flipkartPrice)) {
        failed.push({ brand, model, reason: 'mrp, amazonPrice, and flipkartPrice in "price" must be numbers' });
        continue;
      }

      // Validate Affiliate Links
      if (item.affiliateLinks) {
        if (typeof item.affiliateLinks !== 'object') {
          failed.push({ brand, model, reason: '"affiliateLinks" must be an object' });
          continue;
        }
        if (item.affiliateLinks.amazon && !isValidUrlString(item.affiliateLinks.amazon)) {
          failed.push({ brand, model, reason: 'Amazon affiliate link must be a valid URL' });
          continue;
        }
        if (item.affiliateLinks.flipkart && !isValidUrlString(item.affiliateLinks.flipkart)) {
          failed.push({ brand, model, reason: 'Flipkart affiliate link must be a valid URL' });
          continue;
        }
      }

      // Validate Images
      if (item.images) {
        if (!Array.isArray(item.images)) {
          failed.push({ brand, model, reason: '"images" must be an array of image URLs' });
          continue;
        }
        let invalidImg = false;
        for (const imgUrl of item.images) {
          if (!isValidUrlString(imgUrl)) {
            failed.push({ brand, model, reason: `Invalid image URL: ${imgUrl}` });
            invalidImg = true;
            break;
          }
        }
        if (invalidImg) continue;
      }

      // Generate slug
      let targetSlug = item.slug || `${item.brand}-${item.model}`;
      targetSlug = targetSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!targetSlug) {
        failed.push({ brand, model, reason: 'Could not generate a valid slug from brand and model' });
        continue;
      }

      // Check duplicate slug
      if (existingSlugsSet.has(targetSlug) || productsToAppend.some(p => p.slug === targetSlug)) {
        skipped.push({ brand, model, slug: targetSlug, reason: 'Skipped (already exists)' });
        continue;
      }

      // Validate Specs
      if (!item.specs || typeof item.specs !== 'object') {
        failed.push({ brand, model, reason: 'Missing or invalid "specs" object' });
        continue;
      }

      const specs = item.specs;
      let specValidationError: string | null = null;

      if (item.category === 'phone') {
        // Validate display
        if (!specs.display || typeof specs.display !== 'object') {
          specValidationError = 'specs.display must be an object';
        } else if (!isNumber(specs.display.size)) {
          specValidationError = 'specs.display.size must be a number';
        } else if (!isString(specs.display.resolution)) {
          specValidationError = 'specs.display.resolution must be a string';
        } else if (!isString(specs.display.type)) {
          specValidationError = 'specs.display.type must be a string';
        } else if (!isNumber(specs.display.refreshRate)) {
          specValidationError = 'specs.display.refreshRate must be a number';
        } else {
          // Provide default fallbacks for optional display specs if not specified
          if (specs.display.peakBrightness === undefined || specs.display.peakBrightness === null) {
            specs.display.peakBrightness = 1200;
          }
          if (specs.display.hdrSupport === undefined || specs.display.hdrSupport === null) {
            specs.display.hdrSupport = false;
          }
          if (specs.display.widevineLevel === undefined || specs.display.widevineLevel === null || specs.display.widevineLevel === '') {
            specs.display.widevineLevel = 'L1';
          }

          if (!isNumber(specs.display.peakBrightness)) {
            specValidationError = 'specs.display.peakBrightness must be a number';
          } else {
            const hdrNorm = normalizeBoolean(specs.display.hdrSupport);
            if (hdrNorm === null) {
              specValidationError = 'specs.display.hdrSupport must be a boolean or a yes/no string';
            } else {
              specs.display.hdrSupport = hdrNorm;
            }
            if (!specValidationError && !isString(specs.display.widevineLevel)) {
              specValidationError = 'specs.display.widevineLevel must be a string';
            }
          }
        }

        // Validate performance
        if (!specValidationError) {
          if (!specs.performance || typeof specs.performance !== 'object') {
            specValidationError = 'specs.performance must be an object';
          } else if (!isString(specs.performance.chipset)) {
            specValidationError = 'specs.performance.chipset must be a string';
          } else if (!Array.isArray(specs.performance.ram) || specs.performance.ram.length === 0 || specs.performance.ram.some((v: any) => !isNumber(v))) {
            specValidationError = 'specs.performance.ram must be a non-empty array of numbers';
          } else if (!Array.isArray(specs.performance.storage) || specs.performance.storage.length === 0 || specs.performance.storage.some((v: any) => !isNumber(v))) {
            specValidationError = 'specs.performance.storage must be a non-empty array of numbers';
          } else if (!isString(specs.performance.coolingSystem)) {
            specValidationError = 'specs.performance.coolingSystem must be a string';
          } else {
            // Support null/empty antutu by converting to undefined
            if (specs.performance.antutu === null || specs.performance.antutu === undefined || specs.performance.antutu === '') {
              specs.performance.antutu = undefined;
            } else if (!isNumber(specs.performance.antutu)) {
              specValidationError = 'specs.performance.antutu must be a number';
            }
          }
        }

        // Validate camera
        if (!specValidationError) {
          if (!specs.camera || typeof specs.camera !== 'object') {
            specValidationError = 'specs.camera must be an object';
          } else if (!Array.isArray(specs.camera.rear) || specs.camera.rear.length === 0) {
            specValidationError = 'specs.camera.rear must be a non-empty array of lenses';
          } else if (!isString(specs.camera.video)) {
            specValidationError = 'specs.camera.video must be a string';
          } else {
            // Coerce front camera number to string if necessary (e.g. 18 -> "18MP")
            if (typeof specs.camera.front === 'number') {
              specs.camera.front = `${specs.camera.front}MP`;
            }

            if (!isString(specs.camera.front)) {
              specValidationError = 'specs.camera.front must be a string';
            } else {
              for (let lIdx = 0; lIdx < specs.camera.rear.length; lIdx++) {
                const lens = specs.camera.rear[lIdx];
                if (!lens || typeof lens !== 'object') {
                  specValidationError = `specs.camera.rear[${lIdx}] must be an object`;
                  break;
                } else if (!isNumber(lens.megapixel)) {
                  specValidationError = `specs.camera.rear[${lIdx}].megapixel must be a number`;
                  break;
                } else if (!isString(lens.type)) {
                  specValidationError = `specs.camera.rear[${lIdx}].type must be a string`;
                  break;
                } else {
                  const oisNorm = normalizeBoolean(lens.ois);
                  if (oisNorm === null) {
                    specValidationError = `specs.camera.rear[${lIdx}].ois must be a boolean or a yes/no string`;
                    break;
                  } else {
                    lens.ois = oisNorm;
                  }
                }
              }
            }
          }
        }

        // Validate battery
        if (!specValidationError) {
          if (!specs.battery || typeof specs.battery !== 'object') {
            specValidationError = 'specs.battery must be an object';
          } else if (!isNumber(specs.battery.capacity)) {
            specValidationError = 'specs.battery.capacity must be a number';
          } else if (!isNumber(specs.battery.chargingSpeedWatts)) {
            specValidationError = 'specs.battery.chargingSpeedWatts must be a number';
          } else {
            const wcNorm = normalizeBoolean(specs.battery.wirelessCharging);
            const rcNorm = normalizeBoolean(specs.battery.reverseCharging);
            if (wcNorm === null) {
              specValidationError = 'specs.battery.wirelessCharging must be a boolean or a yes/no string';
            } else if (rcNorm === null) {
              specValidationError = 'specs.battery.reverseCharging must be a boolean or a yes/no string';
            } else {
              specs.battery.wirelessCharging = wcNorm;
              specs.battery.reverseCharging = rcNorm;
            }
          }
        }

        // Validate build
        if (!specValidationError) {
          if (!specs.build || typeof specs.build !== 'object') {
            specValidationError = 'specs.build must be an object';
          } else if (!isNumber(specs.build.weight)) {
            specValidationError = 'specs.build.weight must be a number';
          } else if (!isNumber(specs.build.thickness)) {
            specValidationError = 'specs.build.thickness must be a number';
          } else if (!isString(specs.build.materials)) {
            specValidationError = 'specs.build.materials must be a string';
          } else if (!isString(specs.build.ipRating)) {
            specValidationError = 'specs.build.ipRating must be a string';
          } else {
            const ssNorm = normalizeBoolean(specs.build.stereoSpeakers);
            if (ssNorm === null) {
              specValidationError = 'specs.build.stereoSpeakers must be a boolean or a yes/no string';
            } else {
              specs.build.stereoSpeakers = ssNorm;
            }
          }
        }

        // Validate connectivity
        if (!specValidationError) {
          if (!specs.connectivity || typeof specs.connectivity !== 'object') {
            specValidationError = 'specs.connectivity must be an object';
          } else {
            const n5gNorm = normalizeBoolean(specs.connectivity.network5G);
            const nfcNorm = normalizeBoolean(specs.connectivity.nfc);
            const vowifiNorm = normalizeBoolean(specs.connectivity.vowifi);
            if (n5gNorm === null) {
              specValidationError = 'specs.connectivity.network5G must be a boolean or a yes/no string';
            } else if (nfcNorm === null) {
              specValidationError = 'specs.connectivity.nfc must be a boolean or a yes/no string';
            } else if (vowifiNorm === null) {
              specValidationError = 'specs.connectivity.vowifi must be a boolean or a yes/no string';
            } else {
              specs.connectivity.network5G = n5gNorm;
              specs.connectivity.nfc = nfcNorm;
              specs.connectivity.vowifi = vowifiNorm;
            }
            if (!specValidationError && !isString(specs.connectivity.carrierAggregationBands)) {
              specValidationError = 'specs.connectivity.carrierAggregationBands must be a string';
            }
            if (!specValidationError && !isString(specs.connectivity.sim)) {
              specValidationError = 'specs.connectivity.sim must be a string';
            }
            if (!specValidationError && !isString(specs.connectivity.usbType)) {
              specValidationError = 'specs.connectivity.usbType must be a string';
            }
            if (!specValidationError && !isString(specs.connectivity.bluetoothVersion)) {
              specValidationError = 'specs.connectivity.bluetoothVersion must be a string';
            }
          }
        }
      } else if (item.category === 'laptop') {
        // Validate laptop display
        if (!specs.display || typeof specs.display !== 'object') {
          specValidationError = 'specs.display must be an object';
        } else if (!isNumber(specs.display.size)) {
          specValidationError = 'specs.display.size must be a number';
        } else if (!isString(specs.display.resolution)) {
          specValidationError = 'specs.display.resolution must be a string';
        } else if (!isString(specs.display.panelType)) {
          specValidationError = 'specs.display.panelType must be a string';
        } else if (!isNumber(specs.display.refreshRate)) {
          specValidationError = 'specs.display.refreshRate must be a number';
        } else if (!isNumber(specs.display.brightness)) {
          specValidationError = 'specs.display.brightness must be a number';
        } else if (!isNumber(specs.display.colorGamutSRGBPercent)) {
          specValidationError = 'specs.display.colorGamutSRGBPercent must be a number';
        } else {
          const tsNorm = normalizeBoolean(specs.display.touchscreen);
          if (tsNorm === null) {
            specValidationError = 'specs.display.touchscreen must be a boolean or a yes/no string';
          } else {
            specs.display.touchscreen = tsNorm;
          }
        }

        // Validate laptop performance
        if (!specValidationError) {
          if (!specs.performance || typeof specs.performance !== 'object') {
            specValidationError = 'specs.performance must be an object';
          } else if (!isString(specs.performance.cpuBrand)) {
            specValidationError = 'specs.performance.cpuBrand must be a string';
          } else if (!isString(specs.performance.cpuModel)) {
            specValidationError = 'specs.performance.cpuModel must be a string';
          } else if (!isString(specs.performance.cpuGeneration)) {
            specValidationError = 'specs.performance.cpuGeneration must be a string';
          } else if (!isNumber(specs.performance.cpuCores)) {
            specValidationError = 'specs.performance.cpuCores must be a number';
          } else if (specs.performance.gpuType !== 'integrated' && specs.performance.gpuType !== 'dedicated') {
            specValidationError = 'specs.performance.gpuType must be "integrated" or "dedicated"';
          } else if (!isString(specs.performance.gpuModel)) {
            specValidationError = 'specs.performance.gpuModel must be a string';
          } else if (!isString(specs.performance.gpuVRAM)) {
            specValidationError = 'specs.performance.gpuVRAM must be a string';
          } else if (!isNumber(specs.performance.ramSize)) {
            specValidationError = 'specs.performance.ramSize must be a number';
          } else if (!isString(specs.performance.ramType)) {
            specValidationError = 'specs.performance.ramType must be a string';
          } else {
            const ramUpNorm = normalizeBoolean(specs.performance.ramUpgradeable);
            const storageUpNorm = normalizeBoolean(specs.performance.storageUpgradeable);
            if (ramUpNorm === null) {
              specValidationError = 'specs.performance.ramUpgradeable must be a boolean or a yes/no string';
            } else if (storageUpNorm === null) {
              specValidationError = 'specs.performance.storageUpgradeable must be a boolean or a yes/no string';
            } else {
              specs.performance.ramUpgradeable = ramUpNorm;
              specs.performance.storageUpgradeable = storageUpNorm;
            }
          }
        }

        // Validate laptop battery
        if (!specValidationError) {
          if (!specs.battery || typeof specs.battery !== 'object') {
            specValidationError = 'specs.battery must be an object';
          } else if (!isNumber(specs.battery.capacityWh)) {
            specValidationError = 'specs.battery.capacityWh must be a number';
          } else if (!isNumber(specs.battery.claimedBatteryHours)) {
            specValidationError = 'specs.battery.claimedBatteryHours must be a number';
          } else {
            const fcNorm = normalizeBoolean(specs.battery.fastCharging);
            if (fcNorm === null) {
              specValidationError = 'specs.battery.fastCharging must be a boolean or a yes/no string';
            } else {
              specs.battery.fastCharging = fcNorm;
            }
          }
        }

        // Validate laptop build
        if (!specValidationError) {
          if (!specs.build || typeof specs.build !== 'object') {
            specValidationError = 'specs.build must be an object';
          } else if (!isNumber(specs.build.weight)) {
            specValidationError = 'specs.build.weight must be a number';
          } else if (!isNumber(specs.build.thickness)) {
            specValidationError = 'specs.build.thickness must be a number';
          } else if (!isString(specs.build.chassisMaterial)) {
            specValidationError = 'specs.build.chassisMaterial must be a string';
          } else if (!isString(specs.build.hingeType)) {
            specValidationError = 'specs.build.hingeType must be a string';
          }
        }

        // Validate laptop ports
        if (!specValidationError) {
          if (!specs.ports || typeof specs.ports !== 'object') {
            specValidationError = 'specs.ports must be an object';
          } else if (!isNumber(specs.ports.usbACount)) {
            specValidationError = 'specs.ports.usbACount must be a number';
          } else if (!isNumber(specs.ports.usbCCount)) {
            specValidationError = 'specs.ports.usbCCount must be a number';
          } else {
            const tbNorm = normalizeBoolean(specs.ports.thunderboltSupport);
            const hdmiNorm = normalizeBoolean(specs.ports.hdmiPort);
            const sdNorm = normalizeBoolean(specs.ports.sdCardSlot);
            const jackNorm = normalizeBoolean(specs.ports.headphoneJack);
            if (tbNorm === null) {
              specValidationError = 'specs.ports.thunderboltSupport must be a boolean or a yes/no string';
            } else if (hdmiNorm === null) {
              specValidationError = 'specs.ports.hdmiPort must be a boolean or a yes/no string';
            } else if (sdNorm === null) {
              specValidationError = 'specs.ports.sdCardSlot must be a boolean or a yes/no string';
            } else if (jackNorm === null) {
              specValidationError = 'specs.ports.headphoneJack must be a boolean or a yes/no string';
            } else {
              specs.ports.thunderboltSupport = tbNorm;
              specs.ports.hdmiPort = hdmiNorm;
              specs.ports.sdCardSlot = sdNorm;
              specs.ports.headphoneJack = jackNorm;
            }
          }
        }

        // Validate laptop connectivity
        if (!specValidationError) {
          if (!specs.connectivity || typeof specs.connectivity !== 'object') {
            specValidationError = 'specs.connectivity must be an object';
          } else if (!isString(specs.connectivity.wifiStandard)) {
            specValidationError = 'specs.connectivity.wifiStandard must be a string';
          } else if (!isString(specs.connectivity.bluetoothVersion)) {
            specValidationError = 'specs.connectivity.bluetoothVersion must be a string';
          }
        }

        // Validate laptop os
        if (!specValidationError) {
          if (!specs.os || typeof specs.os !== 'object') {
            specValidationError = 'specs.os must be an object';
          } else if (!isString(specs.os.preinstalledOS)) {
            specValidationError = 'specs.os.preinstalledOS must be a string';
          } else {
            const osUpNorm = normalizeBoolean(specs.os.osUpgradeable);
            if (osUpNorm === null) {
              specValidationError = 'specs.os.osUpgradeable must be a boolean or a yes/no string';
            } else {
              specs.os.osUpgradeable = osUpNorm;
            }
          }
        }
      }

      if (specValidationError) {
        failed.push({ brand, model, reason: specValidationError });
        continue;
      }

      // Build Phone object
      const verifiedFields: string[] = [];
      const unverifiedFields = item.category === 'phone'
        ? ['display', 'performance', 'camera', 'battery', 'build', 'connectivity']
        : ['display', 'performance', 'battery', 'build', 'ports', 'connectivity', 'os'];

      const newProduct: Phone = {
        id: targetSlug,
        category: item.category,
        brand: item.brand.trim(),
        model: item.model.trim(),
        slug: targetSlug,
        releaseDate: item.releaseDate.trim(),
        images: Array.isArray(item.images) ? item.images : [],
        price: {
          mrp: item.price.mrp,
          amazonPrice: item.price.amazonPrice,
          flipkartPrice: item.price.flipkartPrice,
        },
        affiliateLinks: {
          amazon: item.affiliateLinks?.amazon || '',
          flipkart: item.affiliateLinks?.flipkart || '',
        },
        specs,
        pros: Array.isArray(item.pros) ? item.pros : [],
        cons: Array.isArray(item.cons) ? item.cons : [],
        dataCompleteness: {
          verifiedFields,
          unverifiedFields,
        },
        specsScore: 0, // calculated below
        lastUpdated: new Date().toISOString().split('T')[0],
        variantGroupId: typeof item.variantGroupId === 'string' && item.variantGroupId.trim() ? item.variantGroupId.trim() : undefined,
        variantLabel: typeof item.variantLabel === 'string' && item.variantLabel.trim() ? item.variantLabel.trim() : undefined,
      };

      if (item.category === 'phone' && item.mediaSamples) {
        newProduct.mediaSamples = {
          cameraPhotos: Array.isArray(item.mediaSamples.cameraPhotos)
            ? item.mediaSamples.cameraPhotos.map((p: any) => ({
                url: typeof p?.url === 'string' ? p.url : '',
                caption: typeof p?.caption === 'string' ? p.caption : ''
              }))
            : [],
          sampleVideoUrl: typeof item.mediaSamples.sampleVideoUrl === 'string' ? item.mediaSamples.sampleVideoUrl : '',
          reviewVideoTimestampUrl: typeof item.mediaSamples.reviewVideoTimestampUrl === 'string' ? item.mediaSamples.reviewVideoTimestampUrl : ''
        };
      }

      productsToAppend.push(newProduct);
      successCount++;
    }

    if (productsToAppend.length > 0) {
      const updatedPhonesList = [...phones, ...productsToAppend];

      // Recalculate specsScore for ALL phones in the database to normalize scoring
      const recalculatedPhones = updatedPhonesList.map((p) => {
        const breakdown = calculateSpecsScore(p, updatedPhonesList);
        return {
          ...p,
          specsScore: breakdown.overall,
        };
      });

      // Write back to JSON file
      await writePhones(recalculatedPhones);

      // Revalidate paths
      revalidatePath('/');
      revalidatePath('/phones');
      for (const p of productsToAppend) {
        revalidatePath(`/phones/${p.slug}`);
      }
      revalidatePath('/admin/phones');
    }

    return {
      success: true,
      summary: {
        successCount,
        failed,
        skipped,
      }
    };
  } catch (error: any) {
    console.error('Error during bulk import:', error);
    return { success: false, error: error?.message || 'An error occurred during bulk import.' };
  }
}

const BRANDS_FILE_PATH = path.join(process.cwd(), 'src/data/brands.json');

export interface BrandEntry {
  name: string;
  logoUrl?: string;
  category?: 'phone' | 'laptop' | 'both' | 'chip';
  isPopular?: boolean;
}

// Helper to read brands.json
export async function getBrandsRegistry(): Promise<Record<string, BrandEntry>> {
  try {
    const data = await fs.readFile(BRANDS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Record<string, BrandEntry>;
  } catch {
    return {};
  }
}

// Update or attach a custom logo for a brand
export async function updateBrandLogo(brandName: string, logoUrl: string) {
  try {
    const brands = await getBrandsRegistry();
    const existing = brands[brandName] || { name: brandName, logoUrl: '', category: 'phone', isPopular: true };
    
    brands[brandName] = {
      ...existing,
      name: brandName,
      logoUrl: logoUrl.trim(),
    };

    await fs.writeFile(BRANDS_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');

    // Revalidate all pages using BrandLogo
    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath('/compare');
    revalidatePath('/admin/brands');

    return { success: true, brand: brands[brandName] };
  } catch (error: any) {
    console.error('Error updating brand logo:', error);
    return { success: false, error: error?.message || 'Failed to update brand logo' };
  }
}

// Reset brand logo back to built-in vector
export async function resetBrandLogo(brandName: string) {
  try {
    const brands = await getBrandsRegistry();
    if (brands[brandName]) {
      brands[brandName].logoUrl = '';
      await fs.writeFile(BRANDS_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');
    }

    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath('/compare');
    revalidatePath('/admin/brands');

    return { success: true };
  } catch (error: any) {
    console.error('Error resetting brand logo:', error);
    return { success: false, error: error?.message || 'Failed to reset brand logo' };
  }
}

// Add or edit a brand entry
export async function upsertBrand(brandData: BrandEntry) {
  try {
    if (!brandData.name.trim()) {
      return { success: false, error: 'Brand name is required.' };
    }

    const brands = await getBrandsRegistry();
    brands[brandData.name.trim()] = {
      name: brandData.name.trim(),
      logoUrl: brandData.logoUrl || '',
      category: brandData.category || 'phone',
      isPopular: brandData.isPopular ?? true,
    };

    await fs.writeFile(BRANDS_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');

    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath('/compare');
    revalidatePath('/admin/brands');

    return { success: true, brand: brands[brandData.name.trim()] };
  } catch (error: any) {
    console.error('Error saving brand:', error);
    return { success: false, error: error?.message || 'Failed to save brand' };
  }
}

// Delete brand entry
export async function deleteBrand(brandName: string) {
  try {
    const brands = await getBrandsRegistry();
    if (brands[brandName]) {
      delete brands[brandName];
      await fs.writeFile(BRANDS_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');
    }

    revalidatePath('/');
    revalidatePath('/phones');
    revalidatePath('/compare');
    revalidatePath('/admin/brands');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return { success: false, error: error?.message || 'Failed to delete brand' };
  }
}


