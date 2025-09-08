<template>
<header class="header">
  <h1 class="title">Tabe-Q</h1>
  <form action="" method="" class="search-form">
    <input type="text" name="" class="input">
    <input type="submit" value="検索" class="button">
  </form>
</header>
<main>
  <div class="map-wrap">
    <!--マップ用(後でこのコメントは消す)-->
    <div id="map" class="map"></div>

    <div class="map-modal is-display">
      <div class="modal-shop">
        <div class="inner">
          <figure class="shop-image"><img src="" alt=""></figure>
          <h2 class="shop-name">店名</h2>
        </div>
      </div>
      <div class="post-wrap">
        <div class="inner">
          <ul class="post-list">
            <li>
              <span class="time">2025/09/05 12:00</span>
              <p class="comment">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
            </li>
            <li>
              <span class="time">2025/09/05 12:00</span>
              <p class="comment">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
            </li>
            <li>
              <span class="time">2025/09/05 12:00</span>
              <p class="comment">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
            </li>
            <li>
              <span class="time">2025/09/05 12:00</span>
              <p class="comment">テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
            </li>
          </ul>

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
  </div>
</main>
</template>
