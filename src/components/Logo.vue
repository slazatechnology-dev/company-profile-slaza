<template>
  <div class="brand-logo" :class="{ 'compact': compact }">
    <div class="logo-symbol">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#09090b" />
        <path d="M26 13H17C14.79 13 13 14.79 13 17C13 19.21 14.79 21 17 21H23C25.21 21 27 22.79 27 25C27 27.21 25.21 29 23 29H14" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="27" cy="13" r="2" fill="#1d4ed8" />
        <circle cx="13" cy="29" r="2" fill="#1d4ed8" />
      </svg>
    </div>
    <div class="logo-text" v-if="!symbolOnly">
      <div class="company-name">SLAZA</div>
      <div class="company-sub">TECHNOLOGY MANDIRI</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  symbolOnly: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  user-select: none;
}

.logo-symbol {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.brand-logo:hover .logo-symbol {
  transform: scale(1.04);
}

.logo-symbol svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-family: var(--font-sans);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  line-height: 1;
}

.company-sub {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-top: 3px;
}

.compact .company-name {
  font-size: 1rem;
}

.compact .company-sub {
  font-size: 0.55rem;
}
</style>
