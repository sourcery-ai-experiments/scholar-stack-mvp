<template>
  <main class="px-12">
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
                <n-popconfirm
                  v-if="latestVersion"
                  @positive-click="removeLink(link.id)"
                >
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
                <div class="flex items-center justify-start space-x-4">
                  <Icon
                    v-if="link.origin === 'remote'"
                    name="material-symbols:cloud"
                    size="25"
                  />

                  <Icon
                    :name="link.type === 'doi' ? 'academicons:doi' : 'uil:link'"
                    size="25"
                  />

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
                  <Icon
                    v-if="link.action === 'target_update'"
                    name="fluent:box-edit-24-regular"
                    size="25"
                  />
                </div>

                <n-button
                  v-if="latestVersion"
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
            :class="{
              'rounded-xl bg-gray-50 pt-4':
                version.identifier === $route.params.videntifier,
            }"
          >
            <template #header>
              {{ version.name }}
            </template>

            <nuxt-link
              :to="`/projects/${$route.params.pidentifier}/version/${version.identifier}`"
            >
              bit.ly/{{ version.identifier }}
            </nuxt-link>
          </n-timeline-item>

          <n-timeline-item
            title="Project Created"
            type="success"
            :time="displayLongDate(projectCreated)"
          >
            <nuxt-link :to="`/projects/${$route.params.pidentifier}`">
              bit.ly/{{ $route.params.pidentifier }}
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
        :bordered="false"
        size="huge"
        :segmented="{ footer: 'soft' }"
      >
        <template #header>
          <div class="flex flex-col">
            <span> Release Notes </span>

            <span class="pt-2 text-sm font-normal text-slate-700">
              The changes to your project will automatically release a new
              version. You can add release notes to describe the changes below.
            </span>
            <span class="text-sm font-normal text-slate-700">
              These notes cannot be edited after the version is released.
            </span>
            <span class="text-sm font-normal"> </span>
          </div>
        </template>

        <MdEditor
          v-model="releaseNotes"
          class="mt-0"
          language="en-US"
          preview-theme="github"
          :show-code-row-number="true"
          :sanitize="sanitize"
        />

        <template #footer>
          <div class="flex justify-end space-x-4">
            <n-button
              size="large"
              type="primary"
              @click="publishChangesToProject(false)"
            >
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
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import { useMessage } from "naive-ui";
import { nanoid } from "nanoid";
import { faker } from "@faker-js/faker";
import { MdEditor } from "md-editor-v3";
import calver from "calver";
import sanitizeHtml from "sanitize-html";
import { isEmpty } from "lodash-es";

/**
 * TODO: add a custom toolbar to the editor
 * TODO: Change the links section into an accordian
 */

const route = useRoute();
const message = useMessage();

const projectIdentifier = route.params.pidentifier;
const versionIdentifier = route.params.videntifier;

const projectName = ref("");
const projectDescription = ref("");
const projectImage = ref("");
const projectCreated = ref("");
const projectUpdated = ref("");

const latestVersion = ref(false);

const showAddEditLinkModal = ref(false);
const showNewVersionModal = ref(false);

const releaseNotes = ref("");

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

const sanitize = (html: string) => sanitizeHtml(html);

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
          id: `local${nanoid()}`,
          name: newLinkFormValue.value.name,

          action: "create",

          description: newLinkFormValue.value.description,
          origin: "local",

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

/**
 * TODO: hide removed links
 */

const removeLink = (id: string) => {
  if (allLinks.value.length === 1) {
    message.error("You must have at least one link.");

    return;
  }

  const index = allLinks.value.findIndex((link) => link.id === id);

  if (index !== -1) {
    if (allLinks.value[index].origin === "local") {
      allLinks.value.splice(index, 1);
    } else {
      allLinks.value[index].action = "delete";
    }
  }

  message.success("Link removed.");

  if (allLinks.value.length === 1) {
    message.warning(
      "You must have at least one link for this version to be valid."
    );
  }
};

const hideNewVersionModalFunction = () => {
  showNewVersionModal.value = false;
};

const checkForChangesToLinks = () => {
  // save changes to links
  console.log(allLinks.value);

  showNewVersionModal.value = allLinks.value.some((link) => {
    if (
      link.action === "create" ||
      link.action === "target_update" ||
      link.action === "delete"
    ) {
      return true;
    }
    return false;
  });

  if (showNewVersionModal.value) {
    const added: LocalLinkType[] = [];
    const updated: LocalLinkType[] = [];
    const removed: LocalLinkType[] = [];

    allLinks.value.forEach((link) => {
      if (link.action === "create") {
        added.push(link);
      } else if (link.action === "target_update") {
        updated.push(link);
      } else if (link.action === "delete") {
        removed.push(link);
      }
    });

    // Only generate release notes if there are no release notes
    if (releaseNotes.value === "") {
      let changelog = "";

      const latestVersionName = allVersions.value[0].name || "";

      console.log(latestVersionName);

      const releaseVersion = calver.inc(
        "yy.mm.minor",
        latestVersionName,
        "calendar.minor"
      );

      let header = `# Changelog \n \n`;

      header += `All notable changes to this project are documented here. `;
      header += `This project uses [CalVer](https://calver.org/) for versioning. \n \n`;

      header += `## Version ${releaseVersion} \n \n`;

      changelog = header;

      if (added.length > 0) {
        const addedHeader = `### Added \n \n`;

        let addedContent = "";

        added.forEach((link) => {
          addedContent += `- Added a reference to [${link.name}](${link.target}). \n`;
        });

        addedContent += "\n";

        changelog += addedHeader + addedContent;
      }

      if (updated.length > 0) {
        const updatedHeader = `### Updated \n \n`;

        let updatedContent = "";

        updated.forEach((link) => {
          /**
           * * Somehow adding backticks in a template literal breaks the page rendering
           * ? Might need to look into this later
           */
          updatedContent +=
            "- Updated the link reference of `" +
            link.name +
            "` from `" +
            link.originalTarget +
            "` to `" +
            link.target +
            "`. \n";
        });

        updatedContent += "\n";

        changelog += updatedHeader + updatedContent;
      }

      if (removed.length > 0) {
        const removedHeader = `### Removed \n \n`;

        let removedContent = "";

        removed.forEach((link) => {
          removedContent += `- Removed the link reference of [${link.name}](${link.target}). \n`;
        });

        removedContent += "\n";

        changelog += removedHeader + removedContent;
      }

      releaseNotes.value = changelog;
    }
  } else {
    publishChangesToProject(true);
  }
};

const publishChangesToProject = async (skipNotes = false) => {
  if (!skipNotes) {
    if (releaseNotes.value.trim() === "") {
      message.error("You must add release notes before publishing.");

      return;
    }
  }

  try {
    const body = {
      links: allLinks.value.map((link) => {
        return {
          id: link.id,
          name: link.name,
          action: link.action,
          description: link.description,
          target: link.target,
          type: link.type,
        };
      }),
      releaseNotes: releaseNotes.value || "No release notes provided",
    };

    console.log(body);

    const { data, error } = await useFetch(
      `/api/projects/${route.params.pidentifier}`,
      {
        body: JSON.stringify(body),
        headers: useRequestHeaders(["cookie"]),
        method: "POST",
      }
    );

    console.log("data", data.value);

    if (error.value) {
      const errorMessage = error.value.data.message;
      throw new Error(errorMessage);
    }

    const response = data.value;

    if (response && "body" in response) {
      const responseBody: ResponseProjectVersionAddEdit = JSON.parse(
        response.body as string
      );

      if (responseBody) {
        if (responseBody.status === "new-version-created") {
          message.success("New version created successfully");

          navigateTo(
            `/projects/${route.params.pidentifier}/version/${responseBody.identifier}`
          );
        }

        if (responseBody.status === "no-new-version") {
          message.success(
            "Your changes were saved successfully. Please wait while we sync your data."
          );

          setTimeout(() => {
            // reload the page
            navigateTo(`/projects/${route.params.pidentifier}`);
          }, 1000);
        }
      }
    }
  } catch (error) {
    console.error(error);
    message.error("Something went wrong, please try again later");
  }
};

if (versionIdentifier === "new") {
  const { data, error } = await useFetch(`/api/projects/${projectIdentifier}`, {
    headers: useRequestHeaders(["cookie"]),
    method: "GET",
  });

  if (error.value) {
    console.error(error.value);

    // navigateTo("/404");
  }

  if (data.value && "latestVersion" in data.value) {
    const projectData = data.value;

    projectName.value = projectData.name;
    projectDescription.value = projectData.description;
    projectImage.value = projectData.image;
    projectCreated.value = projectData.created;
    projectUpdated.value = projectData.updated;

    if (!isEmpty(projectData.latestVersion)) {
      navigateTo(
        `/projects/${projectIdentifier}/version/${projectData.latestVersion}`
      );
    } else {
      // show new UI
    }
  }
} else {
  const { data, error } = await useFetch(
    `/api/projects/${projectIdentifier}/version/${versionIdentifier}`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "GET",
    }
  );

  if (error.value) {
    console.error(error.value);

    navigateTo("/404");
  }

  if (data.value && "name" in data.value) {
    const projectData = data.value;

    projectName.value = projectData.name;
    projectDescription.value = projectData.description;
    projectImage.value = projectData.image;
    projectCreated.value = projectData.created;
    projectUpdated.value = projectData.updated;

    if (projectData.versionDetails) {
      if ("latest" in projectData.versionDetails) {
        latestVersion.value = projectData.versionDetails.latest;
      }

      if ("links" in projectData.versionDetails) {
        allLinks.value = projectData.versionDetails.links as LocalLinkType[];
      }

      // add origin key to links
      allLinks.value = allLinks.value.map((link) => {
        return {
          ...link,
          origin: "remote",
          originalTarget: link.target,
        };
      });
    }

    if (projectData && "versions" in projectData) {
      allVersions.value = projectData.versions as AllVersionsType;
    }
  }
}

useSeoMeta({
  title: "Projects",
});
</script>
