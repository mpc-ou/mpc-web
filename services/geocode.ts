const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  osmType: string;
  address: Record<string, string>;
};

export async function searchLocations(query: string, limit = 5): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: String(limit),
    addressdetails: "1",
    "accept-language": "vi,en"
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: {
      "User-Agent": "MPC-Web-Admin/1.0"
    }
  });

  if (!res.ok) {
    throw new Error(`Nominatim search failed: ${res.status}`);
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    osm_type: string;
    address: Record<string, string>;
  }>;

  return data.map((item) => ({
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    displayName: item.display_name,
    osmType: item.osm_type,
    address: item.address
  }));
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    "accept-language": "vi"
  });

  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: {
      "User-Agent": "MPC-Web-Admin/1.0"
    }
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? null;
}
