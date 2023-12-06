<script setup lang="ts">
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
          <div class="flex items-center justify-start space-x-2">
            <h1>
              {{ collection?.title || "Untitled Collection" }}
            </h1>

            <n-tag
              v-if="
                collection &&
                collection.version &&
                !collection.version.published
              "
              type="info"
              size="medium"
            >
              Draft Version
            </n-tag>

            <n-tag
              v-if="
                collection && collection.version && collection.version.published
              "
              type="success"
            >
              {{ collection?.version?.name || "" }}
            </n-tag>
          </div>

          <n-space align="center">
            <NuxtLink
              :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/publish`"
              class="hidden"
            >
              <n-button
                v-if="collection?.version && !collection?.version.published"
                size="large"
                color="black"
              >
                <template #icon>
                  <Icon name="solar:star-bold" />
                </template>
                Publish collection
              </n-button>
            </NuxtLink>

            <n-button
              v-if="collection?.version?.published || !collection?.version"
              size="large"
              color="black"
              @click="createNewDraftVersion"
            >
              <template #icon>
                <Icon name="carbon:intent-request-create" />
              </template>
              Prepare a draft version
            </n-button>
          </n-space>
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
    </div>

    <ModalNewCollection />
  </main>
</template>
