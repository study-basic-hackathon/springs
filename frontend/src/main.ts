//インポート
import { createApp } from "vue";
import App from "./App.vue";
import { getShopInfo } from "./utils/posts";

// appに入れる
const app = createApp(App);
app.mount('#app');


//Mapの仮置き(後で削除する)
// Initialize and add the map
// let map;
const mapModal = document.getElementById('map-modal') as HTMLElement;
const closeBtn = document.getElementById('close-button') as HTMLElement;
closeBtn.addEventListener('click', ()=>{
 mapModal.classList.remove('is-display');
});

let map;
let markers = {};
let infoWindow;

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

    const center = { lat: 37.4161493, lng: -122.0812166 };
    map = new Map(document.getElementById('map') as HTMLElement, {
        center: center,
        zoom: 11,
        mapTypeControl: false,
        mapId: '',
    });

    const textInput = document.getElementById('text-input') as HTMLInputElement;
    const textInputButton = document.getElementById('text-input-button') as HTMLButtonElement;

    textInputButton.addEventListener('click', () => {
        findPlaces(textInput.value);
    });

    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            findPlaces(textInput.value);
        }
    });

    infoWindow = new google.maps.InfoWindow();
}

async function findPlaces(query) {
    const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
    const request = {
        textQuery: query,
        fields: ['displayName', 'location', 'businessStatus','photos'],
        includedType: '', // Restrict query to a specific type (leave blank for any).
        useStrictTypeFiltering: true,
        locationBias: map.center,
        isOpenNow: true,
        language: 'en-US',
        maxResultCount: 8,
        minRating: 1, // Specify a minimum rating.
        region: 'us',
    };

    const { places } = await Place.searchByText(request);

    if (places.length) {
        const { LatLngBounds } = await google.maps.importLibrary("core") as google.maps.CoreLibrary;
        const bounds = new LatLngBounds();

        // First remove all existing markers.
        for (const id in markers) {
            markers[id].map = null;
        };
        markers = {};

        // Loop through and get all the results.
        places.forEach(place => {
            const marker = new AdvancedMarkerElement({
                map,
                position: place.location,
                title: place.displayName,
            });
            markers[place.id] = marker;

            marker.addListener('gmp-click', () => {
                map.panTo(place.location);
                updateInfoWindow(place.displayName, place.id, marker);
                //モーダルの表示
                mapModal.classList.add('is-display');
                //店名の表示
                let modalShopName = document.getElementById('modal-shop-name') as HTMLElement;
                modalShopName.textContent = place.displayName ?? '不明';
                //画像の表示
                let modalShopImg = document.getElementById('shop-image') as HTMLImageElement;
                if (place.photos && place.photos.length > 0) {
                    const apiKey = "";
                    const photoUrl = getPhotoUrl(place.photos[0].name, apiKey);
                    modalShopImg.src = photoUrl;
                } else{
                    let imgParent = modalShopImg.closest('.modal-shop-image') as HTMLElement;
                    imgParent.style.display = 'none';
                }
                const shopId = document.getElementById('post-shop-id') as HTMLInputElement;
                shopId.value = place.id;

                //投稿の取得
                getShopInfo(place.id);
            });

            if (place.location != null) {
                bounds.extend(place.location);
            }
        });

        map.fitBounds(bounds);

    } else {
        console.log('No results');
    }
}

// Helper function to create an info window.
async function updateInfoWindow(title, content, anchor) {
    infoWindow.setContent(content);
    infoWindow.setHeaderContent(title);
    infoWindow.open({
        map,
        anchor,
        shouldFocus: false,
    });
}

// 画像のURLの取得
function getPhotoUrl(photoName: string, apiKey: string): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;
}

initMap();
