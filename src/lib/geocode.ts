/**
 * Geocode an address using Nominatim (OpenStreetMap) free API.
 * Returns { latitude, longitude } or null if not found.
 * Rate limit: 1 request/second (we only call on profile save).
 */
export async function geocodeAddress(
  address: string,
  city: string,
  postalCode?: string | null
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Build a search query focused on French Polynesia
    const parts = [address, city, postalCode, "Polynésie française"].filter(
      Boolean
    );
    const query = parts.join(", ");

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "pf"); // French Polynesia

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "BookEasy/1.0 (contact@bookeasy.pf)",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }

    // Fallback: try with just the city name in French Polynesia
    if (city) {
      const fallbackUrl = new URL("https://nominatim.openstreetmap.org/search");
      fallbackUrl.searchParams.set("q", `${city}, Polynésie française`);
      fallbackUrl.searchParams.set("format", "json");
      fallbackUrl.searchParams.set("limit", "1");

      const fallbackRes = await fetch(fallbackUrl.toString(), {
        headers: {
          "User-Agent": "BookEasy/1.0 (contact@bookeasy.pf)",
        },
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.length > 0) {
          return {
            latitude: parseFloat(fallbackData[0].lat),
            longitude: parseFloat(fallbackData[0].lon),
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
