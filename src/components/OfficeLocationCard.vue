<template>
  <div class="editorial-card location-card">
    <h3 class="location-title">{{ office.title }}</h3>

    <div class="location-info-list">
      <div class="info-block">
        <div class="info-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="info-text">
          <div class="info-label">{{ office.addressLabel }}</div>
          <div class="info-val">{{ office.address }}</div>
        </div>
      </div>

      <div class="info-block">
        <div class="info-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <div class="info-text">
          <div class="info-label">{{ office.emailLabel }}</div>
          <a class="info-val info-link" :href="`mailto:${office.email}`">{{ office.email }}</a>
        </div>
      </div>

      <div class="info-block">
        <div class="info-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <div class="info-text">
          <div class="info-label">{{ office.phoneLabel }}</div>
          <a
            class="info-val info-link"
            :href="waUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${office.phone} (${t.common.newTab})`"
          >{{ office.phone }}</a>
        </div>
      </div>

      <div class="info-block">
        <div class="info-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="info-text">
          <div class="info-label">{{ office.hoursLabel }}</div>
          <div class="info-val">{{ office.hours }}</div>
        </div>
      </div>
    </div>

    <div class="location-note">
      <div class="note-title">{{ office.areaTitle }}</div>
      <p class="note-desc">{{ office.areaDesc }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, waUrl } = useI18n();
const office = computed(() => t.value.contact.office);
</script>

<style scoped>
.location-card {
  padding: 40px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.location-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 28px;
}

.location-info-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.info-block {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: #ffffff;
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.info-val {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.5;
}

/* Padding widens the tap area to 44px; the negative margin keeps the row spacing */
.info-link {
  display: inline-block;
  padding: 11px 0;
  margin: -11px 0;
  color: var(--accent-primary);
}

.info-link:hover {
  color: var(--accent-primary-hover);
}

.location-note {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--card-border);
}

.note-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.note-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .location-card {
    padding: 28px 20px;
  }
}
</style>
