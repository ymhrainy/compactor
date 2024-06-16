<template>
  <div
    v-for="f in files"
    :key="f.input"
    class="compress-task-preview-file"
  >
    {{ f.input }}
  </div>
</template>

<script setup lang="ts">
import type { CompressTaskPreviewFile } from "@shared/types";

defineProps<{
  files: CompressTaskPreviewFile[];
}>();
</script>

<style lang="scss" scoped>
.compress-task-preview-file {
  padding: 2px 0;
}
</style>
