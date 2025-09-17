<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import Map from './components/Map.vue'
import SearchBar from './components/SearchBar.vue'
import Modal from './components/Modal.vue'

const API_BASE = import.meta.env.VITE_API_BASE

const mapRef = ref(null) 
const isModalOpen = ref(false)
const selectedPlace = ref(null)
const comments = ref([])               //コメント一覧と読み込み状態
const isLoadingComments = ref(false)

//マップの高さ調整
function adjustmentMapHeight() {
  const app = document.getElementById('app');
  const map = document.getElementById('map');
  const modalHeight = document.getElementById('modal').offsetHeight;
  map.style.height = modalHeight + 'px';
  app.style.height = 'auto';
  app.style.overflow = 'visible';
}

/*ピンを不選択の場合、モーダルを閉じる*/
function closeModal() {
  isModalOpen.value = false
  selectedPlace.value = { name: '', photoUrl: '', placeId: '' }
  comments.value = []
  isLoadingComments.value = false
}

/*ピンを選択した場合、モーダルを開く */
function openModalWith(place) {
  selectedPlace.value = place
  isModalOpen.value = true
}

//日本時間に調整
function toJstString(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

// コメント欄向け
async function loadComments(placeId) {
  if (!placeId) { comments.value = []; return }
  isLoadingComments.value = true
  try {
    const res = await fetch(`${API_BASE}/queue/${encodeURIComponent(placeId)}`, { method: 'GET' })
    if (!res.ok) { comments.value = []; return }
    const rows = await res.json()

    // 配列で返る前提に寄せる（配列でなければ配列化）
    const arr = Array.isArray(rows) ? rows : [rows]

    // comment を必ず文字列化
    comments.value = arr.map(r => {
      const c = r?.comment
      const commentStr =
        typeof c === 'string' ? c :
        c == null ? '' : JSON.stringify(c)
      return {
        time: toJstString(r?.createdAt),
        comment: commentStr,
        waitTime: (r?.waitTime ?? null),
        isActive: r.isActive
      }
    })

    // 新しい順に並べる
    comments.value.sort((a,b) => (b.time || '').localeCompare(a.time || ''))
  } catch {
    comments.value = []
  } finally {
    isLoadingComments.value = false
  }
}

/* 検索バーの入力を受けとり */
async function onSearch(query) {
  // 検索時にモーダルを閉じる
  closeModal()
  // 検索処理を呼び出す
  if (!query?.trim()) return
  await mapRef.value?.searchAndPin(query.trim())
}

/* ピンを選択したときにモーダルを表示*/ 
async function onPoiSelected(place) {
  // Map.vue が getDetails 済みの place を渡す
  openModalWith(place)
  const pid = place?.place_id || place?.placeId
  await loadComments(pid)

  // マップサイズに調整
  adjustmentMapHeight();
}
</script>

<template>
<header class="header" id="header">
  <div class="title"><img src="@/assets/tabe-q.jpg" alt="Tabe-Q"></div>
  <!-- 検索バー -->
  <SearchBar @search="onSearch" />
</header>
<main>
  <div class="map-wrap">
    <!--マップ用表示-->
    <Map
      ref="mapRef"
      @poi-selected="onPoiSelected"
      @map-click="closeModal"
    />

    <!-- モーダル表示 -->
    <Modal 
      :visible="isModalOpen" 
      :place="selectedPlace" 
      :comments="comments"
      :loading="isLoadingComments"
      :load-comments="loadComments"
      @close="closeModal" 
    />
  </div>
</main>
</template>

