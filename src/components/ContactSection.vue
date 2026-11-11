<template>
  <section class="section-wrapper contact-section" id="contact">
    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <h2 class="section-title">{{ t.contact.title }}</h2>
        <p class="section-subtitle">
          {{ t.contact.subtitle }}
        </p>
      </div>

      <div class="contact-grid">
        <!-- Interactive Consultation Form Subcomponent -->
        <ConsultationForm />

        <!-- Office & Location Info Card Subcomponent -->
        <OfficeLocationCard />
      </div>
    </div>
  </section>
</template>

<script setup>
import ConsultationForm from './ConsultationForm.vue';
import OfficeLocationCard from './OfficeLocationCard.vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped>
.contact-section {
  position: relative;
}

.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
  align-items: start;
  gap: 36px;
}

@media (max-width: 960px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
}
</style>
