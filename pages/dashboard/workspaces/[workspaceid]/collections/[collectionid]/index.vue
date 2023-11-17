<script setup lang="ts">
import sanitizeHtml from "sanitize-html";
import { parse } from "marked";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const { collectionid, workspaceid } = route.params as {
  collectionid: string;
  workspaceid: string;
};

const { data: collection, error } = await useFetch<CollectionGETAPIResponse>(
  `/api/workspaces/${workspaceid}/collections/${collectionid}`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your collectionss",
  });

  navigateTo(`/dashboard/workspaces/${workspaceid}`);
}
const sanitize = (html: string) => sanitizeHtml(html);

const markdownToHtml = computed(() => {
  return sanitize(
    parse(collection.value?.version?.changelog || "No changelog")
  );
});

const createNewDraftVersion = async () => {
  const { data, error } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/version`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "POST",
    }
  );

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't create a new draft version",
    });
  }

  if (data.value) {
    push.success({
      title: "Success",
      message: "We created a new draft version",
    });

    // refresh the page
    window.location.reload();
  }
};
</script>

<template>
  <main class="h-full bg-white">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <div class="flex w-full items-center justify-between">
          <h1>
            {{ collection?.title || "Untitled Collection" }}
          </h1>

          <n-tag v-if="!collection?.version?.published" type="info">
            draft version
          </n-tag>
        </div>

        <div class="flex items-center space-x-2">
          <n-button
            v-if="collection?.version?.published || !collection?.version"
            size="large"
            color="black"
            @click="createNewDraftVersion"
          >
            <template #icon>
              <Icon name="iconoir:axes" />
            </template>
            Create a new {{ !collection?.version ? "draft" : "" }} version
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <div class="flex items-center justify-between space-x-4 pb-5 pt-10">
        <h3>About</h3>
      </div>

      <p>
        {{ collection?.description || "No description" }}
      </p>

      <n-divider />

      <div class="flex items-center justify-between space-x-4 pb-5 pt-10">
        <n-space align="center">
          <h3>Changelog</h3>

          <n-tag v-if="collection?.version?.published === false" type="warning">
            draft
          </n-tag>
        </n-space>

        <NuxtLink
          :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/changelog`"
        >
          <n-button size="large" color="black">
            <template #icon>
              <Icon name="mdi:text-box-edit" />
            </template>

            Update changelog
          </n-button>
        </NuxtLink>
      </div>

      <div
        class="prose mt-10 min-h-[300px] max-w-none"
        v-html="markdownToHtml"
      />
    </div>

    <ModalNewCollection />
  </main>
</template>
