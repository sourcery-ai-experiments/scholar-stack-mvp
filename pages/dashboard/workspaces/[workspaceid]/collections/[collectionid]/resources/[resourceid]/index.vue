<script setup lang="ts">
import { useResourceStore } from "@/stores/resource";
import { Icon } from "#components";
import PREFIX_JSON from "@/assets/json/prefix.json";
import { displayLongDate } from "~/utils/displayDates";

definePageMeta({
  layout: "app-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const resourceStore = useResourceStore();

const devMode = process.env.NODE_ENV === "development";

const removeResourceLoadingIndicator = ref(false);
const newResourceVersionLoadingIndicator = ref(false);

const { collectionid, resourceid, workspaceid } = route.params as {
  collectionid: string;
  resourceid: string;
  workspaceid: string;
};

const { data: resource, error } = await useFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your resource",
  });

  navigateTo(
    `/dashboard/workspaces/${workspaceid}/collections/${collectionid}`
  );
}

if (resource.value) {
  // If the resource is marked for deletion, redirect the user
  // to the collection page
  if (
    resource.value.action === "delete" ||
    resource.value.action === "oldVersion"
  ) {
    push.error({
      title: "Resource marked for deletion",
      message: "You will need to undelete this resource before you can view it",
    });

    navigateTo(
      `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources`
    );

    throw new Error("Resource marked for deletion");
  }
}

const resourceType = computed(() => {
  if (!resource.value) {
    return "Unknown";
  }

  const type = resource.value.type;

  if (type === "url") {
    return "URL";
  }

  const prefix = PREFIX_JSON.find((prefix) => prefix.value === type);

  if (prefix) {
    return prefix.label;
  }

  return "Unknown";
});

const removeResource = async () => {
  removeResourceLoadingIndicator.value = true;

  const { data, error } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "DELETE",
    }
  );

  removeResourceLoadingIndicator.value = false;

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't delete your resource",
    });
  }

  if (data.value) {
    push.success({
      title: "Resource deleted",
      message: "Your resource has been deleted",
    });

    navigateTo(
      `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources`
    );
  }
};

const createNewVersion = async () => {
  const body = { back_link_id: resourceid };

  newResourceVersionLoadingIndicator.value = true;

  const { data, error } = await useFetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/new-version`,
    {
      body: JSON.stringify(body),
      headers: useRequestHeaders(["cookie"]),
      method: "POST",
    }
  );

  newResourceVersionLoadingIndicator.value = false;

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't create a new version of your resource",
    });

    throw new Error("Something went wrong");
  }

  if (data.value) {
    resourceStore.fetchResources(workspaceid, collectionid);

    push.success({
      title: "Success",
      message: "A new version of your resource has been created",
    });

    navigateTo(
      `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${data.value.resourceId}`
    );
  }
};
</script>

<template>
  <main class="bg-white">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <n-space vertical class="w-full">
          <n-space justify="space-between">
            <h1>Overview</h1>

            <div class="flex items-center space-x-2">
              <NuxtLink
                :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/edit`"
              >
                <n-button ghost size="large">
                  <template #icon>
                    <Icon name="tabler:edit" />
                  </template>

                  Edit resource
                </n-button>
              </NuxtLink>

              <NuxtLink
                :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations/edit`"
              >
                <n-button ghost size="large">
                  <template #icon>
                    <Icon name="carbon:chart-relationship" />
                  </template>

                  Edit relations
                </n-button>
              </NuxtLink>

              <n-button
                v-if="
                  resource?.original_resource_id &&
                  resource?.action !== 'newVersion'
                "
                ghost
                size="large"
                :loading="newResourceVersionLoadingIndicator"
                @click="createNewVersion"
              >
                <template #icon>
                  <Icon name="material-symbols:conversion-path" />
                </template>

                Create new version
              </n-button>

              <n-button
                size="large"
                type="error"
                secondary
                :loading="removeResourceLoadingIndicator"
                @click="removeResource"
              >
                <template #icon>
                  <Icon name="iconoir:trash" />
                </template>

                Delete resource
              </n-button>
            </div>
          </n-space>

          <n-space v-if="resource?.back_link_id" align="center">
            <span class="font-medium text-slate-500">Derived from</span>

            <n-tag type="info" size="small">
              {{ resource?.back_link_id }}
            </n-tag>
          </n-space>
        </n-space>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <div class="flex items-center justify-between space-x-4 pt-10">
        <h3>About</h3>

        <NuxtLink
          :to="
            resource?.type !== 'url'
              ? `https://identifiers.org/${resource?.type}/${resource?.target}`
              : resource.target
          "
          target="_blank"
        >
          <n-button color="black" size="large">
            <template #icon>
              <Icon name="iconoir:internet" />
            </template>

            Visit resource
          </n-button>
        </NuxtLink>
      </div>

      <h4 class="pb-2 pt-5">Title</h4>

      <p class="text-lg">{{ resource?.title || "No title provided" }}</p>

      <h4 class="pb-2 pt-5">Description</h4>

      <p class="text-lg">
        {{ resource?.description || "No description available" }}
      </p>

      <h4 class="pb-2 pt-5">Type</h4>

      <p class="text-lg">{{ resourceType }}</p>

      <h4 class="pb-2 pt-5">Identifier</h4>

      <p class="text-lg">{{ resource?.target || "No identifier provided" }}</p>

      <h4 v-if="resource?.back_link_id" class="pb-2 pt-5">Derived from</h4>

      <p v-if="resource?.back_link_id" class="text-lg">
        {{ resource?.back_link_id }}
      </p>

      <h4 class="pb-2 pt-5">Created on</h4>

      <p class="text-lg">
        {{ displayLongDate(resource?.created as string) }}
      </p>

      <h4 class="pb-2 pt-5">Last updated on</h4>

      <p class="text-lg">
        {{ displayLongDate(resource?.updated as string) }}
      </p>

      <pre v-if="devMode" class="pt-10">{{ resource }}</pre>
    </div>

    <ModalNewCollection />
  </main>
</template>
