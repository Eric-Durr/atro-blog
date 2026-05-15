<template>
  <button :disabled="isButtonDisabled" @click="incrementLikes">
    {{ buttonLabel }}
  </button>
  <p v-if="syncMessage" class="status">{{ syncMessage }}</p>
  <p v-if="state.errorMessage" class="error">{{ state.errorMessage }}</p>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

import { useLikesStore } from "@/stores/likes";

interface Props {
  postId: number;
}

const props = defineProps<Props>();
const {
  state,
  buttonLabel,
  ensureLoaded,
  incrementLikes,
  isButtonDisabled,
  syncMessage,
} = useLikesStore(props.postId);

onMounted(() => {
  void ensureLoaded();
});

</script>

<style scoped>
button {
  background-color: #7b37fa;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}
button:hover {
  background-color: #8563b7;
  transform: scale(1.05);
}
button:disabled {
  cursor: wait;
  opacity: 0.8;
  transform: none;
}
.error {
  margin-top: 0.5rem;
  color: #b91c1c;
  font-size: 0.875rem;
}
.status {
  margin-top: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
}
</style>
