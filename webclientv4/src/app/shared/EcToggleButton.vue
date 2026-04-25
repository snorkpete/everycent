<template>
  <Button
    v-tooltip="tooltip"
    :icon="
      resolvedInactiveIcon
        ? modelValue
          ? resolvedActiveIcon
          : resolvedInactiveIcon
        : resolvedActiveIcon
    "
    text
    severity="secondary"
    size="small"
    :class="['icon-btn', { 'icon-btn--active': modelValue }]"
    @click="emit('update:modelValue', !modelValue)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

const VARIANT_ICONS = {
  dashIfZero: { activeIcon: 'pi pi-minus', inactiveIcon: 'pi pi-hashtag' },
  wrap: { activeIcon: 'pi pi-arrows-h' },
  calculator: { activeIcon: 'pi pi-calculator' },
} as const;

export type ToggleButtonVariant = keyof typeof VARIANT_ICONS;

const props = defineProps<{
  modelValue: boolean;
  tooltip: string;
  variant?: ToggleButtonVariant;
  activeIcon?: string;
  inactiveIcon?: string;
}>();

const resolvedActiveIcon = computed(() => {
  if (props.activeIcon) return props.activeIcon;
  if (props.variant) return VARIANT_ICONS[props.variant].activeIcon;
  return '';
});

const resolvedInactiveIcon = computed(() => {
  if (props.inactiveIcon) return props.inactiveIcon;
  if (props.variant) {
    const preset = VARIANT_ICONS[props.variant];
    return 'inactiveIcon' in preset ? preset.inactiveIcon : undefined;
  }
  return undefined;
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<style scoped>
:deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}
</style>
