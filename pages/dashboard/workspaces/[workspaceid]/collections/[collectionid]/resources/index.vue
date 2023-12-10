<script setup lang="ts">
import { useResourceStore } from "@/stores/resource";
import { displayLongDate } from "~/utils/displayDates";

definePageMeta({
  layout: "app-layout",
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
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2 lg:px-20"
      >
        <div class="flex items-center space-x-2">
          <h1>Resources</h1>

          <n-tag
            v-if="
              collection && collection.version && !collection.version.published
            "
            type="info"
            size="medium"
          >
            Draft Version
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
              <Icon name="codicon:git-pull-request-draft" />
            </template>
            Create a new {{ !collection?.version ? "draft" : "" }} version
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 pb-20 lg:px-20">
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

      <div
        v-if="collection?.version === null"
        class="rounded-lg border border-dashed px-4 py-8"
      >
        <n-empty size="large" description="No resources found">
          <template #extra>
            <n-button color="black" @click="createNewDraftVersion">
              <template #icon>
                <Icon name="codicon:git-pull-request-draft" />
              </template>
              Create a new draft version
            </n-button>
          </template>
        </n-empty>
      </div>

      <n-space
        v-if="collection?.version && collection?.resources"
        vertical
        :size="20"
      >
        <NuxtLink
          v-for="resource in collection?.resources"
          :key="resource.id"
          :to="
            resource.action === 'delete'
              ? ''
              : `/dashboard/workspaces/${workspaceid}/collections/${collection?.id}/resources/${resource.id}`
          "
          class="flex w-full flex-grow flex-col space-y-5 rounded-md border p-6 shadow-sm transition-all hover:shadow-md"
          :class="{
            'cursor-not-allowed border-red-300 bg-red-50 !shadow-none':
              resource.action === 'delete',
            'border-slate-300 bg-white': resource.action === 'clone',
            'border-blue-300 bg-white': resource.action === 'create',
            'border-teal-400 bg-white': resource.action === 'update',
          }"
        >
          <div class="flex w-full items-center justify-start">
            <div>
              <n-avatar
                :size="40"
                :src="`https://api.dicebear.com/6.x/notionists-neutral/svg?seed=${resource.id}`"
                class="hover:cursor-pointer hover:opacity-80"
              />
            </div>

            <n-divider vertical />

            <div class="flex w-full flex-col space-y-0">
              <n-space justify="space-between">
                <span class="text-lg font-medium">
                  {{ resource.title || resource.id || "Untitled" }}
                </span>

                <n-space align="center">
                  <n-tooltip trigger="hover" placement="bottom-end">
                    <template #trigger>
                      <n-tag
                        v-if="resource.action === 'create'"
                        type="info"
                        size="medium"
                        class="ml-2"
                      >
                        New Resource
                      </n-tag>

                      <n-tag
                        v-if="resource.action === 'delete'"
                        type="error"
                        size="medium"
                        class="ml-2"
                      >
                        Marked for deletion
                      </n-tag>

                      <n-tag
                        v-if="resource.action === 'update'"
                        type="success"
                        size="medium"
                        class="ml-2"
                      >
                        Updated
                      </n-tag>
                    </template>
                    Last modified on {{ displayLongDate(resource.updated) }}
                  </n-tooltip>

                  <n-button
                    v-if="resource.action === 'delete'"
                    type="error"
                    tertiary
                  >
                    <template #icon>
                      <Icon name="mdi:undo" />
                    </template>
                    Undo delete
                  </n-button>
                </n-space>
              </n-space>

              <div class="group flex w-full items-center space-x-1">
                <n-tag
                  v-if="resource.type !== 'url'"
                  type="info"
                  size="small"
                  class=""
                >
                  {{ resource.type }}
                </n-tag>

                <NuxtLink
                  :to="
                    resource.type !== 'url'
                      ? `https://identifiers.org/${resource.type}/${resource.target}`
                      : resource.target
                  "
                  class="font-medium text-blue-600 transition-all group-hover:text-blue-700 group-hover:underline"
                  target="_blank"
                  @click.stop=""
                >
                  {{ resource.target }}
                </NuxtLink>

                <Icon
                  name="mdi:external-link"
                  size="16"
                  class="text-blue-600 transition-all group-hover:text-blue-700 group-hover:underline"
                />
              </div>
            </div>
          </div>

          <p>
            {{ resource.description }}
          </p>
        </NuxtLink>
      </n-space>
    </div>

    <ModalNewCollection />
  </main>
</template>
