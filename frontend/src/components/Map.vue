<template>
  <div ref="mapEl" class="map"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, defineExpose } from 'vue'

const emit = defineEmits(['poi-selected', 'map-click', 'search-pins'])

const mapEl = ref(null)
let map = null
let placesService = null     // textSearch / getDetails に利用
let detailService = null
let markers = []             // 検索で立てたピンを管理
let listeners = []           // 片付け用

// API設定
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gmap="yes"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=quarterly`
    s.async = true
    s.defer = true
    s.setAttribute('data-gmap', 'yes')
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function initMap() {
  await loadGoogleMaps()
  map = new google.maps.Map(mapEl.value, {
    center: { lat: 35.681236, lng: 139.767125 }, // 東京駅
    zoom: 14,
    clickableIcons: true
  })
  placesService = new google.maps.places.PlacesService(map)
  detailService = new google.maps.places.PlacesService(map)

  // 地図素地クリック → モーダル閉じる
  listeners.push(
    google.maps.event.addListener(map, 'click', (e) => {
      // 今回の仕様：ピン選択以外ではモーダルを閉じる
      // （placeId 付きの POI クリックでもモーダルは開かない）
      emit('map-click')
    })
  )
}

function clearMarkers() {
  for (const m of markers) m.setMap(null)
  markers = []
}

function addMarkerWithHandler(result) {
  // result: Places TextSearchResult（place_id, geometry.location, name など）
  const pos = result.geometry?.location
  if (!pos) return
  const marker = new google.maps.Marker({
    map,
    position: pos,
    title: result.name
  })

  // ピンをクリック → 詳細取得 → 親へ emit（モーダルを開くトリガ）
  const clickListener = google.maps.event.addListener(marker, 'click', async () => {
    const detail = await getPlaceDetails(result.place_id)
    if (detail?.geometry?.location) {
      map.panTo(detail.geometry.location)
      map.setZoom(Math.max(map.getZoom(), 16))
    }
    if (detail) emit('poi-selected', detail)
  })

  markers.push(marker)
  listeners.push(clickListener)
}

function getPlaceDetails(placeId) {
  return new Promise((resolve) => {
    detailService.getDetails(
      {
        placeId,
        fields: [
          'place_id','name','formatted_address','formatted_phone_number',
          'geometry','rating','user_ratings_total','website','photos'
        ]
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place)
        } else {
          resolve(null)
        }
      }
    )
  })
}

// 検索し、検索結果にピン立て（App.vue から呼ぶ公開メソッド）
async function searchAndPin(query) {
  if (!query) return { count: 0 }

  // 既存ピンをクリア
  clearMarkers()

  return new Promise((resolve) => {
    // Text Search で複数ヒットを取得
    placesService.textSearch(
      { query },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
          emit('search-pins', { count: 0 })
          resolve({ count: 0 })
          return
        }

        // 全件にピンを立てる
        const bounds = new google.maps.LatLngBounds()
        for (const r of results) {
          if (r.geometry?.location) bounds.extend(r.geometry.location)
          addMarkerWithHandler(r)
        }

        // 地図表示を調整
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds)
          // ズームが寄りすぎるときだけ調整（任意）
          google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom() > 17) map.setZoom(17)
          })
        }

        emit('search-pins', { count: results.length })
        resolve({ count: results.length })
      }
    )
  })
}

defineExpose({ searchAndPin })

onMounted(() => { initMap() })
onBeforeUnmount(() => {
  // リスナとピンの片付け
  for (const l of listeners) google.maps.event.removeListener(l)
  clearMarkers()
})
</script>
