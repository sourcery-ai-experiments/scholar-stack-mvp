<script setup lang="ts">
import { useResourceStore } from "@/stores/resource";

definePageMeta({
  layout: "collections-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const resourceStore = useResourceStore();

const gridView = ref(true);
const newResourceLoading = ref(false);

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

const addResource = async () => {
  newResourceLoading.value = true;

  const { data, error } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "POST",
    }
  );

  newResourceLoading.value = false;

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't create a new resource",
    });
  }

  if (data.value) {
    resourceStore.fetchResources(workspaceid, collectionid);

    push.success({
      title: "Success",
      message: "We created a new resource",
    });

    // get the new resource id
    const resourceId = data.value.resourceId;

    // navigate to the new resource
    navigateTo(
      `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceId}/edit`
    );
  }
};
</script>

<template>
  <main class="h-full bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <div class="flex items-center space-x-2">
          <h1>
            {{ collection?.title }}
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
      <div class="flex items-center justify-between space-x-4 py-10">
        <n-input placeholder="Search..." size="large">
          <template #prefix>
            <Icon name="iconamoon:search-duotone" size="20" class="mr-2" />
          </template>
        </n-input>

        <n-radio-group
          v-model:value="gridView"
          name="radiobuttongroup1"
          size="large"
          class="bg-white"
        >
          <n-radio-button :value="true">
            <Icon name="mingcute:grid-line" />
          </n-radio-button>

          <n-radio-button :value="false">
            <Icon name="cil:list" />
          </n-radio-button>
        </n-radio-group>

        <n-button
          size="large"
          color="black"
          :disabled="!collection?.version"
          :loading="newResourceLoading"
          @click="addResource"
        >
          <template #icon>
            <Icon name="mdi:plus" />
          </template>
          Add a new resource
        </n-button>
      </div>

      <div v-if="collection?.version === null" class="debug">
        <p>No Version</p>

        <n-button @click="createNewDraftVersion">
          Create a new draft version</n-button
        >
      </div>

      <div
        v-if="collection?.version && collection?.resources"
        class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="resource in collection?.resources"
          :key="resource.id"
          :to="`/dashboard/workspaces/${workspaceid}/collections/${collection?.id}/resources/${resource.id}`"
          class="flex flex-col space-y-5 rounded-md border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex items-center justify-start space-x-2">
            <n-avatar
              :size="40"
              :src="`https://api.dicebear.com/6.x/notionists-neutral/svg?seed=${resource.id}`"
              class="hover:cursor-pointer hover:opacity-80"
            />

            <div class="flex flex-col space-y-1">
              <span class="text-lg font-medium">
                {{ resource.title || resource.id || "Untitled" }}
              </span>

              <span class="text-sm text-slate-500">
                {{ resource.created }}
              </span>
            </div>
          </div>

          <n-space vertical>
            <n-tag v-if="resource.action">
              {{ resource.action }}
            </n-tag>

            <span>
              {{ resource.description }}
            </span>
          </n-space>
        </NuxtLink>
      </div>
    </div>

    <ModalNewCollection />
  </main>
</template>
