<script setup lang="ts">
import sanitizeHtml from "sanitize-html";
import { parse } from "marked";

const sanitize = (html: string) => sanitizeHtml(html);

const route = useRoute();

const showSpinner = ref(true);

const versionIdentifier = route.params.videntifier as string;

/**
 * TODO: Make request in page and pass content to component
 */

const { data, error } = await useFetch(
  `/api/release-notes/${versionIdentifier}`
);

showSpinner.value = false;

if (error.value) {
  console.error(error.value);
}

const releaseNotes = ref<string>("");

releaseNotes.value = data.value?.changes || "";

const markdownToHtml = computed(() => {
  return sanitize(parse(releaseNotes.value));
});
</script>

<template>
  <n-spin :show="showSpinner">
    <div class="prose mt-10 min-h-[300px] max-w-none" v-html="markdownToHtml" />
  </n-spin>
</template>
