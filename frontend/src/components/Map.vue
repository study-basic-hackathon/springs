<template>
  <div ref="mapEl" class="map" id="map"></div>
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
let infoWindow = null        // 吹き出し用
const waitingByPlaceId = new Map()  // 取得投稿情報を保持する

// API設定
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY  //Google MapsAPIキー
const API_BASE = import.meta.env.VITE_API_BASE  //バックエンドAPI

//マップ初期処理
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
      // ピン選択以外でモーダルを閉じる
      // （placeId 付きの POI クリックでもモーダルは開かない）
      emit('map-click')
      //吹き出しを閉じる
      if(infoWindow) infoWindow.close()
    })
  )

  // 初期表示として既存投稿がある店舗にピンを立てる
  await loadInitialPinsFromQueue()
}

//ピンを初期化
function clearMarkers() {
  for (const m of markers) m.setMap(null)
  markers = []
}

function addMarkerWithHandler(resultOrDetail, extra = {}) {
  const res = resultOrDetail
  const pos = res.geometry?.location
  if (!pos) return
  const marker = new google.maps.Marker({
    map,
    position: pos,
    title: res.name
  })

  // ピンをクリック → 詳細取得 → 親へ emit（モーダルを開くトリガ）
  const clickListener = google.maps.event.addListener(marker, 'click', async () => {
    const detail = await getPlaceDetails(res.place_id)
    if (detail?.geometry?.location) {
      map.panTo(detail.geometry.location)
      map.setZoom(Math.max(map.getZoom(), 16))
    }
    //吹き出しを表示
    openInfoWindow(marker, { ...(detail ?? {}), ...(extra ?? {}) })
    //モーダルを開く
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

// 初期表示で投稿がある店舗にピン設置
async function loadInitialPinsFromQueue() {
  try {
    const res = await fetch(`${API_BASE}/queue`, { method: 'GET' })
    if (!res.ok) return
    const rows = await res.json()

    // placeId 単位で最新の投稿を採用
    const byPlace = new Map()
    for (const r of rows || []) {
      const pid = r.placeId || r.place_id
      if (!pid) continue
      //最新かみていく
      const cur = byPlace.get(pid)

      const rTime = r?.createdAt ? new Date(r.createdAt).getTime() : -1
      const cTime = cur?.createdAt ? new Date(cur.createdAt).getTime() : -1

      if(!cur || rTime > cTime) {
        byPlace.set(pid, r) 
      }
    }

    for (const [pid, row] of byPlace) {
      const detail = await getPlaceDetails(pid)
      if (!detail?.geometry?.location) continue
      //待ち時間を取得
      const wt = row.waitTime
      if (wt !== undefined && wt !== null) {
        waitingByPlaceId.set(pid, Number(wt))
      }
      const extra = wt !== undefined && wt !== null ? { waitTime: Number(wt) } : {}
      addMarkerWithHandler(detail, extra)
    }
  } catch (_) {
    // 略
  }
}

// 検索し、検索結果にピン立て（App.vue から呼ぶ公開メソッド）
async function searchAndPin(query) {
  if (!query) return { count: 0 }

  // 既存ピンをクリア
  clearMarkers()
  if(infoWindow) infoWindow.close()

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

function ensureInfoWindow() {
  if (!infoWindow) infoWindow = new google.maps.InfoWindow()
}

//ピン選択時に吹き出しを出す
function openInfoWindow(marker, data) {
  const waiting =
    (data?.waitTime !== undefined ? data.waitTime : undefined) ??
    waitingByPlaceId.get(data?.place_id || data?.placeId)

  const name = data?.name ?? '店名'
  const addrRaw = data?.formatted_address ?? ''
  let addr = addrRaw.replace(/^\s*[^,、]+[,、]\s*/, '')
  if (!addr) addr = addrRaw

  const waitingHtml =
    (waiting !== undefined && waiting !== null)
      ? `<span style="
            display:inline-block;
            margin-left:8px;
            padding:2px 8px;
            background:#28a745;
            color:#fff;
            border-radius:9999px;
            font-size:12px;
            font-weight:700;
          ">${Number(waiting)}分待ち</span>`
      : '' // waitTime が無ければ非表示

  const html = `
    <div style="min-width:200px">
      ${waitingHtml}
      <div style="font-size:16px; font-weight:bold; margin:4px 0;">${name}</div>
      <div><strong>${addr}</strong></div>
    </div>`
  ensureInfoWindow()
  infoWindow.setContent(html)
  infoWindow.open({ anchor: marker, map, shouldFocus: false })
}

defineExpose({ searchAndPin })

onMounted(() => { initMap() })

onBeforeUnmount(() => {
  // リスナとピンの片付け
  for (const l of listeners) google.maps.event.removeListener(l)
  clearMarkers()
  if(infoWindow) infoWindow.close()
})
</script>
