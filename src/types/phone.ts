export interface DisplaySpecs {
  size: number;
  resolution: string;
  type: string;
  refreshRate: number;
  peakBrightness: number;
  hdrSupport: boolean;
  widevineLevel: string;
}

export interface PerformanceSpecs {
  chipset: string;
  ram: number[];
  storage: number[];
  antutu?: number;
  coolingSystem: string;
}

export interface RearCameraLens {
  megapixel: number;
  type: string;
  ois: boolean;
}

export interface CameraSpecs {
  rear: RearCameraLens[];
  front: string;
  video: string;
}

export interface BatterySpecs {
  capacity: number;
  chargingSpeedWatts: number;
  wirelessCharging: boolean;
  reverseCharging: boolean;
}

export interface BuildSpecs {
  weight: number;
  thickness: number;
  materials: string;
  ipRating: string;
  stereoSpeakers: boolean;
}

export interface ConnectivitySpecs {
  network5G: boolean;
  carrierAggregationBands: string;
  sim: string;
  nfc: boolean;
  usbType: string;
  vowifi: boolean;
  bluetoothVersion: string;
}

export interface PhoneSpecs {
  display: DisplaySpecs;
  performance: PerformanceSpecs;
  camera: CameraSpecs;
  battery: BatterySpecs;
  build: BuildSpecs;
  connectivity: ConnectivitySpecs;
}

export interface MediaPhoto {
  url: string;
  caption: string;
}

export interface MediaSamples {
  cameraPhotos: MediaPhoto[];
  sampleVideoUrl: string;
  reviewVideoTimestampUrl: string;
}

export interface DataCompleteness {
  verifiedFields: string[];
  unverifiedFields: string[];
}

export interface LaptopDisplaySpecs {
  size: number;
  resolution: string;
  panelType: string;
  refreshRate: number;
  brightness: number;
  colorGamutSRGBPercent: number;
  touchscreen: boolean;
}

export interface LaptopPerformanceSpecs {
  cpuBrand: string;
  cpuModel: string;
  cpuGeneration: string;
  cpuCores: number;
  gpuType: string; // "integrated" | "dedicated"
  gpuModel: string;
  gpuVRAM: string;
  ramSize: number;
  ramType: string;
  ramUpgradeable: boolean;
  storageType: string;
  storageCapacity: string;
  storageUpgradeable: boolean;
}

export interface LaptopBatterySpecs {
  capacityWh: number;
  claimedBatteryHours: number;
  fastCharging: boolean;
}

export interface LaptopBuildSpecs {
  weight: number;
  thickness: number;
  chassisMaterial: string;
  hingeType: string;
}

export interface LaptopPortsSpecs {
  usbACount: number;
  usbCCount: number;
  thunderboltSupport: boolean;
  hdmiPort: boolean;
  sdCardSlot: boolean;
  headphoneJack: boolean;
}

export interface LaptopConnectivitySpecs {
  wifiStandard: string;
  bluetoothVersion: string;
}

export interface LaptopOSSpecs {
  preinstalledOS: string;
  osUpgradeable: boolean;
}

export interface LaptopSpecs {
  display: LaptopDisplaySpecs;
  performance: LaptopPerformanceSpecs;
  battery: LaptopBatterySpecs;
  build: LaptopBuildSpecs;
  ports: LaptopPortsSpecs;
  connectivity: LaptopConnectivitySpecs;
  os: LaptopOSSpecs;
}

export interface PriceInfo {
  mrp: number;
  amazonPrice: number;
  flipkartPrice: number;
}

export interface AffiliateLinks {
  amazon: string;
  flipkart: string;
}

export interface Phone {
  id: string;
  category?: 'phone' | 'laptop';
  brand: string;
  model: string;
  slug: string;
  releaseDate: string;
  images: string[];
  price: PriceInfo;
  affiliateLinks: AffiliateLinks;
  specs: any; // Allow flexible structure (PhoneSpecs | LaptopSpecs)
  mediaSamples?: MediaSamples; // Optional for laptops
  dataCompleteness: DataCompleteness;
  specsScore: number;
  pros: string[];
  cons: string[];
  lastUpdated?: string;
  variantGroupId?: string;
  variantLabel?: string;
}

export type Product = Phone;
