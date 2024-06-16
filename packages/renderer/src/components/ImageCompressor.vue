<template>
  <div class="image-compressor">
    <div class="compress-task-source">
      <div class="compress-task-source-selector">
        <Button
          type="primary"
          @click="chooseSourceAndPreview('dir')"
        >
          选择文件夹
        </Button>
      </div>

      <div class="compress-task-source-selector">
        <Button
          type="primary"
          @click="chooseSourceAndPreview('files')"
        >
          选择文件
        </Button>
      </div>
    </div>

    <div class="compress-task-options">
      <ASlider
        v-model="quality"
        :format-tooltip="qualityFormatter"
      />
    </div>

    <div class="compress-task">
      <div class="compress-task-preview">
        <CompressTaskPreviewVue
          v-if="preview"
          :files="preview.previewFiles"
        ></CompressTaskPreviewVue>
      </div>
      <div
        v-if="preview"
        class="compress-task-summary"
      >
        共{{ preview.previewFiles.length }}张图片
        <br />
        输出文件夹：{{ preview.outDir }}
      </div>
    </div>

    <div class="compress-task-commands">
      <Button
        type="primary"
        :disabled="!preview"
        :style="{ width: '100%' }"
        @click="confirmTask"
      >
        开&nbsp;始
      </Button>
    </div>

    <div class="compress-task-progress">
      <Progress
        v-show="preview"
        :percent="progress"
        :show-text="false"
      ></Progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue";
import { Button, Message, Progress } from "@arco-design/web-vue";

import { waitForUserToChooseSource, confirmCompressImages } from "#preload";
import type { CompressTaskPreview, CompressTaskSourceType, OnProgress } from "@shared/types";

import CompressTaskPreviewVue from "./CompressTaskPreview.vue";

const onProgress: OnProgress = ({ progress: pro }) => {
  progress.value = pro;
};
const quality = ref(85);
const qualityFormatter = (value: number) => {
  return `图片质量: ${value}`;
};

const progress = ref(0);

const preview = ref<CompressTaskPreview | null>(null);

async function confirmTask() {
  if (!preview.value) throw new Error("Lacks task source");
  await confirmCompressImages(toRaw(preview.value), quality.value, onProgress);
  Message.success("压缩完成");
}

function resetTask() {
  progress.value = 0;
  preview.value = null;
}

async function chooseSourceAndPreview(sourceType: CompressTaskSourceType) {
  const taskPreview = await waitForUserToChooseSource(sourceType);
  if (taskPreview) {
    resetTask();
    preview.value = taskPreview;
  }
}
</script>

<style scoped lang="scss">
.image-compressor {
  width: 100%;
  height: 100%;
  padding: 1.5em;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .compress-task-source {
    display: flex;
    justify-content: space-around;
    border: 1px dashed gray;
    .compress-task-source-selector {
      padding: 1em;
    }
  }
  .compress-task-options {
    margin: 1em 0;
  }
  .compress-task {
    margin: 0.5em 0;
    border: 1px solid lightgray;
    padding: 1em;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .compress-task-preview {
      flex: 1;
      overflow: auto;
    }
    .compress-task-summary {
      transform: translateY(0.5em);
    }
  }

  .compress-task-commands {
    margin: 1em 0;
  }

  .compress-task-progress {
    width: 100%;
    height: 1em;
  }
}
</style>
