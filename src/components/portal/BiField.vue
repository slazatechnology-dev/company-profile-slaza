<template>
  <!-- Satu teks dua bahasa: ID dan EN berdampingan. EN kosong = website memakai teks ID. -->
  <fieldset class="bi-field">
    <legend class="form-label">{{ label }}</legend>
    <div class="bi-pair">
      <label v-for="lang in LANGS" :key="lang.id" class="bi-input">
        <span class="bi-lang">{{ lang.label }}</span>
        <textarea
          v-if="multiline"
          v-model="field[lang.id]"
          rows="3"
          class="form-textarea"
          :required="lang.id === 'id' && required"
          :placeholder="lang.id === 'en' ? 'Kosong = pakai teks ID' : ''"
        ></textarea>
        <input
          v-else
          v-model="field[lang.id]"
          type="text"
          class="form-input"
          :required="lang.id === 'id' && required"
          :placeholder="lang.id === 'en' ? 'Kosong = pakai teks ID' : ''"
        />
      </label>
    </div>
    <p v-if="warning" class="field-hint warn" role="status">{{ warning }}</p>
    <p v-else-if="hint" class="field-hint">{{ hint }}</p>
  </fieldset>
</template>

<script setup>
// field = objek { id, en } dari konten; diubah langsung (objek reaktif milik editor)
defineProps({
  label: { type: String, required: true },
  field: { type: Object, required: true },
  multiline: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  warning: { type: String, default: '' }
});

const LANGS = [{ id: 'id', label: 'ID' }, { id: 'en', label: 'EN' }];
</script>

<style scoped>
.bi-field {
  border: none;
  padding: 0;
  margin: 0 0 18px;
  min-width: 0;
}

.bi-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.bi-input {
  position: relative;
  display: block;
}

/* Penanda bahasa di pojok kolom, supaya ID dan EN tidak tertukar */
.bi-lang {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  pointer-events: none;
}

.bi-input .form-input,
.bi-input .form-textarea {
  padding-right: 36px;
}

.warn {
  color: #92400e;
}

@media (max-width: 720px) {
  .bi-pair {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
