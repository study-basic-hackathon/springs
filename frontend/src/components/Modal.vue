<template>
  <!-- visible のときだけ is-display を付与 -->
  <div class="map-modal" :class="{ 'is-display': visible }">
    <div class="modal-shop">
      <div class="inner">
        <figure class="shop-image">
          <img :src="photoUrl" alt="" />
        </figure>
        <h2 class="shop-name">{{ place?.name || '店名' }}</h2>
      </div>
    </div>

    <div class="post-wrap">
      <div class="inner">
        <!-- コメント一覧 -->
        <div v-if="loading" class="loading">読み込み中...</div>
        <template v-else>
          <ul v-if="comments && comments.length > 0" class="post-list">
            <li v-for="(c, i) in comments" :key="i">
              <span class="time">{{ c.time }}</span>
              <p class="comment">{{ c.comment }}</p>
            </li>
          </ul>
          <p v-else class="empty">まだ投稿はありません</p>
        </template>

        <form action="" method="post" class="post-form">
            <dl class="form-list">
              <div>
                <dt>待ち時間</dt>
                <dd><input type="number" min="0" step="5" name="waitingTime" class="post-form-time"><span>分</span></dd>
              </div>
              <div>
                <dt>コメント</dt>
                <dd><textarea name="comment" class="post-form-comment"></textarea></dd>
              </div>
            </dl>
            <input type="submit" class="button" value="送信">
          </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  place: { type: Object, default: null },
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['submit'])

const photoUrl = computed(() => {
  const p = props.place
  return (
    p?.photos?.[0]?.getUrl?.({ maxWidth: 600, maxHeight: 400 }) ??
    p?.photoUrl ??
    ''
  )
})

</script>
<style scoped>
/* 追加：状態表示のスタイル */
.loading { color: #555; margin-bottom: 12px; }
.empty   { color: #777; margin: 8px 0 16px; }
</style>
