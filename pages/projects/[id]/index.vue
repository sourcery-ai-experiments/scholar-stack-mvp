<template>
  <main class="px-4">
    <div class="flex flex-row justify-start space-x-3">
      <div>
        <n-image
          width="250"
          :src="projectImage"
          fallback-src="https://api.dicebear.com/v2/avataaars/seed.svg"
          class="rounded-lg"
        />
      </div>
      <div class="flex flex-col px-4">
        <h1>{{ projectName }}</h1>

        <p class="mt-3 text-lg">{{ projectDescription }}</p>

        <p class="mt-3 text-sm">Created on {{ projectCreated }}</p>
        <p class="mt-3 text-sm">Updated on {{ projectUpdated }}</p>
      </div>
    </div>

    <n-divider />

    <div class="flex flex-row justify-between space-x-8">
      <div class="links-section flex-1">
        <h2>All Links</h2>

        <div
          v-if="allLinks.length <= 0"
          class="flex flex-col items-center justify-center p-4"
        >
          <client-only>
            <Vue3Lottie
              animation-link="https://assets2.lottiefiles.com/packages/lf20_xu9spfum.json"
              :height="200"
              :width="200"
              class="mx-0"
            />
          </client-only>

          <p class="my-4 text-center text-slate-600">
            No links found for this project.
          </p>

          <n-button
            class="mt-4"
            type="primary"
            size="large"
            @click="showAddEditLinkModalFunction"
          >
            Add a link
          </n-button>

          <n-modal
            v-model:show="showAddEditLinkModal"
            transform-origin="center"
            :mask-closable="false"
            class="custom-card"
            preset="card"
            :style="{ width: '600px' }"
            title="Add a link"
            :bordered="false"
            size="huge"
            :segmented="{ footer: 'soft' }"
          >
            <n-form
              ref="newLinkFormRef"
              :model="newLinkFormValue"
              :rules="newLinkFormRules"
              size="large"
            >
              <n-form-item path="target" label="DOI or URL of the resource">
                <n-input
                  v-model:value="newLinkFormValue.target"
                  placeholder="10.26275/yh5c5pjy or https://www.linktodataset.com/"
                >
                  <template #prefix>
                    <Icon name="solar:link-broken" />
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="type" label="Type of the link">
                <n-select
                  v-model:value="newLinkFormValue.type"
                  :options="[
                    {
                      label: 'DOI',
                      value: 'doi',
                    },
                    {
                      label: 'URL',
                      value: 'url',
                    },
                  ]"
                />
              </n-form-item>

              <n-form-item path="name" label="Name of resource">
                <n-input
                  v-model:value="newLinkFormValue.name"
                  placeholder="Primary Dataset"
                  maxlength="50"
                  show-count
                  clearable
                >
                  <template #prefix>
                    <Icon name="gridicons:nametag" />
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="description" label="Description">
                <n-input
                  v-model:value="newLinkFormValue.description"
                  placeholder="Primary Dataset"
                  type="textarea"
                  maxlength="500"
                  show-count
                  clearable
                />
              </n-form-item>
            </n-form>

            <template #footer>
              <div class="flex justify-end space-x-4">
                <n-button size="large" type="primary" @click="addLink">
                  Save Link
                </n-button>
                <n-button
                  size="large"
                  type="error"
                  @click="hideAddEditLinkModalFunction"
                >
                  Cancel
                </n-button>
              </div>
            </template>
          </n-modal>
        </div>
        <div v-else class="flex flex-col p-4">
          <pre>
            {{ allLinks }}
          </pre>

          <n-card v-for="link in allLinks" :key="link.id" :title="link.name">
            <template #header-extra>
              <n-button>Delete item </n-button>
              <n-button>Edit item </n-button>
            </template>
            <div>
              <p>{{ link.description }}</p>
              <p>{{ link.target }}</p>
            </div>
          </n-card>

          <n-button
            class="mt-4 w-max"
            type="primary"
            size="large"
            @click="showAddEditLinkModalFunction"
          >
            Add a link
          </n-button>
        </div>
      </div>

      <div v-show="allVersions.length >= 0" class="versions-section mt-12">
        <n-timeline item-placement="right">
          <n-timeline-item content="Current version" line-type="dashed" />

          <n-timeline-item
            v-for="version in allVersions"
            :key="version.identifier"
            :title="version.name"
            type="success"
            :time="displayLongDate(version.created)"
          >
            <nuxt-link :to="`/projects/${$route.params.id}`">
              bit.ly/{{ $route.params.id }}
            </nuxt-link>
          </n-timeline-item>

          <n-timeline-item
            title="Project Created"
            type="success"
            :time="displayLongDate(projectCreated)"
          >
            <nuxt-link :to="`/projects/${$route.params.id}`">
              bit.ly/{{ $route.params.id }}
            </nuxt-link>
          </n-timeline-item>
        </n-timeline>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { nanoid } from "nanoid";

const route = useRoute();

const projectName = ref("");
const projectDescription = ref("");
const projectImage = ref("");
const projectCreated = ref("");
const projectUpdated = ref("");

const allLinks: Ref<LocalLinkType[]> = ref([]);
const allVersions: Ref<AllVersionsItem[]> = ref([]);

const newLinkFormRef = ref<FormInst | null>(null);
const newLinkFormValue = ref({
  name: "",
  description: "",
  target: "",
  type: "doi",
});
const newLinkFormRules = {
  name: {
    message: "Please add a name for this link.",
    required: true,
    trigger: ["input", "blur"],
  },
  description: {
    message: "Please add a description for this link.",
    required: true,
    trigger: ["input", "blur"],
  },
  target: {
    message: "Please add a target for this link.",
    required: true,
    trigger: ["input", "blur"],
  },
  type: {
    message: "Please add a type for this link.",
    required: true,
    trigger: ["change", "blur"],
  },
};

const showAddEditLinkModal = ref(false);
const showAddEditLinkModalFunction = () => {
  showAddEditLinkModal.value = true;

  newLinkFormValue.value = {
    name: "",
    description: "",
    target: "",
    type: "doi",
  };
};

const hideAddEditLinkModalFunction = () => {
  showAddEditLinkModal.value = false;
};

const addLink = (e: MouseEvent) => {
  e.preventDefault();

  newLinkFormRef.value?.validate((errors) => {
    if (!errors) {
      // save data

      const newLink: LocalLinkType = {
        id: nanoid(),
        name: newLinkFormValue.value.name,

        action: "create",

        description: newLinkFormValue.value.description,
        target: newLinkFormValue.value.target,
        type: newLinkFormValue.value.type as TargetType,
      };

      allLinks.value.push(newLink);

      console.log(allLinks.value);
    } else {
      console.log(errors);
    }
  });
};

const { data, error } = await useFetch(`/api/projects/${route.params.id}`, {
  headers: useRequestHeaders(["cookie"]),
  method: "GET",
});

if (error.value) {
  console.error(error.value);

  // redirect to project not found page

  // navigateTo("/projects/not-found");
}

if (data.value) {
  console.log(data.value);

  projectName.value = data.value.name;
  projectDescription.value = data.value.description;
  projectImage.value = data.value.image;
  projectCreated.value = data.value.created;
  projectUpdated.value = data.value.updated;

  if (data.value.latestVersion) {
    allLinks.value = data.value.latestVersion.links as LinksList;
  }

  if (data.value.allVersions) {
    allVersions.value = data.value.allVersions as AllVersionsType;
  }
}

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Projects",
});
</script>
