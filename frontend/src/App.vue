<script lang="ts">
import { defineComponent } from 'vue';
import { getShopInfo } from './utils/posts';

export default defineComponent({
  name: "App",
  data() {
    return {
      waitTime: "",
      comment: ""
    };
  },
  methods: {
    // 投稿の登録
    post(){
      const postShopId = document.getElementsByName('shopId')[0] as HTMLInputElement;
      fetch("https://tabe-q.up.railway.app/queue", {
        method: "POST",                       // POSTリクエスト
        headers: {
          "Content-Type": "application/json"  // JSONを送ることを指定
        },
        
        body: JSON.stringify({ placeId: postShopId.value, waitTime: this.waitTime, comment: this.comment }) // 送信するデータ
      })
      .then(response => response.json())
      .then(data => {
        alert('投稿しました！');
        this.waitTime = "";
        this.comment = "";
        getShopInfo(postShopId.value)
      })
      .catch(error => {
        console.error("エラー:", error);
      });
    }
  }
});
</script>
<template>
<header class="header">
  <h1 class="title">Tabe-Q</h1>
  <form action="" method="" class="search-form">
    <input type="text" name="" class="input" id="text-input">
    <input type="button" value="検索" class="button" id="text-input-button">
  </form>
</header>
<main>
  <div class="map-wrap">
    <!--マップ用(後でこのコメントは消す)-->
    <div id="map" class="map"></div>

    <div class="map-modal" id="map-modal">
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
