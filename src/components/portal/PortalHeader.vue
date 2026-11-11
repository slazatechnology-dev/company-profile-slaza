<template>
  <header class="portal-header-bar">
    <div class="container header-inner">
      <div class="brand">
        <p class="company">PT. Slaza Technology Mandiri</p>
        <h1 class="portal-title">Portal Proyek, Pajak & LKPM</h1>
      </div>

      <div class="header-actions">
        <p v-if="userEmail" class="user-email">{{ userEmail }}</p>
        <button v-if="userEmail" type="button" class="btn btn-outline-light btn-sm" @click="$emit('signOut')">
          Keluar
        </button>
        <button type="button" class="btn btn-outline-light btn-sm" @click="$emit('exitPortal')">
          Kembali ke website
        </button>
      </div>

      <nav v-if="showTabs" class="portal-nav" aria-label="Menu portal">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="portal-tab-btn"
          :class="{ active: activeTab === tab.id }"
          :aria-current="activeTab === tab.id ? 'page' : undefined"
          @click="$emit('update:activeTab', tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTab: { type: String, default: 'dashboard' },
  userEmail: { type: String, default: '' },
  showTabs: { type: Boolean, default: false }
});

defineEmits(['update:activeTab', 'exitPortal', 'signOut']);

const tabs = [
  { id: 'dashboard', label: 'Ringkasan' },
  { id: 'projects', label: 'Proyek & termin' },
  { id: 'clients', label: 'Klien' },
  { id: 'taxes', label: 'Pajak PPh 0,5%' },
  { id: 'lkpm', label: 'LKPM' },
  { id: 'expenses', label: 'Pengeluaran' },
  { id: 'company', label: 'Data PT' }
];
</script>

<style scoped>
/* Satu-satunya permukaan gelap di portal: penanda bahwa ini area internal, bukan website publik */
.portal-header-bar {
  background: var(--bg-dark);
  padding: 16px 0 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.company {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.portal-title {
  font-size: 1.15rem;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand,
.header-actions {
  padding-bottom: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.user-email {
  font-size: 0.85rem;
  color: #cbd5e1;
  overflow-wrap: anywhere;
}

.portal-nav {
  order: 3;
  width: 100%;
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.portal-tab-btn {
  min-height: 44px;
  padding: 0 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #cbd5e1;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.portal-tab-btn:hover {
  color: #ffffff;
}

/* Tab aktif ditandai garis bawah cobalt terang: aksen hanya di posisi "di mana saya sekarang" */
.portal-tab-btn.active {
  color: #ffffff;
  border-bottom-color: #60a5fa;
}

.portal-tab-btn:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: -2px;
}

.btn-outline-light {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-outline-light:focus-visible {
  outline-color: #60a5fa;
}
</style>
