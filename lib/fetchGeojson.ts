// utils/fetchGeoJSON.ts

export const fetchGeoJSON = async (filePath: string) => {
    console.log('Fetching GeoJSON from:', filePath); // For debugging
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  };
  