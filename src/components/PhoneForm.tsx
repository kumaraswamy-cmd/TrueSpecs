'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, RearCameraLens, MediaPhoto } from '@/types/phone';
import { savePhone } from '@/app/admin/actions';
import { calculateSpecsScore } from '@/utils/specsScore';

interface PhoneFormProps {
  initialPhone?: Phone;
  allPhones: Phone[];
}

// Inline image preview component that gracefully handles loading errors
function ImagePreview({ url }: { url: string }) {
  const [error, setError] = useState(false);
  const [prevUrl, setPrevUrl] = useState(url);

  if (url !== prevUrl) {
    setPrevUrl(url);
    setError(false);
  }

  if (!url || !url.trim().startsWith('http')) {
    return null;
  }

  if (error) {
    return (
      <div className="h-12 w-12 shrink-0 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-[9px] flex items-center justify-center font-bold text-center p-1 leading-none">
        Broken Image
      </div>
    );
  }

  return (
    <div className="h-12 w-12 shrink-0 rounded-lg border border-theme bg-theme-surface overflow-hidden flex items-center justify-center">
      <img
        src={url}
        alt="Preview"
        onError={() => setError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function PhoneForm({ initialPhone, allPhones }: PhoneFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [draftLoadedMsg, setDraftLoadedMsg] = useState('');

  // 1. Collapsible sections state
  const [openSections, setOpenSections] = useState({
    display: true,
    performance: false,
    camera: false,
    battery: false,
    build: false,
    connectivity: false,
    os: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 2. Initial State Setup
  const getInitialState = () => {
    const isLaptopObj = initialPhone?.category === 'laptop';
    if (initialPhone) {
      return {
        category: initialPhone.category || 'phone',
        brand: initialPhone.brand || '',
        model: initialPhone.model || '',
        slug: initialPhone.slug || '',
        releaseDate: initialPhone.releaseDate || '',
        variantGroupId: initialPhone.variantGroupId || '',
        variantLabel: initialPhone.variantLabel || '',
        images: initialPhone.images?.length ? initialPhone.images : [''],
        price: {
          mrp: initialPhone.price?.mrp?.toString() || '',
          amazonPrice: initialPhone.price?.amazonPrice?.toString() || '',
          flipkartPrice: initialPhone.price?.flipkartPrice?.toString() || '',
        },
        affiliateLinks: {
          amazon: initialPhone.affiliateLinks?.amazon || '',
          flipkart: initialPhone.affiliateLinks?.flipkart || '',
        },
        specs: {
          display: {
            size: !isLaptopObj ? (initialPhone.specs?.display?.size?.toString() || '') : '',
            resolution: !isLaptopObj ? (initialPhone.specs?.display?.resolution || '') : '',
            type: !isLaptopObj ? (initialPhone.specs?.display?.type || '') : '',
            refreshRate: !isLaptopObj ? (initialPhone.specs?.display?.refreshRate?.toString() || '') : '',
            peakBrightness: !isLaptopObj ? (initialPhone.specs?.display?.peakBrightness?.toString() || '') : '',
            hdrSupport: !isLaptopObj ? (initialPhone.specs?.display?.hdrSupport || false) : false,
            widevineLevel: !isLaptopObj ? (initialPhone.specs?.display?.widevineLevel || 'L1') : 'L1',
          },
          performance: {
            chipset: !isLaptopObj ? (initialPhone.specs?.performance?.chipset || '') : '',
            ram: !isLaptopObj ? (initialPhone.specs?.performance?.ram?.join(', ') || '') : '',
            storage: !isLaptopObj ? (initialPhone.specs?.performance?.storage?.join(', ') || '') : '',
            antutu: !isLaptopObj ? (initialPhone.specs?.performance?.antutu?.toString() || '') : '',
            coolingSystem: !isLaptopObj ? (initialPhone.specs?.performance?.coolingSystem || '') : '',
          },
          camera: {
            rear: !isLaptopObj ? (initialPhone.specs?.camera?.rear?.length
              ? initialPhone.specs.camera.rear.map((lens: any) => ({
                  megapixel: lens.megapixel?.toString() || '',
                  type: lens.type || '',
                  ois: lens.ois || false,
                }))
              : [{ megapixel: '', type: '', ois: false }]) : [{ megapixel: '', type: '', ois: false }],
            front: !isLaptopObj ? (initialPhone.specs?.camera?.front || '') : '',
            video: !isLaptopObj ? (initialPhone.specs?.camera?.video || '') : '',
          },
          battery: {
            capacity: !isLaptopObj ? (initialPhone.specs?.battery?.capacity?.toString() || '') : '',
            chargingSpeedWatts: !isLaptopObj ? (initialPhone.specs?.battery?.chargingSpeedWatts?.toString() || '') : '',
            wirelessCharging: !isLaptopObj ? (initialPhone.specs?.battery?.wirelessCharging || false) : false,
            reverseCharging: !isLaptopObj ? (initialPhone.specs?.battery?.reverseCharging || false) : false,
          },
          build: {
            weight: !isLaptopObj ? (initialPhone.specs?.build?.weight?.toString() || '') : '',
            thickness: !isLaptopObj ? (initialPhone.specs?.build?.thickness?.toString() || '') : '',
            materials: !isLaptopObj ? (initialPhone.specs?.build?.materials || '') : '',
            ipRating: !isLaptopObj ? (initialPhone.specs?.build?.ipRating || 'None') : 'None',
            stereoSpeakers: !isLaptopObj ? (initialPhone.specs?.build?.stereoSpeakers || false) : false,
          },
          connectivity: {
            network5G: !isLaptopObj ? (initialPhone.specs?.connectivity?.network5G || false) : false,
            carrierAggregationBands: !isLaptopObj ? (initialPhone.specs?.connectivity?.carrierAggregationBands || '') : '',
            sim: !isLaptopObj ? (initialPhone.specs?.connectivity?.sim || '') : '',
            nfc: !isLaptopObj ? (initialPhone.specs?.connectivity?.nfc || false) : false,
            usbType: !isLaptopObj ? (initialPhone.specs?.connectivity?.usbType || '') : '',
            vowifi: !isLaptopObj ? (initialPhone.specs?.connectivity?.vowifi || false) : false,
            bluetoothVersion: !isLaptopObj ? (initialPhone.specs?.connectivity?.bluetoothVersion || '') : '',
          },
        },
        laptopSpecs: {
          display: {
            size: isLaptopObj ? (initialPhone.specs?.display?.size?.toString() || '') : '',
            resolution: isLaptopObj ? (initialPhone.specs?.display?.resolution || '') : '',
            panelType: isLaptopObj ? (initialPhone.specs?.display?.panelType || '') : '',
            refreshRate: isLaptopObj ? (initialPhone.specs?.display?.refreshRate?.toString() || '') : '',
            brightness: isLaptopObj ? (initialPhone.specs?.display?.brightness?.toString() || '') : '',
            colorGamutSRGBPercent: isLaptopObj ? (initialPhone.specs?.display?.colorGamutSRGBPercent?.toString() || '') : '',
            touchscreen: isLaptopObj ? (initialPhone.specs?.display?.touchscreen === true || initialPhone.specs?.display?.touchscreen === 'yes' ? 'yes' : 'no') : 'no',
          },
          performance: {
            cpuBrand: isLaptopObj ? (initialPhone.specs?.performance?.cpuBrand || 'Intel') : 'Intel',
            cpuModel: isLaptopObj ? (initialPhone.specs?.performance?.cpuModel || '') : '',
            cpuGeneration: isLaptopObj ? (initialPhone.specs?.performance?.cpuGeneration || '') : '',
            cpuCores: isLaptopObj ? (initialPhone.specs?.performance?.cpuCores?.toString() || '') : '',
            gpuType: isLaptopObj ? (initialPhone.specs?.performance?.gpuType || 'integrated') : 'integrated',
            gpuModel: isLaptopObj ? (initialPhone.specs?.performance?.gpuModel || '') : '',
            gpuVRAM: isLaptopObj ? (initialPhone.specs?.performance?.gpuVRAM || '') : '',
            ramSize: isLaptopObj ? (initialPhone.specs?.performance?.ramSize?.toString() || '') : '',
            ramType: isLaptopObj ? (initialPhone.specs?.performance?.ramType || '') : '',
            ramUpgradeable: isLaptopObj ? (initialPhone.specs?.performance?.ramUpgradeable === true || initialPhone.specs?.performance?.ramUpgradeable === 'yes' ? 'yes' : 'no') : 'no',
            storageType: isLaptopObj ? (initialPhone.specs?.performance?.storageType || 'SSD') : 'SSD',
            storageCapacity: isLaptopObj ? (initialPhone.specs?.performance?.storageCapacity || '') : '',
            storageUpgradeable: isLaptopObj ? (initialPhone.specs?.performance?.storageUpgradeable === true || initialPhone.specs?.performance?.storageUpgradeable === 'yes' ? 'yes' : 'no') : 'no',
          },
          battery: {
            capacityWh: isLaptopObj ? (initialPhone.specs?.battery?.capacityWh?.toString() || '') : '',
            claimedBatteryHours: isLaptopObj ? (initialPhone.specs?.battery?.claimedBatteryHours?.toString() || '') : '',
            fastCharging: isLaptopObj ? (initialPhone.specs?.battery?.fastCharging === true || initialPhone.specs?.battery?.fastCharging === 'yes' ? 'yes' : 'no') : 'no',
          },
          build: {
            weight: isLaptopObj ? (initialPhone.specs?.build?.weight?.toString() || '') : '',
            thickness: isLaptopObj ? (initialPhone.specs?.build?.thickness?.toString() || '') : '',
            chassisMaterial: isLaptopObj ? (initialPhone.specs?.build?.chassisMaterial || '') : '',
            hingeType: isLaptopObj ? (initialPhone.specs?.build?.hingeType || 'Standard') : 'Standard',
          },
          ports: {
            usbACount: isLaptopObj ? (initialPhone.specs?.ports?.usbACount?.toString() || '') : '',
            usbCCount: isLaptopObj ? (initialPhone.specs?.ports?.usbCCount?.toString() || '') : '',
            thunderboltSupport: isLaptopObj ? (initialPhone.specs?.ports?.thunderboltSupport === true || initialPhone.specs?.ports?.thunderboltSupport === 'yes' ? 'yes' : 'no') : 'no',
            hdmiPort: isLaptopObj ? (initialPhone.specs?.ports?.hdmiPort === true || initialPhone.specs?.ports?.hdmiPort === 'yes' ? 'yes' : 'no') : 'no',
            sdCardSlot: isLaptopObj ? (initialPhone.specs?.ports?.sdCardSlot === true || initialPhone.specs?.ports?.sdCardSlot === 'yes' ? 'yes' : 'no') : 'no',
            headphoneJack: isLaptopObj ? (initialPhone.specs?.ports?.headphoneJack === true || initialPhone.specs?.ports?.headphoneJack === 'yes' ? 'yes' : 'no') : 'no',
          },
          connectivity: {
            wifiStandard: isLaptopObj ? (initialPhone.specs?.connectivity?.wifiStandard || '') : '',
            bluetoothVersion: isLaptopObj ? (initialPhone.specs?.connectivity?.bluetoothVersion || '') : '',
          },
          os: {
            preinstalledOS: isLaptopObj ? (initialPhone.specs?.os?.preinstalledOS || '') : '',
            osUpgradeable: isLaptopObj ? (initialPhone.specs?.os?.osUpgradeable === true || initialPhone.specs?.os?.osUpgradeable === 'yes' ? 'yes' : 'no') : 'yes',
          }
        },
        mediaSamples: {
          cameraPhotos: initialPhone.mediaSamples?.cameraPhotos?.length
            ? initialPhone.mediaSamples.cameraPhotos.map((photo) => ({
                url: photo.url || '',
                caption: photo.caption || '',
              }))
            : [{ url: '', caption: '' }],
          sampleVideoUrl: initialPhone.mediaSamples?.sampleVideoUrl || '',
          reviewVideoTimestampUrl: initialPhone.mediaSamples?.reviewVideoTimestampUrl || '',
        },
        dataCompleteness: {
          verifiedFields: initialPhone.dataCompleteness?.verifiedFields || [],
          unverifiedFields: initialPhone.dataCompleteness?.unverifiedFields || [
            'display',
            'performance',
            'camera',
            'battery',
            'build',
            'connectivity',
          ],
        },
        pros: initialPhone.pros?.length ? initialPhone.pros : [''],
        cons: initialPhone.cons?.length ? initialPhone.cons : [''],
      };
    }

    return {
      category: 'phone',
      brand: '',
      model: '',
      slug: '',
      releaseDate: '',
      variantGroupId: '',
      variantLabel: '',
      images: [''],
      price: { mrp: '', amazonPrice: '', flipkartPrice: '' },
      affiliateLinks: { amazon: '', flipkart: '' },
      specs: {
        display: {
          size: '',
          resolution: '',
          type: '',
          refreshRate: '',
          peakBrightness: '',
          hdrSupport: false,
          widevineLevel: 'L1',
        },
        performance: { chipset: '', ram: '', storage: '', antutu: '', coolingSystem: '' },
        camera: {
          rear: [{ megapixel: '', type: '', ois: false }],
          front: '',
          video: '',
        },
        battery: { capacity: '', chargingSpeedWatts: '', wirelessCharging: false, reverseCharging: false },
        build: { weight: '', thickness: '', materials: '', ipRating: 'None', stereoSpeakers: false },
        connectivity: {
          network5G: false,
          carrierAggregationBands: '',
          sim: '',
          nfc: false,
          usbType: '',
          vowifi: false,
          bluetoothVersion: '',
        },
      },
      laptopSpecs: {
        display: {
          size: '',
          resolution: '',
          panelType: '',
          refreshRate: '',
          brightness: '',
          colorGamutSRGBPercent: '',
          touchscreen: 'no',
        },
        performance: {
          cpuBrand: 'Intel',
          cpuModel: '',
          cpuGeneration: '',
          cpuCores: '',
          gpuType: 'integrated',
          gpuModel: '',
          gpuVRAM: '',
          ramSize: '',
          ramType: '',
          ramUpgradeable: 'no',
          storageType: 'SSD',
          storageCapacity: '',
          storageUpgradeable: 'no',
        },
        battery: { capacityWh: '', claimedBatteryHours: '', fastCharging: 'no' },
        build: { weight: '', thickness: '', chassisMaterial: '', hingeType: 'Standard' },
        ports: {
          usbACount: '',
          usbCCount: '',
          thunderboltSupport: 'no',
          hdmiPort: 'no',
          sdCardSlot: 'no',
          headphoneJack: 'no',
        },
        connectivity: { wifiStandard: '', bluetoothVersion: '' },
        os: { preinstalledOS: '', osUpgradeable: 'yes' }
      },
      mediaSamples: {
        cameraPhotos: [{ url: '', caption: '' }],
        sampleVideoUrl: '',
        reviewVideoTimestampUrl: '',
      },
      dataCompleteness: {
        verifiedFields: [] as string[],
        unverifiedFields: ['display', 'performance', 'camera', 'battery', 'build', 'connectivity'],
      },
      pros: [''],
      cons: [''],
    };
  };

  const [formState, setFormState] = useState(getInitialState);

  // 3. Load Draft / Autosave Logic
  const storageKey = initialPhone ? `truespecs_draft_edit_${initialPhone.id}` : 'truespecs_draft_new';

  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        const timer1 = setTimeout(() => {
          setFormState(parsed);
          setDraftLoadedMsg('Restored unsaved draft from your local storage.');
        }, 0);
        const timer2 = setTimeout(() => setDraftLoadedMsg(''), 5000);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      } catch (e) {
        console.error('Error parsing saved draft:', e);
      }
    }
  }, [storageKey]);

  // Save draft to localStorage whenever formState changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(formState));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formState, storageKey]);

  // Clean draft helper
  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  // 4. Auto-generate slug when brand or model changes (if slug not manually overridden)
  const [manualSlug, setManualSlug] = useState(!!initialPhone?.slug);

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const brand = e.target.value;
    setFormState((prev) => {
      const model = prev.model;
      const slug = manualSlug ? prev.slug : generateSlug(brand, model);
      return { ...prev, brand, slug };
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const model = e.target.value;
    setFormState((prev) => {
      const brand = prev.brand;
      const slug = manualSlug ? prev.slug : generateSlug(brand, model);
      return { ...prev, model, slug };
    });
  };

  const generateSlug = (brand: string, model: string) => {
    return `${brand}-${model}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // 5. Construct Draft Phone Object for live scoring
  const draftPhoneObject = useMemo<Phone>(() => {
    const parseNumArray = (str: string) => {
      return str
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x));
    };

    const isLaptop = formState.category === 'laptop';

    const specs = isLaptop ? {
      display: {
        size: Number(formState.laptopSpecs.display.size) || 0,
        resolution: formState.laptopSpecs.display.resolution || '',
        panelType: formState.laptopSpecs.display.panelType || '',
        refreshRate: Number(formState.laptopSpecs.display.refreshRate) || 60,
        brightness: Number(formState.laptopSpecs.display.brightness) || 300,
        colorGamutSRGBPercent: Number(formState.laptopSpecs.display.colorGamutSRGBPercent) || 100,
        touchscreen: formState.laptopSpecs.display.touchscreen === 'yes',
      },
      performance: {
        cpuBrand: formState.laptopSpecs.performance.cpuBrand || 'Intel',
        cpuModel: formState.laptopSpecs.performance.cpuModel || '',
        cpuGeneration: formState.laptopSpecs.performance.cpuGeneration || '',
        cpuCores: Number(formState.laptopSpecs.performance.cpuCores) || 4,
        gpuType: formState.laptopSpecs.performance.gpuType || 'integrated',
        gpuModel: formState.laptopSpecs.performance.gpuModel || '',
        gpuVRAM: formState.laptopSpecs.performance.gpuVRAM || '',
        ramSize: Number(formState.laptopSpecs.performance.ramSize) || 8,
        ramType: formState.laptopSpecs.performance.ramType || '',
        ramUpgradeable: formState.laptopSpecs.performance.ramUpgradeable === 'yes',
        storageType: formState.laptopSpecs.performance.storageType || 'SSD',
        storageCapacity: formState.laptopSpecs.performance.storageCapacity || '',
        storageUpgradeable: formState.laptopSpecs.performance.storageUpgradeable === 'yes',
      },
      battery: {
        capacityWh: Number(formState.laptopSpecs.battery.capacityWh) || 50,
        claimedBatteryHours: Number(formState.laptopSpecs.battery.claimedBatteryHours) || 8,
        fastCharging: formState.laptopSpecs.battery.fastCharging === 'yes',
      },
      build: {
        weight: Number(formState.laptopSpecs.build.weight) || 1.5,
        thickness: Number(formState.laptopSpecs.build.thickness) || 15.0,
        chassisMaterial: formState.laptopSpecs.build.chassisMaterial || '',
        hingeType: formState.laptopSpecs.build.hingeType || 'Standard',
      },
      ports: {
        usbACount: Number(formState.laptopSpecs.ports.usbACount) || 0,
        usbCCount: Number(formState.laptopSpecs.ports.usbCCount) || 0,
        thunderboltSupport: formState.laptopSpecs.ports.thunderboltSupport === 'yes',
        hdmiPort: formState.laptopSpecs.ports.hdmiPort === 'yes',
        sdCardSlot: formState.laptopSpecs.ports.sdCardSlot === 'yes',
        headphoneJack: formState.laptopSpecs.ports.headphoneJack === 'yes',
      },
      connectivity: {
        wifiStandard: formState.laptopSpecs.connectivity.wifiStandard || '',
        bluetoothVersion: formState.laptopSpecs.connectivity.bluetoothVersion || '',
      },
      os: {
        preinstalledOS: formState.laptopSpecs.os.preinstalledOS || '',
        osUpgradeable: formState.laptopSpecs.os.osUpgradeable === 'yes',
      }
    } : {
      display: {
        size: Number(formState.specs.display.size) || 0,
        resolution: formState.specs.display.resolution || '2400 x 1080',
        type: formState.specs.display.type || 'AMOLED',
        refreshRate: Number(formState.specs.display.refreshRate) || 120,
        peakBrightness: Number(formState.specs.display.peakBrightness) || 1000,
        hdrSupport: !!formState.specs.display.hdrSupport,
        widevineLevel: formState.specs.display.widevineLevel || 'L1',
      },
      performance: {
        chipset: formState.specs.performance.chipset || 'Snapdragon',
        ram: parseNumArray(formState.specs.performance.ram).length ? parseNumArray(formState.specs.performance.ram) : [8],
        storage: parseNumArray(formState.specs.performance.storage).length ? parseNumArray(formState.specs.performance.storage) : [128],
        antutu: formState.specs.performance.antutu ? Number(formState.specs.performance.antutu) : undefined,
        coolingSystem: formState.specs.performance.coolingSystem || '',
      },
      camera: {
        rear: formState.specs.camera.rear.map((lens: any) => ({
          megapixel: Number(lens.megapixel) || 12,
          type: lens.type || 'Wide',
          ois: !!lens.ois,
        })),
        front: formState.specs.camera.front || '12MP',
        video: formState.specs.camera.video || '1080p',
      },
      battery: {
        capacity: Number(formState.specs.battery.capacity) || 5000,
        chargingSpeedWatts: Number(formState.specs.battery.chargingSpeedWatts) || 33,
        wirelessCharging: !!formState.specs.battery.wirelessCharging,
        reverseCharging: !!formState.specs.battery.reverseCharging,
      },
      build: {
        weight: Number(formState.specs.build.weight) || 200,
        thickness: Number(formState.specs.build.thickness) || 8.0,
        materials: formState.specs.build.materials || 'Glass',
        ipRating: formState.specs.build.ipRating || 'None',
        stereoSpeakers: !!formState.specs.build.stereoSpeakers,
      },
      connectivity: {
        network5G: !!formState.specs.connectivity.network5G,
        carrierAggregationBands: formState.specs.connectivity.carrierAggregationBands || '',
        sim: formState.specs.connectivity.sim || 'Dual Nano SIM',
        nfc: !!formState.specs.connectivity.nfc,
        usbType: formState.specs.connectivity.usbType || 'USB Type-C',
        vowifi: !!formState.specs.connectivity.vowifi,
        bluetoothVersion: formState.specs.connectivity.bluetoothVersion || '5.3',
      },
    };

    return {
      id: initialPhone?.id || 'draft-phone-id',
      category: formState.category as 'phone' | 'laptop',
      brand: formState.brand || 'Brand',
      model: formState.model || 'Model',
      slug: formState.slug || 'slug',
      releaseDate: formState.releaseDate || '2023-01-01',
      images: formState.images.filter(Boolean),
      price: {
        mrp: Number(formState.price.mrp) || 0,
        amazonPrice: Number(formState.price.amazonPrice) || 0,
        flipkartPrice: Number(formState.price.flipkartPrice) || 0,
      },
      affiliateLinks: {
        amazon: formState.affiliateLinks.amazon || '',
        flipkart: formState.affiliateLinks.flipkart || '',
      },
      specs,
      ...(!isLaptop && {
        mediaSamples: {
          cameraPhotos: formState.mediaSamples.cameraPhotos
            .filter((photo) => photo.url)
            .map((p) => ({ url: p.url, caption: p.caption })),
          sampleVideoUrl: formState.mediaSamples.sampleVideoUrl || '',
          reviewVideoTimestampUrl: formState.mediaSamples.reviewVideoTimestampUrl || '',
        }
      }),
      dataCompleteness: {
        verifiedFields: formState.dataCompleteness.verifiedFields,
        unverifiedFields: formState.dataCompleteness.unverifiedFields,
      },
      specsScore: 0,
      pros: formState.pros.filter(Boolean),
      cons: formState.cons.filter(Boolean),
      variantGroupId: formState.variantGroupId ? formState.variantGroupId.trim() : undefined,
      variantLabel: formState.variantLabel ? formState.variantLabel.trim() : undefined,
    };
  }, [formState, initialPhone]);

  // 6. Live Specs Score Breakdown Preview
  const scoreBreakdown = useMemo(() => {
    try {
      const otherPhones = allPhones.filter((p) => p.id !== initialPhone?.id);
      return calculateSpecsScore(draftPhoneObject, [...otherPhones, draftPhoneObject]);
    } catch (err) {
      console.error('Error calculating live score preview:', err);
      return null;
    }
  }, [draftPhoneObject, allPhones, initialPhone]);

  // 7. Input handlers
  const handleInputChange = (section: string, field: string, value: string) => {
    setFormState((prev) => {
      if (section === 'root') {
        return { ...prev, [field]: value };
      }
      const sectionKey = section as keyof typeof prev;
      return {
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] as object),
          [field]: value,
        },
      };
    });
  };

  const handleSpecChange = (section: string, field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [section]: {
          ...prev.specs[section as keyof typeof prev.specs],
          [field]: value,
        },
      },
    }));
  };

  const handleLaptopSpecChange = (section: string, field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      laptopSpecs: {
        ...prev.laptopSpecs,
        [section]: {
          ...prev.laptopSpecs[section as keyof typeof prev.laptopSpecs] as any,
          [field]: value,
        },
      },
    }));
  };

  // 8. Repeatable lists handlers
  const handleImageChange = (idx: number, val: string) => {
    setFormState((prev) => {
      const newImgs = [...prev.images];
      newImgs[idx] = val;
      return { ...prev, images: newImgs };
    });
  };

  const addImageRow = () => {
    setFormState((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageRow = (idx: number) => {
    setFormState((prev) => {
      const newImgs = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images: newImgs.length ? newImgs : [''] };
    });
  };

  const handleRearLensChange = (idx: number, field: keyof RearCameraLens | 'megapixel', val: string | boolean) => {
    setFormState((prev) => {
      const newRear = [...prev.specs.camera.rear];
      const target = { ...newRear[idx] };
      if (field === 'ois') {
        target.ois = val as boolean;
      } else if (field === 'megapixel') {
        target.megapixel = val as string;
      } else if (field === 'type') {
        target.type = val as string;
      }
      newRear[idx] = target;
      return {
        ...prev,
        specs: {
          ...prev.specs,
          camera: {
            ...prev.specs.camera,
            rear: newRear,
          },
        },
      };
    });
  };

  const addRearLens = () => {
    setFormState((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        camera: {
          ...prev.specs.camera,
          rear: [...prev.specs.camera.rear, { megapixel: '', type: '', ois: false }],
        },
      },
    }));
  };

  const removeRearLens = (idx: number) => {
    setFormState((prev) => {
      const newRear = prev.specs.camera.rear.filter((_: any, i: number) => i !== idx);
      return {
        ...prev,
        specs: {
          ...prev.specs,
          camera: {
            ...prev.specs.camera,
            rear: newRear.length ? newRear : [{ megapixel: '', type: '', ois: false }],
          },
        },
      };
    });
  };

  const handleMediaPhotoChange = (idx: number, field: keyof MediaPhoto, val: string) => {
    setFormState((prev) => {
      const newPhotos = [...prev.mediaSamples.cameraPhotos];
      newPhotos[idx] = {
        ...newPhotos[idx],
        [field]: val,
      };
      return {
        ...prev,
        mediaSamples: {
          ...prev.mediaSamples,
          cameraPhotos: newPhotos,
        },
      };
    });
  };

  const addMediaPhoto = () => {
    setFormState((prev) => ({
      ...prev,
      mediaSamples: {
        ...prev.mediaSamples,
        cameraPhotos: [...prev.mediaSamples.cameraPhotos, { url: '', caption: '' }],
      },
    }));
  };

  const removeMediaPhoto = (idx: number) => {
    setFormState((prev) => {
      const newPhotos = prev.mediaSamples.cameraPhotos.filter((_, i) => i !== idx);
      return {
        ...prev,
        mediaSamples: {
          ...prev.mediaSamples,
          cameraPhotos: newPhotos.length ? newPhotos : [{ url: '', caption: '' }],
        },
      };
    });
  };

  const handleProsConsChange = (type: 'pros' | 'cons', idx: number, val: string) => {
    setFormState((prev) => {
      const list = [...prev[type]];
      list[idx] = val;
      return { ...prev, [type]: list };
    });
  };

  const addProsConsRow = (type: 'pros' | 'cons') => {
    setFormState((prev) => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };

  const removeProsConsRow = (type: 'pros' | 'cons', idx: number) => {
    setFormState((prev) => {
      const list = prev[type].filter((_, i) => i !== idx);
      return {
        ...prev,
        [type]: list.length ? list : [''],
      };
    });
  };

  // 9. Verification status handler
  const handleVerifyChange = (sectionKey: string, checked: boolean) => {
    setFormState((prev) => {
      let verified = [...prev.dataCompleteness.verifiedFields];
      let unverified = [...prev.dataCompleteness.unverifiedFields];

      if (checked) {
        if (!verified.includes(sectionKey)) verified.push(sectionKey);
        unverified = unverified.filter((s) => s !== sectionKey);
      } else {
        if (!unverified.includes(sectionKey)) unverified.push(sectionKey);
        verified = verified.filter((s) => s !== sectionKey);
      }

      return {
        ...prev,
        dataCompleteness: { verifiedFields: verified, unverifiedFields: unverified },
      };
    });
  };

  // 10. Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    try {
      // Validate affiliate links URLs
      const urlRegex = /^https?:\/\/.+/i;
      if (formState.affiliateLinks.amazon && !urlRegex.test(formState.affiliateLinks.amazon)) {
        setSaveError('Amazon affiliate link must be a valid URL (starting with http:// or https://)');
        setIsSaving(false);
        return;
      }
      if (formState.affiliateLinks.flipkart && !urlRegex.test(formState.affiliateLinks.flipkart)) {
        setSaveError('Flipkart affiliate link must be a valid URL (starting with http:// or https://)');
        setIsSaving(false);
        return;
      }

      // Check required basic fields
      if (!formState.brand.trim()) {
        setSaveError('Brand is required.');
        setIsSaving(false);
        return;
      }
      if (!formState.model.trim()) {
        setSaveError('Model name is required.');
        setIsSaving(false);
        return;
      }

      // Call save phone action
      const res = await savePhone(draftPhoneObject, initialPhone?.id);

      if (res.success) {
        clearDraft();
        setToast({ message: 'Phone specs saved successfully!', type: 'success' });
        setTimeout(() => {
          router.push('/admin/phones');
          router.refresh();
        }, 1500);
      } else {
        setSaveError(res.error || 'Failed to save data');
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 admin-form-theme">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-55 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold shadow-lg transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-600 border-emerald-500 text-white' 
            : 'bg-rose-600 border-rose-500 text-white text-rose-600'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme/80 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-theme-primary font-display">
            {initialPhone ? `Edit Specs: ${initialPhone.brand} ${initialPhone.model}` : (formState.category === 'laptop' ? 'Add New Laptop' : 'Add New Phone')}
          </h1>
          <p className="text-sm text-theme-secondary mt-1">
            Fill in the detailed technical specifications below. Drafts are autosaved locally.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              if (confirm('Discard changes and return to dashboard? Unsaved local progress might be lost.')) {
                clearDraft();
                router.push('/admin/phones');
              }
            }}
            className="px-4 py-2.5 rounded-lg border border-theme bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Cancel / Back
          </button>
        </div>
      </div>

      {draftLoadedMsg && (
        <div className="rounded-lg border border-accent/20 bg-accent-bg px-4 py-3 text-xs font-semibold text-accent flex items-center gap-2 animate-bounce-short">
          <span>✨</span> {draftLoadedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Body (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: BASIC INFO */}
          <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-theme-primary uppercase tracking-wide border-b border-theme pb-2">
              Basic Information
            </h3>
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Category *</label>
              <select
                value={formState.category}
                onChange={(e) => handleInputChange('root', 'category', e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
              >
                <option value="phone">Smartphone</option>
                <option value="laptop">Laptop</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Samsung, OnePlus"
                  value={formState.brand}
                  onChange={handleBrandChange}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy S24 Ultra, iPhone 15 Pro Max"
                  value={formState.model}
                  onChange={handleModelChange}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">URL Slug</label>
                  <button
                    type="button"
                    onClick={() => setManualSlug(!manualSlug)}
                    className="text-[10px] font-bold text-accent hover:text-accent-hover"
                  >
                    {manualSlug ? 'Auto-generate' : 'Override manually'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. apple-iphone-15-pro-max"
                  value={formState.slug}
                  disabled={!manualSlug}
                  onChange={(e) => handleInputChange('root', 'slug', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-50 disabled:bg-theme-surface-hover"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Release Date</label>
                <input
                  type="date"
                  value={formState.releaseDate}
                  onChange={(e) => handleInputChange('root', 'releaseDate', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Variant Group ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. asus-zenbook-14, google-pixel-9"
                  value={formState.variantGroupId || ''}
                  onChange={(e) => handleInputChange('root', 'variantGroupId', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Variant Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Core i7 / 16GB / 512GB"
                  value={formState.variantLabel || ''}
                  onChange={(e) => handleInputChange('root', 'variantLabel', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            {/* Images list with thumbnail previews */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Images (URLs)</label>
              {formState.images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="flex-1 h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                  <ImagePreview url={imgUrl} />
                  <button
                    type="button"
                    onClick={() => removeImageRow(idx)}
                    className="h-11 w-11 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-rose-600 flex items-center justify-center shrink-0 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageRow}
                className="w-full h-10 rounded-lg border border-dashed border-theme hover:border-theme bg-theme-surface-hover hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                + Add Image URL
              </button>
            </div>
          </div>

          {/* SECTION 2: PRICING */}
          <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-theme-primary uppercase tracking-wide border-b border-theme pb-2">
              Pricing & Affiliate Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">MRP (INR)</label>
                <input
                  type="number"
                  placeholder="159900"
                  value={formState.price.mrp}
                  onChange={(e) => handleInputChange('price', 'mrp', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Amazon Price (INR)</label>
                <input
                  type="number"
                  placeholder="148900"
                  value={formState.price.amazonPrice}
                  onChange={(e) => handleInputChange('price', 'amazonPrice', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Flipkart Price (INR)</label>
                <input
                  type="number"
                  placeholder="149900"
                  value={formState.price.flipkartPrice}
                  onChange={(e) => handleInputChange('price', 'flipkartPrice', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Amazon Affiliate URL</label>
                <input
                  type="text"
                  placeholder="https://www.amazon.in/dp/..."
                  value={formState.affiliateLinks.amazon}
                  onChange={(e) => handleInputChange('affiliateLinks', 'amazon', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Flipkart Affiliate URL</label>
                <input
                  type="text"
                  placeholder="https://www.flipkart.com/..."
                  value={formState.affiliateLinks.flipkart}
                  onChange={(e) => handleInputChange('affiliateLinks', 'flipkart', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>
          </div>

                    {/* SECTION 3: TECHNICAL SPECS (Collapsible) */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-theme-primary uppercase tracking-wider font-display">
              Technical Specifications
            </h3>

            {formState.category === 'laptop' ? (
              <>

            {/* A. Laptop Display Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('display')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">1. Display Specs</span>
                <span className="text-theme-secondary text-lg">{openSections.display ? '−' : '+'}</span>
              </button>

              {openSections.display && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Display Size (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 13.3"
                      value={formState.laptopSpecs.display.size}
                      onChange={(e) => handleLaptopSpecChange('display', 'size', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Resolution</label>
                    <input
                      type="text"
                      placeholder="e.g. 2560 x 1600"
                      value={formState.laptopSpecs.display.resolution}
                      onChange={(e) => handleLaptopSpecChange('display', 'resolution', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Panel Type</label>
                    <input
                      type="text"
                      placeholder="e.g. IPS, OLED, Mini LED"
                      value={formState.laptopSpecs.display.panelType}
                      onChange={(e) => handleLaptopSpecChange('display', 'panelType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Refresh Rate (Hz)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60, 120"
                      value={formState.laptopSpecs.display.refreshRate}
                      onChange={(e) => handleLaptopSpecChange('display', 'refreshRate', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Brightness (nits)</label>
                    <input
                      type="number"
                      placeholder="e.g. 400"
                      value={formState.laptopSpecs.display.brightness}
                      onChange={(e) => handleLaptopSpecChange('display', 'brightness', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Color Gamut (% sRGB)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={formState.laptopSpecs.display.colorGamutSRGBPercent}
                      onChange={(e) => handleLaptopSpecChange('display', 'colorGamutSRGBPercent', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Touchscreen</label>
                    <select
                      value={formState.laptopSpecs.display.touchscreen}
                      onChange={(e) => handleLaptopSpecChange('display', 'touchscreen', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* B. Laptop Performance Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('performance')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">2. Performance & Hardware</span>
                <span className="text-theme-secondary text-lg">{openSections.performance ? '−' : '+'}</span>
              </button>

              {openSections.performance && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">CPU Brand</label>
                    <select
                      value={formState.laptopSpecs.performance.cpuBrand}
                      onChange={(e) => handleLaptopSpecChange('performance', 'cpuBrand', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="Intel">Intel</option>
                      <option value="AMD">AMD</option>
                      <option value="Apple">Apple</option>
                      <option value="Qualcomm">Qualcomm</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">CPU Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Core i7-13700H"
                      value={formState.laptopSpecs.performance.cpuModel}
                      onChange={(e) => handleLaptopSpecChange('performance', 'cpuModel', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">CPU Generation</label>
                    <input
                      type="text"
                      placeholder="e.g. 13th Gen"
                      value={formState.laptopSpecs.performance.cpuGeneration}
                      onChange={(e) => handleLaptopSpecChange('performance', 'cpuGeneration', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">CPU Cores Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={formState.laptopSpecs.performance.cpuCores}
                      onChange={(e) => handleLaptopSpecChange('performance', 'cpuCores', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">GPU Type</label>
                    <select
                      value={formState.laptopSpecs.performance.gpuType}
                      onChange={(e) => handleLaptopSpecChange('performance', 'gpuType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="integrated">Integrated</option>
                      <option value="dedicated">Dedicated</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">GPU Model</label>
                    <input
                      type="text"
                      placeholder="e.g. NVIDIA GeForce RTX 4060"
                      value={formState.laptopSpecs.performance.gpuModel}
                      onChange={(e) => handleLaptopSpecChange('performance', 'gpuModel', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">GPU VRAM</label>
                    <input
                      type="text"
                      placeholder="e.g. 8GB GDDR6, Shared"
                      value={formState.laptopSpecs.performance.gpuVRAM}
                      onChange={(e) => handleLaptopSpecChange('performance', 'gpuVRAM', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">RAM Size (GB)</label>
                    <input
                      type="number"
                      placeholder="e.g. 16"
                      value={formState.laptopSpecs.performance.ramSize}
                      onChange={(e) => handleLaptopSpecChange('performance', 'ramSize', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">RAM Type</label>
                    <input
                      type="text"
                      placeholder="e.g. DDR5, LPDDR5X"
                      value={formState.laptopSpecs.performance.ramType}
                      onChange={(e) => handleLaptopSpecChange('performance', 'ramType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">RAM Upgradeable</label>
                    <select
                      value={formState.laptopSpecs.performance.ramUpgradeable}
                      onChange={(e) => handleLaptopSpecChange('performance', 'ramUpgradeable', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Storage Type</label>
                    <select
                      value={formState.laptopSpecs.performance.storageType}
                      onChange={(e) => handleLaptopSpecChange('performance', 'storageType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="SSD">SSD (PCIe NVMe)</option>
                      <option value="eMMC">eMMC</option>
                      <option value="HDD">HDD</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Storage Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g. 512GB, 1TB"
                      value={formState.laptopSpecs.performance.storageCapacity}
                      onChange={(e) => handleLaptopSpecChange('performance', 'storageCapacity', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Storage Upgradeable</label>
                    <select
                      value={formState.laptopSpecs.performance.storageUpgradeable}
                      onChange={(e) => handleLaptopSpecChange('performance', 'storageUpgradeable', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* C. Laptop Battery Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('battery')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">3. Battery & Power</span>
                <span className="text-theme-secondary text-lg">{openSections.battery ? '−' : '+'}</span>
              </button>

              {openSections.battery && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Battery Capacity (Wh)</label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={formState.laptopSpecs.battery.capacityWh}
                      onChange={(e) => handleLaptopSpecChange('battery', 'capacityWh', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Claimed Battery Life (Hours)</label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={formState.laptopSpecs.battery.claimedBatteryHours}
                      onChange={(e) => handleLaptopSpecChange('battery', 'claimedBatteryHours', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Fast Charging</label>
                    <select
                      value={formState.laptopSpecs.battery.fastCharging}
                      onChange={(e) => handleLaptopSpecChange('battery', 'fastCharging', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* D. Laptop Build & Design Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('build')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">4. Design & Build</span>
                <span className="text-theme-secondary text-lg">{openSections.build ? '−' : '+'}</span>
              </button>

              {openSections.build && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.35"
                      value={formState.laptopSpecs.build.weight}
                      onChange={(e) => handleLaptopSpecChange('build', 'weight', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Thickness (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 15.6"
                      value={formState.laptopSpecs.build.thickness}
                      onChange={(e) => handleLaptopSpecChange('build', 'thickness', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Chassis Material</label>
                    <input
                      type="text"
                      placeholder="e.g. CNC Aluminum, Magnesium Alloy"
                      value={formState.laptopSpecs.build.chassisMaterial}
                      onChange={(e) => handleLaptopSpecChange('build', 'chassisMaterial', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Hinge Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Standard, 180-degree, 360-degree"
                      value={formState.laptopSpecs.build.hingeType}
                      onChange={(e) => handleLaptopSpecChange('build', 'hingeType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* E. Laptop Ports & Expansion Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('camera')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">5. Ports & Expansion</span>
                <span className="text-theme-secondary text-lg">{openSections.camera ? '−' : '+'}</span>
              </button>

              {openSections.camera && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">USB-A Ports Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={formState.laptopSpecs.ports.usbACount}
                      onChange={(e) => handleLaptopSpecChange('ports', 'usbACount', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">USB-C Ports Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={formState.laptopSpecs.ports.usbCCount}
                      onChange={(e) => handleLaptopSpecChange('ports', 'usbCCount', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Thunderbolt Support</label>
                    <select
                      value={formState.laptopSpecs.ports.thunderboltSupport}
                      onChange={(e) => handleLaptopSpecChange('ports', 'thunderboltSupport', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">HDMI Port</label>
                    <select
                      value={formState.laptopSpecs.ports.hdmiPort}
                      onChange={(e) => handleLaptopSpecChange('ports', 'hdmiPort', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">SD Card Slot</label>
                    <select
                      value={formState.laptopSpecs.ports.sdCardSlot}
                      onChange={(e) => handleLaptopSpecChange('ports', 'sdCardSlot', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes (Full Size / Micro)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Headphone Jack</label>
                    <select
                      value={formState.laptopSpecs.ports.headphoneJack}
                      onChange={(e) => handleLaptopSpecChange('ports', 'headphoneJack', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="yes">Yes (3.5mm Combo)</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* F. Laptop Connectivity Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('connectivity')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">6. Connectivity & Wireless</span>
                <span className="text-theme-secondary text-lg">{openSections.connectivity ? '−' : '+'}</span>
              </button>

              {openSections.connectivity && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Wi-Fi Standard</label>
                    <input
                      type="text"
                      placeholder="e.g. Wi-Fi 6E (802.11ax)"
                      value={formState.laptopSpecs.connectivity.wifiStandard}
                      onChange={(e) => handleLaptopSpecChange('connectivity', 'wifiStandard', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Bluetooth Version</label>
                    <input
                      type="text"
                      placeholder="e.g. 5.3"
                      value={formState.laptopSpecs.connectivity.bluetoothVersion}
                      onChange={(e) => handleLaptopSpecChange('connectivity', 'bluetoothVersion', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* G. Laptop OS Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('os' as any)}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">7. Operating System</span>
                <span className="text-theme-secondary text-lg">{openSections.os ? '−' : '+'}</span>
              </button>

              {openSections.os && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Preinstalled OS</label>
                    <input
                      type="text"
                      placeholder="e.g. Windows 11 Home, macOS Sonoma"
                      value={formState.laptopSpecs.os.preinstalledOS}
                      onChange={(e) => handleLaptopSpecChange('os', 'preinstalledOS', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">OS Upgradeable</label>
                    <select
                      value={formState.laptopSpecs.os.osUpgradeable}
                      onChange={(e) => handleLaptopSpecChange('os', 'osUpgradeable', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
    
              </>
            ) : (
              <>
                {/* SECTION 3: TECHNICAL SPECS (Collapsible) */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-theme-primary uppercase tracking-wider font-display">
              Technical Specifications
            </h3>

            {/* A. Display Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('display')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">1. Display Specs</span>
                <span className="text-theme-secondary text-lg">{openSections.display ? '−' : '+'}</span>
              </button>

              {openSections.display && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Display Size (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 6.7"
                      value={formState.specs.display.size}
                      onChange={(e) => handleSpecChange('display', 'size', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Resolution (Width x Height)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2796 x 1290"
                      value={formState.specs.display.resolution}
                      onChange={(e) => handleSpecChange('display', 'resolution', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Panel Type</label>
                    <input
                      type="text"
                      placeholder="e.g. LTPO Super Retina XDR OLED"
                      value={formState.specs.display.type}
                      onChange={(e) => handleSpecChange('display', 'type', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Refresh Rate (Hz)</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={formState.specs.display.refreshRate}
                      onChange={(e) => handleSpecChange('display', 'refreshRate', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Peak Brightness (nits)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={formState.specs.display.peakBrightness}
                      onChange={(e) => handleSpecChange('display', 'peakBrightness', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Widevine Level</label>
                    <select
                      value={formState.specs.display.widevineLevel}
                      onChange={(e) => handleSpecChange('display', 'widevineLevel', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    >
                      <option value="L1">L1</option>
                      <option value="L3">L3</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-4 sm:col-span-2">
                    <input
                      id="hdrSupport"
                      type="checkbox"
                      checked={formState.specs.display.hdrSupport}
                      onChange={(e) => handleSpecChange('display', 'hdrSupport', e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                    />
                    <label htmlFor="hdrSupport" className="text-xs font-bold text-theme-primary uppercase tracking-wider">HDR Support (HDR10/Dolby Vision)</label>
                  </div>
                </div>
              )}
            </div>

            {/* B. Performance Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('performance')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">2. Performance Specs</span>
                <span className="text-theme-secondary text-lg">{openSections.performance ? '−' : '+'}</span>
              </button>

              {openSections.performance && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Chipset (SoC)</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple A17 Pro, Snapdragon 8 Gen 3"
                      value={formState.specs.performance.chipset}
                      onChange={(e) => handleSpecChange('performance', 'chipset', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">RAM Options (comma separated GBs)</label>
                    <input
                      type="text"
                      placeholder="e.g. 8, 12"
                      value={formState.specs.performance.ram}
                      onChange={(e) => handleSpecChange('performance', 'ram', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Storage Options (comma separated GBs)</label>
                    <input
                      type="text"
                      placeholder="e.g. 128, 256, 512, 1024"
                      value={formState.specs.performance.storage}
                      onChange={(e) => handleSpecChange('performance', 'storage', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">AnTuTu Score (optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1550000"
                      value={formState.specs.performance.antutu}
                      onChange={(e) => handleSpecChange('performance', 'antutu', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Cooling System (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dual Vapor Chamber, Graphite Sheets"
                      value={formState.specs.performance.coolingSystem}
                      onChange={(e) => handleSpecChange('performance', 'coolingSystem', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* C. Camera Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('camera')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">3. Camera Specs</span>
                <span className="text-theme-secondary text-lg">{openSections.camera ? '−' : '+'}</span>
              </button>

              {openSections.camera && (
                <div className="p-6 space-y-4">
                  {/* Rear Camera Lenses (Repeatable) */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Rear Lenses</label>
                    {formState.specs.camera.rear.map((lens: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-theme bg-theme-elevated/20 p-3 rounded-lg">
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 flex-1">
                          <input
                            type="number"
                            placeholder="MP (e.g. 48)"
                            value={lens.megapixel}
                            onChange={(e) => handleRearLensChange(idx, 'megapixel', e.target.value)}
                            className="h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm w-full sm:w-28 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Type (e.g. Wide, Ultrawide)"
                            value={lens.type}
                            onChange={(e) => handleRearLensChange(idx, 'type', e.target.value)}
                            className="h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                          />
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lens.ois}
                              onChange={(e) => handleRearLensChange(idx, 'ois', e.target.checked)}
                              className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                            />
                            <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">OIS</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeRearLens(idx)}
                            className="h-9 px-3 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover hover:text-rose-600 text-theme-secondary transition-all text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRearLens}
                      className="w-full h-10 rounded-lg border border-dashed border-theme hover:border-theme bg-theme-surface-hover hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      + Add Lens Row
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Front Camera (Megapixel details)</label>
                      <input
                        type="text"
                        placeholder="e.g. 12MP with OIS & Autofocus"
                        value={formState.specs.camera.front}
                        onChange={(e) => handleSpecChange('camera', 'front', e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Video Max Resolution & Stabilization</label>
                      <input
                        type="text"
                        placeholder="e.g. 4K @ 60fps, ProRes, Action Mode (EIS)"
                        value={formState.specs.camera.video}
                        onChange={(e) => handleSpecChange('camera', 'video', e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* D. Battery Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('battery')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">4. Battery & Charging</span>
                <span className="text-theme-secondary text-lg">{openSections.battery ? '−' : '+'}</span>
              </button>

              {openSections.battery && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Battery Capacity (mAh)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formState.specs.battery.capacity}
                      onChange={(e) => handleSpecChange('battery', 'capacity', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Wired Charging Speed (Watts)</label>
                    <input
                      type="number"
                      placeholder="e.g. 67"
                      value={formState.specs.battery.chargingSpeedWatts}
                      onChange={(e) => handleSpecChange('battery', 'chargingSpeedWatts', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      id="wirelessCharging"
                      type="checkbox"
                      checked={formState.specs.battery.wirelessCharging}
                      onChange={(e) => handleSpecChange('battery', 'wirelessCharging', e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                    />
                    <label htmlFor="wirelessCharging" className="text-xs font-bold text-theme-primary uppercase tracking-wider">Wireless Charging</label>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      id="reverseCharging"
                      type="checkbox"
                      checked={formState.specs.battery.reverseCharging}
                      onChange={(e) => handleSpecChange('battery', 'reverseCharging', e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                    />
                    <label htmlFor="reverseCharging" className="text-xs font-bold text-theme-primary uppercase tracking-wider">Reverse Wireless Charging</label>
                  </div>
                </div>
              )}
            </div>

            {/* E. Build Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('build')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">5. Build & Design</span>
                <span className="text-theme-secondary text-lg">{openSections.build ? '−' : '+'}</span>
              </button>

              {openSections.build && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Weight (grams)</label>
                    <input
                      type="number"
                      placeholder="e.g. 221"
                      value={formState.specs.build.weight}
                      onChange={(e) => handleSpecChange('build', 'weight', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Thickness (mm)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.25"
                      value={formState.specs.build.thickness}
                      onChange={(e) => handleSpecChange('build', 'thickness', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Materials Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Titanium frame, Glass back"
                      value={formState.specs.build.materials}
                      onChange={(e) => handleSpecChange('build', 'materials', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">IP Water/Dust Rating</label>
                    <select
                      value={formState.specs.build.ipRating}
                      onChange={(e) => handleSpecChange('build', 'ipRating', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    >
                      <option value="IP68">IP68</option>
                      <option value="IP67">IP67</option>
                      <option value="IP54">IP54</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-4 sm:col-span-2">
                    <input
                      id="stereoSpeakers"
                      type="checkbox"
                      checked={formState.specs.build.stereoSpeakers}
                      onChange={(e) => handleSpecChange('build', 'stereoSpeakers', e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                    />
                    <label htmlFor="stereoSpeakers" className="text-xs font-bold text-theme-primary uppercase tracking-wider">Stereo Speakers</label>
                  </div>
                </div>
              )}
            </div>

            {/* F. Connectivity Specs */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('connectivity')}
                className="w-full px-6 py-4 flex items-center justify-between bg-theme-surface/25 border-b border-theme hover:bg-theme-surface-hover transition-all"
              >
                <span className="font-extrabold text-theme-primary text-sm tracking-wide uppercase">6. Connectivity Specs</span>
                <span className="text-theme-secondary text-lg">{openSections.connectivity ? '−' : '+'}</span>
              </button>

              {openSections.connectivity && (
                <div className="p-6 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Carrier Aggregation Bands</label>
                    <input
                      type="text"
                      placeholder="e.g. 4x4 MIMO, 30+ Bands"
                      value={formState.specs.connectivity.carrierAggregationBands}
                      onChange={(e) => handleSpecChange('connectivity', 'carrierAggregationBands', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">SIM Slot Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Dual eSIM, eSIM + Physical SIM"
                      value={formState.specs.connectivity.sim}
                      onChange={(e) => handleSpecChange('connectivity', 'sim', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">USB Port Type</label>
                    <input
                      type="text"
                      placeholder="e.g. USB Type-C 3.0"
                      value={formState.specs.connectivity.usbType}
                      onChange={(e) => handleSpecChange('connectivity', 'usbType', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Bluetooth Version</label>
                    <input
                      type="text"
                      placeholder="e.g. 5.3"
                      value={formState.specs.connectivity.bluetoothVersion}
                      onChange={(e) => handleSpecChange('connectivity', 'bluetoothVersion', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:col-span-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.specs.connectivity.network5G}
                        onChange={(e) => handleSpecChange('connectivity', 'network5G', e.target.checked)}
                        className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                      />
                      <span className="text-xs font-bold text-theme-primary uppercase tracking-wider">5G Connected</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.specs.connectivity.nfc}
                        onChange={(e) => handleSpecChange('connectivity', 'nfc', e.target.checked)}
                        className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                      />
                      <span className="text-xs font-bold text-theme-primary uppercase tracking-wider">NFC Support</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.specs.connectivity.vowifi}
                        onChange={(e) => handleSpecChange('connectivity', 'vowifi', e.target.checked)}
                        className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                      />
                      <span className="text-xs font-bold text-theme-primary uppercase tracking-wider">VoWiFi Enabled</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          
              </>
            )}
          </div>
          {/* SECTION 4: MEDIA SAMPLES */}
          {formState.category !== 'laptop' && (
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-theme-primary uppercase tracking-wide border-b border-theme pb-2">
              Media Samples
            </h3>
            {/* Camera photo samples (repeatable) */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">Camera Sample Photos</label>
              {formState.mediaSamples.cameraPhotos.map((photo, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-theme bg-theme-elevated/20 p-3 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Photo Image URL"
                      value={photo.url}
                      onChange={(e) => handleMediaPhotoChange(idx, 'url', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Caption (e.g. 5x Zoom - Outdoor Sunset)"
                      value={photo.caption}
                      onChange={(e) => handleMediaPhotoChange(idx, 'caption', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <ImagePreview url={photo.url} />
                    <button
                      type="button"
                      onClick={() => removeMediaPhoto(idx)}
                      className="h-10 px-3 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover hover:text-rose-600 text-theme-secondary transition-all text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMediaPhoto}
                className="w-full h-10 rounded-lg border border-dashed border-theme hover:border-theme bg-theme-surface-hover hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                + Add Photo Sample
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Sample Video URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formState.mediaSamples.sampleVideoUrl}
                  onChange={(e) => handleInputChange('mediaSamples', 'sampleVideoUrl', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">Review Video Timestamp URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/embed/..."
                  value={formState.mediaSamples.reviewVideoTimestampUrl}
                  onChange={(e) => handleInputChange('mediaSamples', 'reviewVideoTimestampUrl', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>
          </div>
          )}

          {/* SECTION 5: PROS & CONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wide border-b border-theme pb-2 flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> Pros Bullet Points
              </h3>
              <div className="space-y-2">
                {formState.pros.map((pro, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Incredible zoom range"
                      value={pro}
                      onChange={(e) => handleProsConsChange('pros', idx, e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-emerald-950 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeProsConsRow('pros', idx)}
                      className="h-10 w-10 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-rose-600 flex items-center justify-center shrink-0 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addProsConsRow('pros')}
                  className="w-full h-9 rounded-lg border border-dashed border-theme hover:border-theme text-theme-secondary hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  + Add Pro Point
                </button>
              </div>
            </div>

            {/* Cons */}
            <div className="rounded-2xl border border-theme bg-theme-surface shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-rose-600 uppercase tracking-wide border-b border-theme pb-2 flex items-center gap-1.5">
                <span className="text-rose-500">✗</span> Cons Bullet Points
              </h3>
              <div className="space-y-2">
                {formState.cons.map((con, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Slow wired charging speed"
                      value={con}
                      onChange={(e) => handleProsConsChange('cons', idx, e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-theme bg-theme-elevated text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-rose-950 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeProsConsRow('cons', idx)}
                      className="h-10 w-10 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-rose-600 flex items-center justify-center shrink-0 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addProsConsRow('cons')}
                  className="w-full h-9 rounded-lg border border-dashed border-theme hover:border-theme text-theme-secondary hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  + Add Con Point
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Controls (Right Column) */}
        <div className="space-y-6">
          
          {/* CONTROL: SAVE */}
          <div className="rounded-2xl border border-theme bg-theme-elevated p-6 space-y-4 sticky top-20 shadow-xl">
            <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
              Publish Status
            </h3>

            {saveError && (
              <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <span className="shrink-0 text-rose-500">⚠️</span>
                <span>{saveError}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-lg bg-accent hover:bg-accent-hover hover:scale-[1.01] text-sm font-bold text-white transition-all shadow-md shadow-accent/10 disabled:opacity-50 cursor-pointer flex items-center justify-center font-sans"
              >
                {isSaving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  formState.category === 'laptop' ? 'Save Laptop Specs' : 'Save Phone Specs'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Discard changes and return to dashboard? Unsaved local progress might be lost.')) {
                    clearDraft();
                    router.push('/admin/phones');
                  }
                }}
                className="w-full h-11 rounded-lg border border-theme bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover text-xs font-bold transition-all cursor-pointer font-sans"
              >
                Discard & Exit
              </button>
            </div>

            {/* DATA COMPLETENESS VERIFICATION CHECKBOXES */}
            <div className="border-t border-theme pt-4 space-y-3">
              <h4 className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                Data Verification Status
              </h4>
              <p className="text-[11px] text-theme-secondary leading-relaxed">
                Check sections you have manually verified. Unchecked sections display an &quot;Unverified&quot; flag on the public comparison page.
              </p>

              <div className="space-y-2.5 pt-1">
                {[
                  { key: 'display', label: '1. Display Specs' },
                  { key: 'performance', label: '2. Performance Specs' },
                  { key: 'camera', label: '3. Camera Specs', hideLaptop: true },
                  { key: 'battery', label: '4. Battery & Charging' },
                  { key: 'build', label: '5. Build & Design' },
                  { key: 'connectivity', label: '6. Connectivity Specs' },
                  { key: 'ports', label: '5. Ports & Expansion', showLaptopOnly: true },
                  { key: 'os', label: '7. Operating System', showLaptopOnly: true },
                ].filter(sec => {
                  if (sec.showLaptopOnly) return formState.category === 'laptop';
                  if (sec.hideLaptop) return formState.category !== 'laptop';
                  return true;
                }).map((sec, idx) => {
                  const isVerified = formState.dataCompleteness.verifiedFields.includes(sec.key);
                  return (
                    <label key={sec.key} className="flex items-center justify-between p-2 rounded-lg border border-theme bg-theme-elevated hover:border-theme cursor-pointer select-none">
                      <span className="text-xs font-semibold text-theme-primary">
                        {idx + 1}. {sec.label.split('. ')[1]}
                      </span>
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => handleVerifyChange(sec.key, e.target.checked)}
                        className="h-4 w-4 rounded border-theme bg-theme-elevated text-accent focus:ring-accent"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LIVE SPECS SCORE PREVIEW */}
            <div className="border-t border-theme pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                  Computed Score Preview
                </h4>
                {scoreBreakdown && (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-bg text-accent border border-accent/20 font-black text-base animate-pulse tabular-nums">
                    {scoreBreakdown.overall}
                  </span>
                )}
              </div>

              {scoreBreakdown ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-theme-secondary">
                    <span>Performance {formState.category === 'laptop' ? '(35%)' : '(30%)'}:</span>
                    <span className="font-bold text-theme-primary">{scoreBreakdown.performance.score}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-theme-secondary">
                    <span>Display (20%):</span>
                    <span className="font-bold text-theme-primary">{scoreBreakdown.display.score}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-theme-secondary">
                    <span>{formState.category === 'laptop' ? 'Build & Ports (20%)' : 'Camera (25%)'}:</span>
                    <span className="font-bold text-theme-primary">{scoreBreakdown.camera.score}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-theme-secondary">
                    <span>Battery (15%):</span>
                    <span className="font-bold text-theme-primary">{scoreBreakdown.battery.score}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-theme-secondary">
                    <span>{formState.category === 'laptop' ? 'Storage/Upgrade (10%)' : 'Build & Conn (10%)'}:</span>
                    <span className="font-bold text-theme-primary">{scoreBreakdown.buildConnectivity.score}/100</span>
                  </div>
                  <div className="pt-2 text-[10px] italic text-theme-secondary border-t border-theme leading-normal">
                    <strong>Explanation:</strong> {scoreBreakdown.explanation}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-theme-secondary italic">
                  Fill in standard specs to compute live score breakdown.
                </div>
              )}
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
