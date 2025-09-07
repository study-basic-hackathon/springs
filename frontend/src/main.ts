// Initialize and add the map
let map;
async function initMap(): Promise<void> {
  // 東京駅の緯度経度
  const position = { lat: 35.68114, lng: 139.767061 };

  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

  // 東京駅のマップ
  map = new Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 16,
      center: position,
      mapId: 'springs_map',
    }
  );
}

initMap();