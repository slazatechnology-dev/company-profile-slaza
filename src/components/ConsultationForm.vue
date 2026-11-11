<template>
  <div class="editorial-card form-card">
    <h3 class="form-title">{{ form.title }}</h3>

    <!-- No backend: submit hands the composed message to WhatsApp -->
    <form class="consultation-form" @submit.prevent="openWhatsApp">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="client-name">
            {{ form.nameLabel }} <span aria-hidden="true">*</span>
          </label>
          <input
            id="client-name"
            v-model="formData.name"
            type="text"
            class="form-input"
            :placeholder="form.namePlaceholder"
            autocomplete="name"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="client-email">
            {{ form.emailLabel }} <span aria-hidden="true">*</span>
          </label>
          <input
            id="client-email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :placeholder="form.emailPlaceholder"
            autocomplete="email"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="client-phone">{{ form.phoneLabel }}</label>
          <input
            id="client-phone"
            v-model="formData.phone"
            type="tel"
            class="form-input"
            :placeholder="form.phonePlaceholder"
            autocomplete="tel"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="client-service">{{ form.serviceLabel }}</label>
          <select
            id="client-service"
            v-model="formData.service"
            class="form-select"
          >
            <option v-for="(srv, idx) in form.services" :key="idx" :value="idx">
              {{ srv }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="client-message">
          {{ form.messageLabel }} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="client-message"
          v-model="formData.message"
          class="form-textarea"
          :placeholder="form.messagePlaceholder"
          rows="4"
          required
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary form-submit-btn">
        {{ form.submitBtn }}
      </button>
      <p class="form-note">{{ form.note }}</p>

      <!-- Always in the DOM so screen readers announce the text when it appears -->
      <p class="form-status" role="status">
        <template v-if="opened">
          {{ form.sentMsg }}
          <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer">{{ form.sentFallback }}</a>
        </template>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, waUrl } = useI18n();
const form = computed(() => t.value.contact.form);

const opened = ref(false);

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  service: 0,
  message: ''
});

const whatsappUrl = computed(() => {
  const text = [
    form.value.waIntro,
    '',
    `${form.value.nameLabel}: ${formData.name}`,
    `${form.value.emailLabel}: ${formData.email}`,
    ...(formData.phone ? [`${form.value.phoneLabel}: ${formData.phone}`] : []),
    `${form.value.serviceLabel}: ${form.value.services[formData.service]}`,
    '',
    formData.message
  ].join('\n');
  return `${waUrl.value}?text=${encodeURIComponent(text)}`;
});

const openWhatsApp = () => {
  window.open(whatsappUrl.value, '_blank', 'noopener');
  opened.value = true;
};
</script>

<style scoped>
.form-card {
  padding: 40px;
  background-color: #ffffff;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 28px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-submit-btn {
  width: 100%;
  margin-top: 8px;
}

.form-note {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.form-status {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-status:not(:empty) {
  margin-top: 16px;
}

.form-status a {
  color: var(--accent-primary);
}

@media (max-width: 768px) {
  .form-card {
    padding: 28px 20px;
  }
  .form-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
