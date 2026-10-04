import { Region } from '../types';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export const LEBANON_REGION_COORDINATES: Record<Region, LocationCoords> = {
  all: { lat: 33.8547, lng: 35.8623 },
  beirut: { lat: 33.8938, lng: 35.5018 },
  keserwan: { lat: 34.0089, lng: 35.8362 }, // Faraya / Faqra
  jbeil: { lat: 34.1230, lng: 35.6519 }, // Byblos
  batroun: { lat: 34.2558, lng: 35.6583 }, // Batroun
  ehden_cedars: { lat: 34.2989, lng: 35.9814 }, // Ehden / Bcharre / Cedars
  tripoli_akkar: { lat: 34.4367, lng: 35.8497 }, // Tripoli
  matn: { lat: 33.8828, lng: 35.6178 }, // Broummana / Beit Mery
  chouf_aley: { lat: 33.6961, lng: 35.5806 }, // Deir el Qamar / Chouf
  tyre_south: { lat: 33.2705, lng: 35.2038 }, // Tyre (Sour)
  sidon_jezzine: { lat: 33.5417, lng: 35.5847 }, // Jezzine / Saida
  zahle_bekaa: { lat: 33.8463, lng: 35.9020 }, // Zahle
  baalbek_hermel: { lat: 34.0058, lng: 36.2081 }, // Baalbek
  west_bekaa_rashaya: { lat: 33.5019, lng: 35.8428 }, // Rashaya / Qaraoun
};

/**
 * Resolves the best geographic coordinates for a given listing.
 * Includes deterministic slight offset if using fallback region coords to avoid overlapping pins.
 */
export function getListingCoordinates(
  listingCoordinates?: { lat: number; lng: number },
  region?: Region,
  cityName?: string,
  listingId?: string
): LocationCoords {
  if (listingCoordinates && listingCoordinates.lat && listingCoordinates.lng) {
    return listingCoordinates;
  }

  const base = (region && LEBANON_REGION_COORDINATES[region]) || LEBANON_REGION_COORDINATES.all;

  if (listingId) {
    let hash = 0;
    for (let i = 0; i < listingId.length; i++) {
      hash = (hash << 5) - hash + listingId.charCodeAt(i);
      hash |= 0;
    }
    const offsetLat = ((Math.abs(hash) % 20) - 10) * 0.0022;
    const offsetLng = ((Math.abs(hash >> 3) % 20) - 10) * 0.0022;
    return {
      lat: base.lat + offsetLat,
      lng: base.lng + offsetLng,
    };
  }

  return base;
}
