<template>
  <!-- Satu frasa di judul diberi warna aksen: ciri khas judul di seluruh beranda (lihat DESIGN.md) -->
  <template v-if="index >= 0">{{ text.slice(0, index) }}<span class="accent-text">{{ accent }}</span>{{ text.slice(index + accent.length) }}</template>
  <template v-else>{{ text }}</template>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: { type: String, required: true },
  accent: { type: String, default: '' }
});

// Frasa tidak ditemukan (misalnya terjemahan berubah): judul tetap tampil utuh tanpa aksen
const index = computed(() => (props.accent ? props.text.indexOf(props.accent) : -1));
</script>
