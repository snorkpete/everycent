<template>
  <section class="whats-new">
    <h2 data-testid="whats-new-heading" class="whats-new__heading">What's new</h2>

    <div class="highlights">
      <article
        v-for="highlight in HIGHLIGHTS"
        :key="highlight.title"
        class="highlight-card"
        data-testid="highlight-card"
      >
        <header class="highlight-card__header">
          <h3 data-testid="highlight-title" class="highlight-card__title">
            {{ highlight.title }}
          </h3>
          <time
            :datetime="highlight.date"
            data-testid="highlight-date"
            class="highlight-card__date"
          >
            {{ formatFriendlyDate(highlight.date) }}
          </time>
        </header>
        <p data-testid="highlight-body" class="highlight-card__body">{{ highlight.body }}</p>
      </article>
    </div>

    <section class="noteworthy">
      <h3 data-testid="noteworthy-heading" class="noteworthy__heading">Also worth knowing</h3>
      <ul class="noteworthy__list">
        <li
          v-for="item in NOTEWORTHY"
          :key="item"
          data-testid="noteworthy-item"
          class="noteworthy__item"
        >
          {{ item }}
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { HIGHLIGHTS, NOTEWORTHY } from './whatsNewContent';
import { formatFriendlyDate } from './formatFriendlyDate';
</script>

<style scoped>
.whats-new {
  max-width: 720px;
}

.whats-new__heading {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--p-text-color);
}

.highlights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.highlight-card {
  border: 1px solid var(--p-surface-300);
  border-left: 4px solid var(--p-primary-color);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 1rem 1.25rem;
}

.highlight-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.highlight-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.highlight-card__date {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.highlight-card__body {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--p-text-color);
}

.noteworthy__heading {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--p-text-color);
}

.noteworthy__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.noteworthy__item {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--p-text-color);
  padding-left: 1rem;
  position: relative;
}

.noteworthy__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--p-primary-color);
}
</style>
