<script setup lang="ts">
import { displayLongDate } from "@/utils/displayDates";

defineProps({
  allVersions: {
    required: true,
    type: Array as PropType<AllVersionsItem[]>,
  },
  projectCreated: {
    required: true,
    type: String,
  },
});

const route = useRoute();

const linkStore = useLinkStore();

const allLinks = computed(() => linkStore.links);

const changesPresent = computed(() => {
  return allLinks.value.some((link) => {
    if (
      link.name !== link.original?.name ||
      link.description !== link.original?.description ||
      link.icon !== link.original?.icon ||
      link.target !== link.original?.target ||
      link.type !== link.original?.type
    ) {
      return true;
    }
    return false;
  });
});
</script>

<template>
  <n-timeline item-placement="right">
    <n-timeline-item
      v-if="changesPresent"
      content="Current version"
      type="warning"
      line-type="dashed"
      :class="{
        'rounded-xl bg-gray-50 pl-2 pt-4 transition-all ': changesPresent,
      }"
    />

    <n-timeline-item
      v-for="version in allVersions"
      :key="version.identifier"
      :title="version.name"
      :line-type="changesPresent ? 'default' : 'dashed'"
      type="success"
      :time="displayLongDate(version.created)"
      :class="{
        'rounded-xl bg-gray-50 pl-2 pt-4 transition-all ':
          version.identifier === route.params.videntifier && !changesPresent,
      }"
    >
      <template #header>
        {{ version.name }}
      </template>

      <nuxt-link
        :to="`/projects/${route.params.pidentifier}/version/${version.identifier}`"
      >
        bit.ly/{{ version.identifier }}
      </nuxt-link>
    </n-timeline-item>

    <n-timeline-item
      title="Project Created"
      type="info"
      :time="displayLongDate(projectCreated)"
    >
      <nuxt-link :to="`/projects/${route.params.pidentifier}`">
        bit.ly/{{ route.params.pidentifier }}
      </nuxt-link>
    </n-timeline-item>
  </n-timeline>
</template>
