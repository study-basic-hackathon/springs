<template>
  <form class="search-form" @submit.prevent="emitSearch">
    <input
      v-model="query"
      type="text"
      placeholder="お店を検索（例：東京駅 ラーメン）"
      class="input"
    />
    <button class="button" type="submit">検索</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const query = ref('')
const emit = defineEmits(['search'])

function emitSearch() {
  emit('search', query.value)
}

</script>