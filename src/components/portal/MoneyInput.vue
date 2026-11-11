<template>
  <!-- Input rupiah dengan pemisah ribuan titik (1.500.000). Nilai v-model tetap angka biasa (1500000).
       type="text" karena input number tidak bisa menampilkan titik; batas min/max diperiksa lewat setCustomValidity. -->
  <input
    ref="el"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :value="format(model)"
    @input="onInput"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const model = defineModel({ type: Number, default: null });
const props = defineProps({
  min: { type: Number, default: null },
  max: { type: Number, default: null }
});

const el = ref(null);
const format = (n) => (n === null || n === undefined || n === '' ? '' : new Intl.NumberFormat('id-ID').format(n));

const onInput = (event) => {
  const input = event.target;
  // Posisi kursor dihitung dari kanan, supaya tidak loncat saat titik bertambah/berkurang
  const fromEnd = input.value.length - input.selectionStart;
  const digits = input.value.replace(/\D/g, '');
  model.value = digits ? Number(digits) : null;
  input.value = format(model.value);
  const pos = Math.max(0, input.value.length - fromEnd);
  input.setSelectionRange(pos, pos);
};

const validate = () => {
  const n = model.value;
  let message = '';
  if (n !== null && props.min !== null && n < props.min) message = `Minimal Rp ${format(props.min)}`;
  if (n !== null && props.max !== null && n > props.max) message = `Maksimal Rp ${format(props.max)}`;
  el.value?.setCustomValidity(message);
};

watch([model, () => props.min, () => props.max], validate);
onMounted(validate);
</script>
