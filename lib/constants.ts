// ─── App-wide constants ────────────────────────────────────────────────────────

/** 4-digit PIN to unlock the Kitchen/Admin dashboard */
export const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '2518';

/** Base URL for QR code links — update this to your deployed Vercel URL */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://my-quickbite.vercel.app';

/** Tax rate applied to order subtotal */
export const TAX_RATE = 0.10;

/** Service charge rate */
export const SERVICE_CHARGE_RATE = 0.05;

/** Total number of restaurant tables — default 12, configurable via admin or env */
export const TOTAL_TABLES = parseInt(process.env.NEXT_PUBLIC_TOTAL_TABLES ?? '12', 10);

/** Default Restaurant GPS Location (Sudama Bhel Pune) & Geofence */
export const DEFAULT_RESTAURANT_LAT = parseFloat(process.env.NEXT_PUBLIC_RESTAURANT_LAT ?? '18.5204');
export const DEFAULT_RESTAURANT_LNG = parseFloat(process.env.NEXT_PUBLIC_RESTAURANT_LNG ?? '73.8567');
export const DEFAULT_GEOFENCE_RADIUS_METERS = parseInt(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS ?? '200', 10);

