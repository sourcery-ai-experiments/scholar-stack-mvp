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
        <h2 v-if="allLinks.length > 0" class="px-4">All Links</h2>

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
            @click="showAddEditLinkModalFunction()"
          >
            Add a link
          </n-button>
        </div>
        <div v-else class="flex flex-col p-4">
          <n-card
            v-for="link in allLinks"
            :key="link.id"
            :title="link.name"
            class="my-2"
          >
            <template #header-extra>
              <div class="flex flex-row space-x-4">
                <n-popconfirm @positive-click="removeLink(link.id)">
                  <template #trigger>
                    <n-button type="warning">Delete item </n-button>
                  </template>
                  Do you want to delete this item?
                </n-popconfirm>
              </div>
            </template>
            <div class="">
              <p>{{ link.description }}</p>
              <p>{{ link.target }}</p>
            </div>

            <template #footer>
              <div class="flex items-center justify-between">
                <Icon
                  v-if="link.action === 'create'"
                  name="ic:baseline-fiber-new"
                  size="25"
                />
                <Icon
                  v-if="link.action === 'update'"
                  name="bx:edit"
                  size="25"
                />

                <n-button
                  type="primary"
                  size="large"
                  @click="showAddEditLinkModalFunction(link.id)"
                >
                  Edit item
                </n-button>
              </div>
            </template>
          </n-card>

          <n-button
            class="mt-4 w-max"
            type="primary"
            size="large"
            @click="showAddEditLinkModalFunction()"
          >
            Add a link
          </n-button>

          <n-divider />

          <div class="flex items-center justify-end">
            <n-button
              type="primary"
              size="large"
              @click="checkForChangesToLinks"
            >
              Save changes
            </n-button>
          </div>
        </div>
      </div>

      <div v-show="allVersions.length >= 0" class="versions-section mt-14">
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
              :disabled="newLinkFormValue.origin === 'remote'"
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
              rows="5"
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

      <n-modal
        v-model:show="showNewVersionModal"
        transform-origin="center"
        :mask-closable="false"
        class="custom-card"
        preset="card"
        :style="{ width: '80%' }"
        title="Accept/Edit release notes"
        :bordered="false"
        size="huge"
        :segmented="{ footer: 'soft' }"
      >
        <MdEditor v-model="releaseNotes" language="en-US" />

        <template #footer>
          <div class="flex justify-end space-x-4">
            <n-button size="large" type="primary" @click="addLink">
              Create new version
            </n-button>
            <n-button
              size="large"
              type="error"
              @click="hideNewVersionModalFunction"
            >
              Cancel
            </n-button>
          </div>
        </template>
      </n-modal>

      <n-button @click="showNewVersionModal = true"> open modal </n-button>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { useMessage } from "naive-ui";
import { nanoid } from "nanoid";
import { faker } from "@faker-js/faker";
import { MdEditor } from "md-editor-v3";

const route = useRoute();
const message = useMessage();

const projectName = ref("");
const projectDescription = ref("");
const projectImage = ref("");
const projectCreated = ref("");
const projectUpdated = ref("");

const allLinks: Ref<LocalLinkType[]> = ref([]);
const allVersions: Ref<AllVersionsItem[]> = ref([]);

const newLinkFormRef = ref<FormInst | null>(null);
const newLinkFormValue = ref({
  id: "",
  name: "",
  description: "",
  origin: "local",
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
const showAddEditLinkModalFunction = (linkId = "") => {
  showAddEditLinkModal.value = true;

  if (linkId === "") {
    newLinkFormValue.value = {
      id: "",
      name: faker.git.commitMessage(),
      description: faker.word.words({ count: { max: 100, min: 50 } }),
      origin: "local",
      target: faker.internet.url(),
      type: "doi",
    };
  } else {
    const link = allLinks.value.find((link) => link.id === linkId);

    newLinkFormValue.value = {
      id: link?.id || "",
      name: link?.name || "",
      description: link?.description || "",
      origin: link?.origin || "local",
      target: link?.target || "",
      type: link?.type || "doi",
    };
  }
};

const hideAddEditLinkModalFunction = () => {
  showAddEditLinkModal.value = false;
};

const addLink = (e: MouseEvent) => {
  e.preventDefault();

  newLinkFormRef.value?.validate((errors) => {
    if (!errors) {
      // save data

      if (newLinkFormValue.value.id === "") {
        const newLink: LocalLinkType = {
          id: nanoid(),
          name: newLinkFormValue.value.name,

          action: "create",

          description: newLinkFormValue.value.description,
          target: newLinkFormValue.value.target,
          type: newLinkFormValue.value.type as TargetType,
        };

        allLinks.value.push(newLink);
      } else {
        const index = allLinks.value.findIndex(
          (link) => link.id === newLinkFormValue.value.id
        );

        if (index !== -1) {
          if (allLinks.value[index].origin === "remote") {
            if (
              allLinks.value[index].target !== newLinkFormValue.value.target
            ) {
              allLinks.value[index].action = "target_update";
            } else {
              allLinks.value[index].action = "update";
            }
          }

          allLinks.value[index].name = newLinkFormValue.value.name;
          allLinks.value[index].description =
            newLinkFormValue.value.description;
          allLinks.value[index].target = newLinkFormValue.value.target;
          allLinks.value[index].type = newLinkFormValue.value
            .type as TargetType;
        }
      }

      showAddEditLinkModal.value = false;

      console.log(allLinks.value);
    } else {
      console.log(errors);
    }
  });
};

const removeLink = (id: string) => {
  if (allLinks.value.length === 1) {
    message.error("You must have at least one link.");

    return;
  }

  const index = allLinks.value.findIndex((link) => link.id === id);

  if (index !== -1) {
    allLinks.value.splice(index, 1);
  }

  message.success("Link removed.");

  if (allLinks.value.length === 1) {
    message.warning(
      "You must have at least one link for this version to be valid."
    );
  }
};

const showNewVersionModal = ref(false);
const releaseNotes = ref("");

const hideNewVersionModalFunction = () => {
  showNewVersionModal.value = false;
};

const checkForChangesToLinks = () => {
  // save changes to links
  console.log(allLinks.value);

  showNewVersionModal.value = allLinks.value.some((link) => {
    if (link.action === "create") {
      return true;
    }
    if (link.action === "target_update") {
      return true;
    }
    return false;
  });

  if (showNewVersionModal.value) {
    /**
     * TODO: generate release notes
     *   */
  }

  const requestBody = {
    links: allLinks.value.map((link) => {
      return {
        id: link.id,
        name: link.name,
        description: link.description,
        target: link.target,
        type: link.type,
      };
    }),
    projectId: route.params.id,
  };
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

    // add origin key to links
    allLinks.value = allLinks.value.map((link) => {
      return {
        ...link,
        origin: "remote",
      };
    });
  }

  if (data.value.allVersions) {
    allVersions.value = data.value.allVersions as AllVersionsType;
  }
}

useSeoMeta({
  title: "Projects",
});
</script>
