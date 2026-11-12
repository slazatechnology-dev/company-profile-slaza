<template>
  <div class="projects-view">
    <div class="view-head">
      <h2 class="panel-title">Kontrak</h2>
      <div class="head-actions">
        <button v-if="store.contracts.some(c => c.addenda.length)" type="button" class="btn btn-secondary btn-sm" @click="openAddendaInvoice(null)">
          Buat invoice tambahan
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="openForm('contract', null)">Tambah kontrak</button>
      </div>
    </div>

    <div v-if="!store.contracts.length" class="panel">
      <div class="empty-state">
        <strong>Belum ada kontrak.</strong>
        Tambahkan kontrak dengan tombol Tambah kontrak. Klien untuk kontrak dibuat di menu Klien.
      </div>
    </div>

    <section v-for="contract in store.contracts" :key="contract.id" class="panel contract" :aria-labelledby="`c-${contract.id}`">
      <div class="panel-head">
        <div>
          <p class="muted small">{{ PROJECT_TYPE[contract.projectType] || 'Proyek' }}</p>
          <h3 :id="`c-${contract.id}`" class="contract-title">{{ contract.projectTitle }}</h3>
          <p class="contract-meta">
            Klien: <strong>{{ getClient(contract.clientId).companyName || '-' }}</strong>
            <span class="sep" aria-hidden="true">·</span>
            Nilai kontrak: <strong>{{ formatRupiah(contract.totalValue) }}</strong>
            <span v-if="contract.addenda.length" class="muted">
              (awal {{ formatRupiah(contract.totalContractValue) }} + tambahan {{ formatRupiah(contract.totalValue - contract.totalContractValue) }})
            </span>
          </p>
        </div>
        <div class="head-actions">
          <span class="tag">{{ CONTRACT_STATUS[contract.status] || contract.status }}</span>
          <button type="button" class="btn btn-secondary btn-sm" :aria-label="`Ubah kontrak ${contract.projectTitle}`" @click="openForm('contract', contract)">
            Ubah kontrak
          </button>
        </div>
      </div>

      <!-- Laba basis kas: biaya dari menu Pengeluaran yang ditautkan ke kontrak ini -->
      <dl class="profit">
        <div>
          <dt>Sudah diterima</dt>
          <dd>{{ formatRupiah(store.projectProfit(contract.id).received) }}</dd>
        </div>
        <div>
          <dt>PPh Final 0,5%</dt>
          <dd>{{ formatRupiah(store.projectProfit(contract.id).tax) }}</dd>
        </div>
        <div>
          <dt>Tagihan belum dibayar</dt>
          <dd :class="{ 'text-wait': store.projectUnpaid(contract.id) > 0 }">{{ formatRupiah(store.projectUnpaid(contract.id)) }}</dd>
        </div>
        <div>
          <dt>Biaya proyek</dt>
          <dd>{{ formatRupiah(store.projectProfit(contract.id).cost) }}</dd>
        </div>
        <div>
          <dt>Laba sejauh ini</dt>
          <dd :class="{ 'text-block': store.projectProfit(contract.id).profit < 0 }">{{ formatRupiah(store.projectProfit(contract.id).profit) }}</dd>
        </div>
        <div>
          <dt>Perkiraan laba bila lunas</dt>
          <dd :class="{ 'text-block': store.projectProfit(contract.id).projected < 0 }">{{ formatRupiah(store.projectProfit(contract.id).projected) }}</dd>
        </div>
      </dl>

      <!-- Tab per kontrak: termin, tambahan nilai, dan tagihan rutin tidak tampil sekaligus -->
      <nav class="card-tabs" :aria-label="`Bagian kontrak ${contract.projectTitle}`">
        <button
          v-for="tab in cardTabs(contract)"
          :key="tab.id"
          type="button"
          class="card-tab"
          :class="{ active: tabOf(contract.id) === tab.id }"
          :aria-current="tabOf(contract.id) === tab.id ? 'true' : undefined"
          @click="cardTab[contract.id] = tab.id"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <!-- Termin kontrak awal di tab Termin; tiap tambahan kontrak beserta termin-nya sendiri di tab Tambahan -->
      <div v-if="tabOf(contract.id) !== 'plans'">
        <div v-if="tabOf(contract.id) === 'addenda'" class="sub-head addenda-bar">
          <p v-if="contract.addenda.length" class="muted small">
            Total tambahan {{ formatRupiah(contract.totalValue - contract.totalContractValue) }} · Sisa belum diinvoice
            <strong>{{ formatRupiah(addendaUninvoiced(contract)) }}</strong>
          </p>
          <div class="head-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="openAddendum(contract, null)">Tambah nilai kontrak</button>
            <button v-if="contract.addenda.length" type="button" class="btn btn-primary btn-sm" @click="openAddendaInvoice(contract)">Buat invoice</button>
          </div>
        </div>

        <!-- Tambahan dipisah: yang masih ada tagihan/sisa vs yang sudah lunas semua -->
        <div v-if="tabOf(contract.id) === 'addenda' && contract.addenda.length" class="seg" role="group" :aria-label="`Saring tambahan ${contract.projectTitle}`">
          <button
            v-for="v in ADDENDA_VIEWS"
            :key="v.id"
            type="button"
            class="seg-btn"
            :class="{ active: addendaViewOf(contract.id) === v.id }"
            :aria-pressed="addendaViewOf(contract.id) === v.id"
            @click="addendaView[contract.id] = v.id"
          >
            {{ v.label }} <span class="tab-count">{{ contract.addenda.filter(a => addendumPaid(contract, a) === (v.id === 'paid')).length }}</span>
          </button>
        </div>

        <div v-for="group in milestoneGroups(contract)" :key="group.key" class="ms-group">
          <div v-if="group.addendum" class="addendum-head">
            <div>
              <p class="ms-title">+ {{ formatRupiah(group.addendum.value) }} · {{ group.addendum.title }}</p>
              <p class="muted small">
                Disepakati {{ formatDate(group.addendum.date) }} · Sisa belum diinvoice {{ formatRupiah(store.uninvoicedValue(contract.id, group.addendum.id)) }}
              </p>
              <p v-if="group.addendum.description" class="addendum-desc">{{ group.addendum.description }}</p>
            </div>
            <span v-if="addendumPaid(contract, group.addendum)" class="tag ok">Lunas</span>
          </div>
          <div v-else class="sub-head">
            <p class="muted small">
              Nilai kontrak awal {{ formatRupiah(contract.totalContractValue) }} · Sisa belum diinvoice
              <strong>{{ formatRupiah(store.uninvoicedValue(contract.id)) }}</strong>
            </p>
            <div class="head-actions">
              <button type="button" class="btn btn-secondary btn-sm" @click="openForm('milestone', null, contract.id)">Tambah termin</button>
              <button v-if="store.uninvoicedValue(contract.id) > 0" type="button" class="btn btn-secondary btn-sm" @click="openInvoiceForm(contract, '')">Buat invoice</button>
            </div>
          </div>

          <ol v-if="group.items.length" class="milestones">
            <li v-for="ms in group.items" :key="ms.id" class="milestone">
              <div class="ms-info">
                <p class="ms-title">
                  {{ ms.title }}
                  <span v-if="store.isReimbursement(ms)" class="tag" title="Penggantian biaya pihak ketiga: tidak dihitung omzet, tidak kena PPh 0,5%">Talangan</span>
                </p>
                <p class="ms-meta">{{ ms.percentage }}% · <strong>{{ formatRupiah(ms.amount) }}</strong></p>
                <!-- Satu baris tahap menggantikan tag status: terlihat sudah sampai mana dan apa berikutnya -->
                <ol class="steps" :aria-label="`Tahap ${ms.title}`">
                  <li
                    v-for="step in stepsOf(ms).steps"
                    :key="step.id"
                    :class="step.done ? 'done' : step.id === stepsOf(ms).next ? 'current' : ''"
                    :aria-current="step.id === stepsOf(ms).next ? 'step' : undefined"
                  >
                    {{ step.label }}<span v-if="step.done" class="visually-hidden"> (selesai)</span>
                  </li>
                </ol>
              </div>

              <div class="ms-actions">
                <button
                  v-if="stepsOf(ms).next"
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="NEXT_ACTION[stepsOf(ms).next].run(contract, ms)"
                >
                  {{ NEXT_ACTION[stepsOf(ms).next].label }}
                </button>
                <span v-else class="tag ok">Lunas</span>

                <div class="ms-links">
                  <button v-if="ms.isBastRequired && ms.bastNumber" type="button" class="btn-text" @click="openBast(contract, ms)">Lihat BAST</button>
                  <button v-if="store.milestoneHasInvoice(ms.id)" type="button" class="btn-text" @click="viewInvoice(contract, ms)">Lihat invoice</button>
                  <button type="button" class="btn-text" :aria-label="`Ubah termin ${ms.title}`" @click="openForm('milestone', ms, contract.id)">Ubah</button>
                </div>
              </div>
            </li>
          </ol>
          <div v-else-if="!group.addendum" class="empty-state">
            <strong>Kontrak ini belum punya termin.</strong>
            Tambahkan uang muka, termin, atau pelunasan dengan tombol Tambah termin.
          </div>
          <p v-else class="muted small no-ms">Belum ditagih. Pakai tombol Buat invoice di atas untuk menagihnya.</p>
        </div>

        <template v-if="tabOf(contract.id) === 'addenda'">
          <p v-if="contract.addenda.length && !milestoneGroups(contract).length" class="muted small no-ms">
            {{ addendaViewOf(contract.id) === 'paid' ? 'Belum ada tambahan yang lunas.' : 'Semua tambahan sudah lunas.' }}
          </p>
          <div v-if="!contract.addenda.length" class="empty-state">
            <strong>Belum ada tambahan kontrak.</strong>
            Catat fitur baru atau perubahan yang menambah nilai kontrak dengan tombol Tambah nilai kontrak.
          </div>
        </template>
      </div>

      <!-- Tagihan rutin ke klien: maintenance dan/atau biaya server, bisa lebih dari satu per kontrak -->
      <div v-if="tabOf(contract.id) === 'plans'" class="maintenance">
        <div v-for="plan in getPlans(contract.id)" :key="plan.id" class="plan-row">
          <div>
            <p class="ms-title">{{ PLAN_KIND[plan.kind] }}: {{ plan.title }}</p>
            <p v-if="plan.slaDetails" class="muted small">{{ plan.slaDetails }}</p>
            <p class="ms-meta">
              <strong>{{ formatRupiah(plan.monthlyFee) }}</strong> per bulan, ditagih tiap tanggal {{ plan.billingDayOfMonth }}
            </p>
          </div>
          <div class="maint-issue">
            <button
              v-if="!store.planIssuedThisMonth(plan.id)"
              type="button"
              class="btn btn-primary btn-sm"
              @click="store.generatePlanInvoice(plan.id)"
            >
              Terbitkan invoice bulan ini
            </button>
            <span v-else class="tag ok">Invoice bulan ini sudah terbit</span>
            <button type="button" class="btn-text" :aria-label="`Ubah ${plan.title}`" @click="openForm('plan', plan, contract.id)">Ubah</button>
          </div>
        </div>
        <button type="button" class="btn-text add-plan" @click="openForm('plan', null, contract.id)">
          + Tambah tagihan rutin (server / maintenance)
        </button>

        <div v-if="getMaintenanceInvoices(contract.id).length" class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Nomor</th>
                <th scope="col">Untuk</th>
                <th scope="col">Terbit</th>
                <th scope="col" class="num">Jumlah</th>
                <th scope="col">Status</th>
                <th scope="col"><span class="visually-hidden">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in getMaintenanceInvoices(contract.id)" :key="inv.id">
                <td class="mono">{{ inv.invoiceNumber }}</td>
                <td>{{ inv.description }}</td>
                <td class="nowrap">{{ formatDate(inv.issueDate) }}</td>
                <td class="num">{{ formatRupiah(inv.grossAmount) }}</td>
                <td><span class="tag" :class="INVOICE_STATUS[inv.status]?.tone">{{ INVOICE_STATUS[inv.status]?.label || inv.status }}</span></td>
                <td class="row-actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="viewInvoice(contract, null, inv)">Lihat</button>
                  <button v-if="inv.status !== 'paid'" type="button" class="btn btn-primary btn-sm" @click="recordInvoicePaid(inv)">
                    Catat lunas
                  </button>
                  <button v-if="inv.status !== 'paid'" type="button" class="btn-text danger-text" :aria-label="`Hapus ${inv.invoiceNumber}`" @click="removeRecurringInvoice(inv)">
                    Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="getPlans(contract.id).length" class="muted small">Belum ada invoice tagihan rutin.</p>
      </div>
    </section>

    <DocumentModal
      :company="store.company"
      :is-open="modalState.isOpen"
      :doc-type="modalState.docType"
      :invoice-data="modalState.invoice"
      :client-data="modalState.client"
      :contract-data="modalState.contract"
      :milestone-data="modalState.milestone"
      @close="modalState.isOpen = false"
    />

    <ContractFormDialog v-model:open="formState.contract" :store="store" :contract="formState.record" />
    <MilestoneFormDialog
      v-model:open="formState.milestone"
      :store="store"
      :contract-id="formState.contractId"
      :addendum-id="formState.addendumId"
      :milestone="formState.record"
      :issue-now="formState.issueNow"
      @issued="invoice => invoice && openModal('invoice', invoiceContract, { invoice })"
    />
    <PlanFormDialog v-model:open="formState.plan" :store="store" :contract-id="formState.contractId" :plan="formState.record" />
    <AddendaInvoiceDialog
      v-model:open="addendaInvoiceOpen"
      :store="store"
      :contract="invoiceContract"
      @issued="invoice => openModal('invoice', store.contracts.find(c => c.id === invoice.contractId), { invoice })"
    />
    <AddendumFormDialog v-model:open="addendumState.open" :store="store" :contract="addendumState.contract" :addendum="addendumState.addendum" />
  </div>
</template>

<script setup>
import { reactive, shallowRef, ref } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { taxOf, formatDate, milestoneSteps } from '../../utils/finance';
import DocumentModal from './DocumentModal.vue';
import ContractFormDialog from './ContractFormDialog.vue';
import MilestoneFormDialog from './MilestoneFormDialog.vue';
import PlanFormDialog from './PlanFormDialog.vue';
import AddendumFormDialog from './AddendumFormDialog.vue';
import AddendaInvoiceDialog from './AddendaInvoiceDialog.vue';
import { askConfirm, showNotice } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true }
});

const PROJECT_TYPE = {
  softwareOnly: 'Software',
  iotHardwareOnly: 'Hardware IoT',
  integratedSoftwareAndIot: 'Software & hardware IoT'
};

const CONTRACT_STATUS = {
  draft: 'Draf',
  sent: 'Terkirim ke klien',
  signed: 'Ditandatangani',
  inProgress: 'Berjalan',
  completed: 'Selesai'
};


const INVOICE_STATUS = {
  draft: { label: 'Draf' },
  sent: { label: 'Menunggu pembayaran', tone: 'wait' },
  overdue: { label: 'Lewat jatuh tempo', tone: 'wait' },
  paid: { label: 'Lunas', tone: 'ok' }
};

const modalState = reactive({
  isOpen: false,
  docType: 'invoice',
  invoice: {},
  client: {},
  contract: {},
  milestone: {}
});

// Form tambah/ubah: kind = 'contract' | 'milestone' | 'plan', record = null untuk data baru
const formState = reactive({ contract: false, milestone: false, plan: false, record: null, contractId: '', addendumId: '', issueNow: false });

const addendumState = reactive({ open: false, contract: null, addendum: null });
const openAddendum = (contract, addendum) => Object.assign(addendumState, { open: true, contract, addendum });

// "Buat invoice": termin baru yang langsung diterbitkan invoice-nya, lalu dokumennya dibuka
const invoiceContract = shallowRef(null);
const openInvoiceForm = (contract, addendumId) => {
  invoiceContract.value = contract;
  Object.assign(formState, { record: null, contractId: contract.id, addendumId, issueNow: true });
  formState.milestone = true;
};

// Invoice gabungan tambahan kontrak: pilih tambahan mana saja yang dilampirkan
const addendaInvoiceOpen = ref(false);
const openAddendaInvoice = (contract) => {
  invoiceContract.value = contract;
  addendaInvoiceOpen.value = true;
};
const addendaUninvoiced = (contract) => contract.addenda.reduce((sum, a) => sum + props.store.uninvoicedValue(contract.id, a.id), 0);

const openForm = (kind, record, contractId = '', addendumId = '') => {
  Object.assign(formState, { record, contractId, addendumId, issueNow: false });
  formState[kind] = true;
};

const getClient = (clientId) => props.store.clients.find(c => c.id === clientId) || {};
const getMilestones = (contractId) => props.store.milestones.filter(m => m.contractId === contractId);
const getPlans = (contractId) => props.store.maintenancePlans.filter(p => p.contractId === contractId);

const PLAN_KIND = { maintenance: 'Maintenance', server: 'Server' };

// Tab aktif per kontrak (default Termin); tidak disimpan, kembali ke Termin saat portal dibuka ulang
const cardTab = reactive({});
const tabOf = (contractId) => cardTab[contractId] || 'termin';
const milestoneGroups = (contract) => {
  const all = getMilestones(contract.id);
  if (tabOf(contract.id) === 'termin') {
    return [{ key: 'base', addendum: null, items: all.filter(m => !props.store.milestoneAddendum(m)) }];
  }
  const wantPaid = addendaViewOf(contract.id) === 'paid';
  return contract.addenda
    .filter(ad => addendumPaid(contract, ad) === wantPaid)
    .map(ad => ({ key: ad.id, addendum: ad, items: all.filter(m => props.store.milestoneAddendum(m)?.id === ad.id) }));
};

// Tambahan lunas: seluruh nilainya sudah jadi termin dan semua termin itu sudah dibayar
const addendumPaid = (contract, ad) => {
  const termins = props.store.addendumMilestones(contract.id, ad.id);
  return termins.length > 0 && props.store.unscheduledValue(contract.id, ad.id) === 0 && termins.every(m => m.status === 'paid');
};

const ADDENDA_VIEWS = [{ id: 'open', label: 'Belum lunas' }, { id: 'paid', label: 'Lunas' }];
const addendaView = reactive({});
const addendaViewOf = (contractId) => addendaView[contractId] || 'open';

const cardTabs = (contract) => [
  { id: 'termin', label: 'Termin', count: getMilestones(contract.id).filter(m => !props.store.milestoneAddendum(m)).length },
  { id: 'addenda', label: 'Tambahan kontrak', count: contract.addenda.length },
  { id: 'plans', label: 'Tagihan rutin', count: getPlans(contract.id).length }
];
// Terbaru di atas
const getMaintenanceInvoices = (contractId) => props.store.invoices
  .filter(i => i.contractId === contractId && !i.milestoneId && i.status !== 'cancelled')
  .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.invoiceNumber.localeCompare(a.invoiceNumber));

const openModal = (docType, contract, extra) => {
  Object.assign(modalState, { docType, contract, client: getClient(contract.clientId), ...extra, isOpen: true });
};

// "Lihat invoice" hanya tampil setelah invoice terbit, jadi tidak ada lagi invoice draf tanpa nomor resmi
const viewInvoice = (contract, milestone, invoice) => {
  openModal('invoice', contract, { invoice: invoice || props.store.invoiceOfMilestone(milestone.id) });
};

const openBast = (contract, milestone) => {
  props.store.issueBast(milestone.id);
  openModal('bast', contract, { milestone });
};

const recordBastSigned = async (ms) => {
  if (await askConfirm({
    title: 'BAST sudah ditandatangani klien?',
    facts: [['Termin', ms.title], ['Nomor BAST', ms.bastNumber]],
    note: 'Setelah dicatat, invoice termin terbit dan pembayaran bisa dicatat. Tidak bisa dibatalkan.',
    confirmLabel: 'Ya, sudah ditandatangani'
  })) {
    props.store.signBast(ms.id);
  }
};

const recordPayment = async (ms) => {
  // Termin di invoice gabungan: pembayaran dicatat untuk seluruh invoice (semua barisnya ikut lunas)
  const combined = props.store.invoiceOfMilestone(ms.id);
  if (combined?.items.length) return recordInvoicePaid(combined);
  if (await askConfirm({
    title: 'Pembayaran sudah masuk?',
    facts: [['Termin', ms.title], ['Jumlah', formatRupiah(ms.amount)], ['PPh Final 0,5% yang harus disetor', props.store.isReimbursement(ms) ? 'Tidak ada (talangan)' : formatRupiah(taxOf(ms.amount))]],
    note: 'Tidak bisa dibatalkan.',
    confirmLabel: 'Ya, dana sudah masuk'
  })) {
    props.store.payMilestone(ms.id);
  }
};

const stepsOf = (ms) => milestoneSteps(ms, props.store.milestoneHasInvoice(ms.id));

const issueInvoice = (contract, ms) => {
  const invoice = props.store.issueInvoice(ms.id);
  if (invoice) openModal('invoice', contract, { invoice });
};

// Satu tombol utama per termin, sesuai tahap berikutnya dari milestoneSteps()
const NEXT_ACTION = {
  issueBast: { label: 'Terbitkan BAST', run: openBast },
  signBast: { label: 'Catat BAST ditandatangani', run: (c, ms) => recordBastSigned(ms) },
  issueInvoice: { label: 'Terbitkan invoice', run: issueInvoice },
  pay: { label: 'Catat pembayaran masuk', run: (c, ms) => recordPayment(ms) }
};

const removeRecurringInvoice = async (inv) => {
  if (await askConfirm({
    title: `Hapus ${inv.invoiceNumber}?`,
    message: 'Invoice hilang dari daftar dan dari tagihan belum dibayar. Nomornya tidak dipakai lagi.',
    facts: [['Untuk', inv.description], ['Jumlah', formatRupiah(inv.grossAmount)]],
    note: 'Jika invoice ini sudah dikirim, kabari klien bahwa invoice ini dibatalkan.',
    confirmLabel: 'Hapus invoice',
    tone: 'danger'
  })) {
    props.store.cancelRecurringInvoice(inv.id);
  }
};

const recordInvoicePaid = async (inv) => {
  // Invoice gabungan bisa memuat termin ber-BAST: lunas baru bisa dicatat setelah semua BAST-nya ditandatangani
  if (props.store.invoiceWaitingBast(inv)) {
    showNotice({
      title: 'Belum bisa dicatat lunas',
      message: `${inv.invoiceNumber} memuat termin yang BAST-nya belum ditandatangani. Catat BAST ditandatangani dulu di tab Tambahan kontrak.`
    });
    return;
  }
  if (await askConfirm({
    title: 'Invoice sudah dibayar?',
    facts: [['Invoice', inv.invoiceNumber], ['Jumlah', formatRupiah(inv.grossAmount)], ['PPh Final 0,5% yang harus disetor', formatRupiah(inv.taxAmount)]],
    note: 'Tidak bisa dibatalkan.',
    confirmLabel: 'Ya, sudah dibayar'
  })) {
    props.store.markInvoiceAsPaid(inv.id);
  }
};
</script>

<style scoped>
.projects-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.small {
  font-size: 0.85rem;
}

.view-head,
.sub-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sub-head {
  margin-bottom: 8px;
}

.head-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.contract-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 2px 0 4px;
}

.contract-meta {
  font-size: 0.92rem;
  color: var(--text-secondary);
}

.sep {
  margin: 0 6px;
}

.ms-group + .ms-group {
  margin-top: 8px;
}

.addendum-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.no-ms {
  padding: 12px 0 16px;
}

.addenda-bar {
  margin-bottom: 12px;
}

/* Saringan Belum lunas / Lunas di tab Tambahan kontrak */
.seg {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.seg-btn {
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.seg-btn.active {
  background: #ffffff;
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(9, 13, 22, 0.12);
}

.seg-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.addendum-desc {
  display: block;
  padding: 2px 0 8px;
  white-space: pre-line;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.profit {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  padding: 12px 16px;
  margin-bottom: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.profit dt {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.profit dd {
  font-weight: 700;
  color: var(--text-primary);
}

.profit .text-block {
  color: #b91c1c;
}

.profit .text-wait {
  color: #92400e;
}

.sub-heading {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.milestones {
  list-style: none;
  border-top: 1px solid var(--card-border);
  margin-bottom: 32px;
}

.milestone {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--card-border);
}

.ms-info {
  flex: 1;
  min-width: 260px;
}

.ms-title {
  font-weight: 700;
  color: var(--text-primary);
}

.ms-meta {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 2px 0 8px;
}

/* Tahap termin: hijau = selesai, cobalt tebal = yang perlu dikerjakan sekarang, abu = nanti */
.steps {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.steps li::before {
  content: '○';
  margin-right: 6px;
}

.steps li.done {
  color: #166534;
}

.steps li.done::before {
  content: '✓';
}

.steps li.current {
  color: var(--accent-primary);
  font-weight: 700;
}

.steps li.current::before {
  content: '●';
}

.ms-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.ms-links,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.ms-links .btn-text {
  font-size: 0.85rem;
}

.card-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--card-border);
}

.card-tab {
  min-height: 44px;
  padding: 0 14px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
}

.card-tab:hover {
  color: var(--text-primary);
}

/* Tab aktif ditandai garis bawah cobalt, sama seperti menu portal */
.card-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-primary);
}

.card-tab:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.tab-count {
  display: inline-block;
  min-width: 22px;
  margin-left: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.add-plan {
  padding-left: 0;
}

@media (max-width: 640px) {
  .ms-actions {
    align-items: flex-start;
  }
}

.maint-issue {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.plan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 12px 0;
  border-bottom: 1px solid var(--card-border);
}

.nowrap {
  white-space: nowrap;
}

.danger-text {
  color: #b91c1c;
}
</style>
