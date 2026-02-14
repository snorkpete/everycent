import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useHeadingStore = defineStore('heading', () => {
  const heading = ref('');

  function setHeading(value: string) {
    heading.value = value;
  }

  return { heading, setHeading };
});
