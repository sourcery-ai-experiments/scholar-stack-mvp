<template>
  <main class="px-8 py-16">
    <div class="flex justify-between">
      <h1>Your Projects</h1>

      <nuxt-link to="/projects/new">
        <n-button
          strong
          secondary
          type="info"
          icon-placement="left"
          size="large"
        >
          <template #icon>
            <Icon name="fluent:form-new-20-filled" />
          </template>
          Create a new project
        </n-button>
      </nuxt-link>
    </div>

    <div class="my-8">
      <transition name="fade" mode="out-in">
        <div v-if="pending">
          <client-only>
            <Vue3Lottie
              animation-link="https://assets10.lottiefiles.com/packages/lf20_AQEOul.json"
              :height="200"
              :width="200"
            />
          </client-only>
        </div>
        <div v-else>
          <div
            v-if="projects && projects.length <= 0"
            class="flex w-full flex-col rounded-md border border-dashed px-3 py-5"
          >
            <client-only>
              <Vue3Lottie
                animation-link="https://assets2.lottiefiles.com/datafiles/vhvOcuUkH41HdrL/data.json"
                :height="200"
                :width="200"
              />
            </client-only>
            <p class="my-4 text-center text-xl text-slate-700">
              You don't have any projects yet.
            </p>
          </div>
          <div v-else>
            <div
              class="flex w-full flex-row items-center justify-end space-x-4 px-4 pb-3"
            >
              <Icon
                name="mingcute:grid-fill"
                size="27"
                class="cursor-pointer transition-all"
                :class="{
                  'text-slate-800': viewType === 'grid',
                  'text-slate-400 hover:text-slate-500': viewType === 'list',
                }"
                @click="selectViewType('grid')"
              />
              <Icon
                name="ph:list-fill"
                size="27"
                class="cursor-pointer transition-all"
                :class="{
                  'text-slate-800': viewType === 'list',
                  'text-slate-400 hover:text-slate-500': viewType === 'grid',
                }"
                @click="selectViewType('list')"
              />
            </div>

            <n-divider />

            <transition name="fade" mode="out-in">
              <div v-if="viewType === 'grid'">grid</div>
              <n-list v-else hoverable clickable>
                <n-list-item v-for="project in projects" :key="project.id">
                  <n-thing>
                    <template #header>
                      <p class="px-4 text-xl font-semibold">
                        {{ project.name }}
                      </p>
                    </template>

                    <template #avatar>
                      <n-image
                        width="130"
                        :src="project.image"
                        fallback-src="https://via.placeholder.com/100"
                        class="rounded-lg"
                      />
                    </template>
                    <template #description>
                      <div class="flex flex-col px-4">
                        <p class="mb-2 text-lg">
                          {{ project.description }}
                        </p>

                        <div class="flex flex-wrap items-center space-x-3">
                          <n-tag
                            v-for="tag in project.tags"
                            :key="tag"
                            :bordered="false"
                            type="info"
                            size="medium"
                          >
                            {{ tag }}
                          </n-tag>
                        </div>

                        <div
                          class="mt-3 flex flex-wrap items-end space-x-3 text-base text-slate-600"
                        >
                          <n-tooltip trigger="hover" placement="bottom-start">
                            <template #trigger>
                              <div class="flex items-center">
                                <Icon name="clarity:date-outline-badged" />
                                <span class="pl-1 pr-2 text-sm">
                                  {{ shortDate(project.updated) }} ago
                                </span>
                              </div>
                            </template>
                            Created on {{ longDate(project.created) }}
                          </n-tooltip>

                          <n-tooltip trigger="hover" placement="bottom-end">
                            <template #trigger>
                              <div class="flex items-center">
                                <Icon name="bx:time" />
                                <span class="pl-1 pr-2 text-sm">
                                  {{ dateDifference(project.updated) }} ago
                                </span>
                              </div>
                            </template>
                            Last modified on {{ longDate(project.updated) }}
                          </n-tooltip>
                        </div>
                      </div>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </transition>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useMessage } from "naive-ui";
import dayjs from "dayjs";

const user = useSupabaseUser();
const message = useMessage();

const {
  data: projects,
  error,
  pending,
} = useLazyFetch("/api/projects", {
  headers: useRequestHeaders(["cookie"]),
});

watch(
  error,
  (err) => {
    if (!err) return;
    console.log(err?.data.message);
    message.error("Something went wrong. Please try again later.");
  },
  {
    immediate: true,
  }
);

const viewType = ref<"grid" | "list">("list");

const selectViewType = (type: "grid" | "list") => {
  viewType.value = type;
};

const shortDate = (date: string) => {
  return dayjs(date).format("MMM DD");
};

const longDate = (date: string) => {
  return dayjs(date).format("MMM DD, YYYY - hh:mm A");
};

const dateDifference = (date: string) => {
  const now = dayjs();

  let difference = 0;

  difference = now.diff(date, "second");

  if (difference < 60) {
    return `a few seconds`;
  }

  difference = now.diff(date, "minute");

  if (difference < 60) {
    if (difference === 1) {
      return `a minute`;
    } else if (difference < 10) {
      return `a few minutes`;
    } else {
      return `${difference} minutes`;
    }
  }

  difference = now.diff(date, "hour");

  if (difference < 24) {
    if (difference === 1) {
      return `an hour`;
    } else {
      return `${difference} hours`;
    }
  }

  difference = now.diff(date, "day");

  if (difference < 30) {
    if (difference === 1) {
      return `a day`;
    } else {
      return `${difference} days`;
    }
  }

  difference = now.diff(date, "month");

  if (difference < 12) {
    if (difference === 1) {
      return `a month`;
    } else {
      return `${difference} months`;
    }
  }

  difference = now.diff(date, "year");

  if (difference === 1) {
    return `a year`;
  } else {
    return `${difference} years`;
  }
};

definePageMeta({
  middleware: ["auth"],
});
</script>
