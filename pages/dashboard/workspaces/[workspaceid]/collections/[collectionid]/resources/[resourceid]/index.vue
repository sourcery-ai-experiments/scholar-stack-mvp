<script setup lang="ts">
import { Icon } from "#components";

definePageMeta({
  layout: "resources-layout",
  middleware: ["auth"],
});

/**
 * TODO: split this into three pages
 * 1. overview with the root url
 * 2. edit page with the form
 * 3. relation page with the relations (too complex for one page alone)
 */

const push = usePush();
const route = useRoute();

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

const { data: relations, pending: relationsPending } = useLazyFetch(
  `/api/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

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
  <main class="h-full bg-white">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <n-space vertical>
          <h1>{{ resource?.title || resource?.id }}</h1>

          <n-tag v-if="resource?.back_link_id" type="info" size="large">
            {{ resource?.back_link_id }}
          </n-tag>
        </n-space>

        <div class="flex items-center space-x-2">
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

            Remove
          </n-button>

          <n-button
            v-if="resource?.orignal_resource_id"
            color="black"
            size="large"
            :loading="newResourceVersionLoadingIndicator"
            @click="createNewVersion"
          >
            <template #icon>
              <Icon name="iconoir:axes" />
            </template>

            Create new version
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      <div class="flex items-center justify-between space-x-4 pb-5 pt-10">
        <h3>About</h3>

        <n-space>
          <NuxtLink
            :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/edit`"
          >
            <n-button>
              <template #icon>
                <Icon name="iconoir:axes" />
              </template>

              Edit resource
            </n-button>
          </NuxtLink>

          <NuxtLink
            :to="`/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${resourceid}/relations/edit`"
          >
            <n-button>
              <template #icon>
                <Icon name="iconoir:axes" />
              </template>

              Update relations
            </n-button>
          </NuxtLink>
        </n-space>
      </div>

      <p>
        {{ resource?.description || "No description available" }}
      </p>

      <pre>{{ resource }}</pre>

      <h3>Relations</h3>

      <transition name="fade" mode="out-in">
        <div v-if="relationsPending">
          <client-only>
            <Vue3Lottie
              animation-link="https://assets10.lottiefiles.com/packages/lf20_AQEOul.json"
              :height="200"
              :width="200"
            />
          </client-only>
        </div>

        <div v-else>
          <pre>
            {{ relations }}
          </pre>
        </div>
      </transition>
    </div>

    <ModalNewCollection />
  </main>
</template>
