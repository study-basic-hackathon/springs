<script setup>
import { ref } from 'vue'
import Map from './components/Map.vue'
import SearchBar from './components/SearchBar.vue'

const mapRef = ref(null) 
const isModalOpen = ref(false)
const selectedPlace = ref(null)



/*ピンを不選択の場合、モーダルを閉じる*/
function closeModal() {
  isModalOpen.value = false
  selectedPlace.value = null
}

/*ピンを選択した場合、モーダルを開く */
function openModalWith(place) {
  selectedPlace.value = place
  isModalOpen.value = true
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
function onPoiSelected(place) {
  // Map.vue が getDetails 済みの place を渡す
  openModalWith(place)
}
</script>

<template>
<header class="header">
  <h1 class="title">Tabe-Q</h1>
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
    <div class="map-modal" :class="{'is-display' :isModalOpen}" @close="closeModal">
      <div class="modal-shop">
        <div class="inner">
          <figure class="modal-shop-image"><img src="" alt="" id="shop-image"></figure>
          <h2 class="shop-name" id="modal-shop-name">店名</h2>
        </div>
        <div class="close-button" id="close-button"></div>
      </div>
      <div class="post-wrap">
        <div class="inner">
          <ul class="post-list" id="post-list"></ul>
          <form action="/" method="post" class="post-form" name="postForm" @submit.prevent="post">
            <input type="hidden" name="shopId" value="" id="post-shop-id">
            <dl class="form-list">
              <div>
                <dt>待ち時間</dt>
                <dd><input type="number" min="0" step="5" name="waitTime" v-model="waitTime" class="post-form-time" required><span>分</span></dd>
              </div>
              <div>
                <dt>コメント</dt>
                <dd><textarea name="comment" v-model="comment" class="post-form-comment"></textarea></dd>
              </div>
            </dl>
            <input type="submit" class="button" id="post-button" value="送信">
          </form>
        </div>
      </div>
    </div>
  </div>
</main>
</template>

