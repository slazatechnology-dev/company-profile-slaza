<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <Logo />
          <p class="footer-desc">
            {{ t.footer.desc }}
          </p>
        </div>

        <div class="footer-nav-col">
          <h4 class="footer-col-title">{{ t.footer.quickLinks }}</h4>
          <ul class="footer-links">
            <li v-for="id in sections" :key="id"><a :href="`#${id}`">{{ t.nav[id] }}</a></li>
          </ul>
        </div>

        <div class="footer-nav-col">
          <h4 class="footer-col-title">{{ t.nav.contact }}</h4>
          <ul class="footer-links">
            <li><a :href="`mailto:${office.email}`">{{ office.email }}</a></li>
            <li>
              <a
                :href="waUrl"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`${office.phone} (${t.common.newTab})`"
              >{{ office.phone }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          © {{ currentYear }} PT. Slaza Technology Mandiri. {{ t.footer.rights }}
        </div>
        <div class="footer-location">
          Jakarta, Indonesia
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import Logo from './Logo.vue';
import { useI18n } from '../composables/useI18n';
import { sections } from '../data/translations';

const { t, waUrl } = useI18n();
const office = computed(() => t.value.contact.office);
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer-section {
  background-color: #090d16;
  color: #f8fafc;
  padding: 80px 0 36px;
  position: relative;
}

.footer-top {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1.2fr;
  gap: 48px;
  margin-bottom: 64px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

:deep(.footer-brand .company-name) {
  color: #ffffff;
}

:deep(.footer-brand .company-sub) {
  color: #94a3b8;
}

.footer-desc {
  font-size: 0.92rem;
  line-height: 1.65;
  color: #94a3b8;
  max-width: 340px;
  margin-top: 18px;
}

.footer-col-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.footer-links {
  list-style: none;
}

/* 12px block padding makes each link a 44px tap target */
.footer-links a {
  display: inline-block;
  padding: 12px 0;
  font-size: 0.9rem;
  line-height: 20px;
  color: #94a3b8;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: #ffffff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  color: #94a3b8;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-location {
  font-size: 0.82rem;
  font-weight: 500;
}

@media (max-width: 960px) {
  .footer-top {
    grid-template-columns: repeat(2, 1fr);
    gap: 36px;
  }
}

@media (max-width: 600px) {
  .footer-top {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
