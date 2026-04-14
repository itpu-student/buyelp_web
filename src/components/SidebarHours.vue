<template>
  <div class="sidebar-hours-block">
    <div class="sidebar-line hours-row is-link" @click="fullWeekOpen = !fullWeekOpen">
      <span class="side-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
          />
        </svg>
      </span>
      <div class="hours-summary-new">
        <strong :class="place.isOpen ? 'text-success' : 'text-danger'">
          {{ place.isOpen ? t("place.open_now") : t("place.closed") }}
        </strong>
        <span class="today-text">{{ todayHoursDisplay }}</span>
      </div>
      <div class="toggle-icon" :class="{ rotated: fullWeekOpen }">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>
    </div>
    <transition name="expand">
      <div v-if="fullWeekOpen" class="weekly-hours">
        <div class="hours-grid">
          <div v-for="row in gridOrder" :key="row.label" class="day-row" :class="{ today: isToday(row.key), 'is-sun': row.key === 'sun' }">
            <span class="day-label">{{ row.label }}</span>
            <span class="day-hours">{{ row.hours }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { t, i18nState } from "../i18n/index.js"
import { resolveTodayHours, WEEKLY_HOURS_ORDER } from "../data/places.js"

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const fullWeekOpen = ref(false)
const locale = i18nState

function isToday(key) {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).toLowerCase()
  return key === currentDay
}

const todayHoursDisplay = computed(() => {
  const line = resolveTodayHours(props.place)
  return line ?? t("place.hours_unknown")
})

const weekRows = computed(() => {
  const p = props.place
  if (!p) return []
  const tag = locale.locale === "uz" ? "uz-UZ" : "en-US"
  const wh = p.weeklyHours
  if (wh && typeof wh === "object") {
    return WEEKLY_HOURS_ORDER.map((key, i) => {
      const d = new Date(2024, 0, 1 + i)
      const label = d.toLocaleDateString(tag, { weekday: "short" }).slice(0, 2)
      const h = wh[key]
      const hours = h != null && String(h).trim() ? String(h).trim() : "—"
      return { label, hours, key }
    })
  }
  const fallback = resolveTodayHours(p) ?? "—"
  return WEEKLY_HOURS_ORDER.map((key, i) => {
    const d = new Date(2024, 0, 1 + i)
    const label = d.toLocaleDateString(tag, { weekday: "short" }).slice(0, 2)
    return { label, hours: fallback, key }
  })
})

const gridOrder = computed(() => {
  const rows = weekRows.value
  if (rows.length < 7) return rows
  // Desired Order: Mon, Thu, Tue, Fri, Wed, Sat, Sun
  return [rows[0], rows[3], rows[1], rows[4], rows[2], rows[5], rows[6]]
})
</script>

<style scoped>
.sidebar-hours-block {
  padding-top: 4px;
}

.sidebar-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-line.is-link {
  text-decoration: none;
  color: inherit;
  transition: background var(--transition);
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: var(--radius-sm);
}

.sidebar-line.is-link:hover {
  background: var(--surface-2);
}

.side-icon {
  flex-shrink: 0;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.hours-row {
  cursor: pointer;
  align-items: center;
}

.hours-summary-new {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.text-success {
  color: #16a34a;
  font-weight: 700;
  font-size: 0.95rem;
}

.text-danger {
  color: #dc2626;
  font-weight: 700;
  font-size: 0.95rem;
}

.today-text {
  font-size: 0.9rem;
  color: var(--text-2);
}

.toggle-icon {
  flex-shrink: 0;
  transition: transform 0.3s;
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.weekly-hours {
  margin-top: 4px;
  padding: 16px 12px;
  border-top: 1px solid var(--border-light);
}

.hours-grid {
  display: grid;
  grid-template-columns: repeat(2, 120px);
  gap: 12px 24px;
  justify-content: center;
  position: relative;
}

.hours-grid::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 40px; /* Ends before Sunday */
  border-left: 1px dashed var(--border-light);
  transform: translateX(-50%);
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--text);
  white-space: nowrap;
}

.day-row.is-sun {
  grid-column: span 2;
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px dashed var(--border-light);
}

.day-row.today {
  color: var(--primary);
  border-bottom: 1.5px solid var(--primary);
  padding-bottom: 1px;
}

.day-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
  text-transform: capitalize;
  min-width: 18px;
  margin-right: 6px;
}

.today .day-label {

}

.day-hours {
  color: var(--text-2);
  font-weight: 500;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.today .day-hours {
  /* color: var(--text); */
  font-weight: 700;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
