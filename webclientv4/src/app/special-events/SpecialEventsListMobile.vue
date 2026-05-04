<template>
  <ul class="cards-list">
    <li
      v-for="event in specialEvents"
      :key="event.id"
      class="event-card"
      data-testid="event-card"
      @click="toggleExpanded(event.id)"
    >
      <div class="card-main">
        <i
          class="pi card-chevron"
          :class="expandedId === event.id ? 'pi-chevron-down' : 'pi-chevron-right'"
        ></i>
        <span class="card-name" data-testid="card-name">{{ event.name }}</span>
        <span v-if="event.start_date" class="card-date">{{ formatDate(event.start_date) }}</span>
      </div>

      <div v-if="expandedId === event.id" class="card-detail" data-testid="card-detail" @click.stop>
        <div class="detail-grid">
          <span class="detail-item" data-testid="detail-budget">
            <span class="detail-label">Budget</span>
            <EcMoneyDisplay :model-value="event.budget_amount ?? 0" highlight-mode="none" />
          </span>
          <span class="detail-item" data-testid="detail-actual">
            <span class="detail-label">Actual</span>
            <EcMoneyDisplay :model-value="event.actual_amount ?? 0" highlight-mode="none" />
          </span>
          <span class="detail-item detail-item--full" data-testid="detail-difference">
            <span class="detail-label">Difference</span>
            <EcMoneyDisplay
              :model-value="(event.budget_amount ?? 0) - (event.actual_amount ?? 0)"
              highlight-mode="balance"
            />
          </span>
        </div>

        <div class="card-actions">
          <Button
            v-tooltip="'View this special event'"
            label="View"
            size="small"
            :data-testid="`view-btn-${event.id}`"
            @click="$emit('view', event)"
          />
          <Button
            v-tooltip="'Edit this special event'"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            :data-testid="`edit-btn-${event.id}`"
            @click="$emit('edit', event)"
          />
          <Button
            v-tooltip="'Delete this special event'"
            icon="pi pi-trash"
            size="small"
            severity="danger"
            :data-testid="`delete-btn-${event.id}`"
            @click="$emit('delete', event)"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import { formatDate } from '../shared/util/formatDate';
import type { SpecialEventData } from './specialEvent.types';

defineProps<{
  specialEvents: SpecialEventData[];
}>();

defineEmits<{
  view: [event: SpecialEventData];
  edit: [event: SpecialEventData];
  delete: [event: SpecialEventData];
}>();

const expandedId = ref<number | null>(null);

function toggleExpanded(id: number | undefined) {
  if (id == null) return;
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<style scoped>
.cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.event-card {
  padding: 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  cursor: pointer;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-chevron {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}

.card-name {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.card-date {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.card-detail {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--p-surface-200);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-item--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.card-actions > :first-child {
  flex: 1;
}
</style>
