<script setup lang="ts">
import calver from "calver";
import { MdEditor } from "md-editor-v3";
import sanitizeHtml from "sanitize-html";
import { useLinkStore } from "@/stores/link";

defineProps({
  latestVersion: {
    required: true,
    type: Boolean,
  },
  projectIdentifier: {
    required: true,
    type: String,
  },
});

const route = useRoute();
const message = useMessage();
const linkStore = useLinkStore();

const showNewVersionModal = ref(false);
const releaseNotes = ref("");

const showLoader = ref(false);

const showAddEditLinkDrawer = ref(false);
const drawerLinkID = ref("");

const allLinks = computed(() => linkStore.links);
const allVersions: Ref<AllVersionsItem[]> = ref([]);

const sanitize = (html: string) => sanitizeHtml(html);

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
      allLinks.value[index].originalAction = allLinks.value[index].action;
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

const undoRemoveLink = (id: string) => {
  const index = allLinks.value.findIndex((link) => link.id === id);

  if (index !== -1) {
    if (allLinks.value[index].origin === "remote") {
      const originalAction = allLinks.value[index].originalAction;

      if (originalAction) {
        allLinks.value[index].action = originalAction;
      } else {
        delete allLinks.value[index].action;
      }
    } else {
      allLinks.value.splice(index, 1);
    }
  }

  message.success("Link restored.");
  console.log(allLinks.value);
};

const hideNewVersionModalFunction = () => {
  showNewVersionModal.value = false;
};

const publishChangesToProject = async (skipNotes = false) => {
  if (!skipNotes) {
    if (releaseNotes.value.trim() === "") {
      message.error("You must add release notes before publishing.");

      return;
    }
  }

  showLoader.value = true;

  try {
    const body = {
      links: allLinks.value.map((link) => {
        return {
          id: link.id,
          name: link.name,
          action: link.action,
          description: link.description,
          icon: link.icon,
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
        showLoader.value = false;
        showNewVersionModal.value = false;

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
    showLoader.value = false;

    console.error(error);
    message.error("Something went wrong, please try again later");
  }
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

      const latestVersionName =
        (allVersions.value.length > 0 ? allVersions.value[0].name : "") || "";

      console.log(latestVersionName);

      const releaseVersion = calver.inc(
        "yyyy.ww.minor",
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
            link.original?.target +
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

const showAddEditLinkDrawerFunction = (linkID: string) => {
  showAddEditLinkDrawer.value = true;

  if (linkID === "new") {
    drawerLinkID.value = "new";
  } else {
    drawerLinkID.value = linkID;
  }
};

const hideAddEditLinkDrawerFunction = () => {
  showAddEditLinkDrawer.value = false;
};
</script>

<template>
  <div>
    <n-divider v-if="allLinks.length > 0" class="hidden" />

    <div
      v-if="allLinks.length <= 0"
      class="flex flex-col items-center justify-center rounded-lg border border-slate-200 px-3 pb-8 shadow-sm"
    >
      <div class="h-[200px] w-[200px]">
        <client-only>
          <Vue3Lottie
            animation-link="https://assets2.lottiefiles.com/packages/lf20_xu9spfum.json"
            :height="200"
            :width="200"
            class="mx-0"
          />
        </client-only>
      </div>

      <p class="my-4 text-center text-slate-600">
        No resources found for this project.
      </p>

      <n-button
        type="primary"
        size="large"
        class="mt-4"
        :loading="showLoader"
        @click="showAddEditLinkDrawerFunction('new')"
      >
        <template #icon>
          <Icon name="carbon:add-filled" />
        </template>
        Add a resource
      </n-button>
    </div>
    <div v-else class="flex flex-col px-2 py-4">
      <n-list>
        <n-list-item v-for="link in allLinks" :key="link.id">
          <n-thing class="px-1 py-2" content-indented>
            <template #avatar>
              <Icon
                :name="link.icon"
                size="25"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              />
            </template>

            <template #header>
              <h4
                class="font-extrabold"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              >
                {{ link.name }}
              </h4>
            </template>

            <template #header-extra>
              <div class="flex items-center justify-end space-x-4">
                <n-tag
                  v-if="link.action === 'create'"
                  :bordered="false"
                  type="success"
                >
                  New
                </n-tag>
                <n-tag
                  v-if="
                    link.action === 'update' || link.action === 'target_update'
                  "
                  :bordered="false"
                  type="success"
                >
                  Edited
                </n-tag>
                <n-tag
                  v-if="link.action === 'delete'"
                  :bordered="false"
                  type="error"
                >
                  Marked for deletion
                </n-tag>

                <Icon
                  v-if="link.origin === 'remote'"
                  name="material-symbols:cloud"
                  size="25"
                  :class="{
                    'cursor-not-allowed opacity-70 transition-all':
                      link.action === 'delete',
                  }"
                />

                <Icon
                  :name="link.type === 'doi' ? 'academicons:doi' : 'uil:link'"
                  size="25"
                  :class="{
                    'cursor-not-allowed opacity-70 transition-all':
                      link.action === 'delete',
                  }"
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
            </template>

            <template #description>
              <a
                :href="link.target"
                rel="noopener"
                target="_blank"
                class="font-semibold transition-all hover:text-primary hover:underline"
                :class="{
                  'cursor-not-allowed opacity-70 transition-all':
                    link.action === 'delete',
                }"
              >
                {{ link.target }}</a
              >
            </template>

            <p
              :class="{
                'cursor-not-allowed opacity-70 transition-all':
                  link.action === 'delete',
              }"
            >
              {{ link.description }}
            </p>

            <template #action>
              <div class="flex items-center justify-between pb-2 pt-3">
                <n-button
                  v-if="latestVersion"
                  type="primary"
                  secondary
                  strong
                  :disabled="link.action === 'delete'"
                  @click="showAddEditLinkDrawerFunction(link.id)"
                >
                  <template #icon>
                    <Icon name="material-symbols:edit" />
                  </template>
                  Edit
                </n-button>

                <n-popconfirm
                  v-if="
                    latestVersion &&
                    link.action !== 'delete' &&
                    link.origin === 'remote'
                  "
                  @positive-click="removeLink(link.id)"
                >
                  <template #trigger>
                    <n-button type="error" secondary strong>
                      <template #icon>
                        <Icon name="material-symbols:delete" />
                      </template>
                      Remove from project
                    </n-button>
                  </template>

                  Do you want to remove this resource from your project?
                </n-popconfirm>

                <n-button
                  v-if="
                    latestVersion &&
                    link.action === 'delete' &&
                    link.origin === 'remote'
                  "
                  type="error"
                  secondary
                  strong
                  @click="undoRemoveLink(link.id)"
                >
                  <template #icon>
                    <Icon name="material-symbols:delete" />
                  </template>
                  Undo remove
                </n-button>

                <n-popconfirm
                  v-if="
                    latestVersion &&
                    link.action !== 'delete' &&
                    link.origin === 'local'
                  "
                  @positive-click="removeLink(link.id)"
                >
                  <template #trigger>
                    <n-button type="error" secondary strong>
                      <template #icon>
                        <Icon name="material-symbols:delete" />
                      </template>
                      Delete
                    </n-button>
                  </template>

                  <p class="py-1">
                    <span class="text-base font-medium">
                      Do you still want to delete this resource?
                    </span>
                    <br />
                    <span class="text-xs">
                      This is a permanent action and cannot be undone.
                    </span>
                  </p>
                </n-popconfirm>
              </div>
            </template>
          </n-thing>
        </n-list-item>

        <template #footer>
          <div class="flex justify-between space-x-4">
            <n-button
              v-if="latestVersion"
              type="primary"
              size="large"
              @click="showAddEditLinkDrawerFunction('new')"
            >
              <template #icon>
                <Icon name="carbon:add-filled" />
              </template>

              Add another resource
            </n-button>

            <n-button
              v-if="latestVersion"
              type="primary"
              size="large"
              :loading="showLoader"
              @click="checkForChangesToLinks"
            >
              <template #icon>
                <Icon name="material-symbols:save-as" />
              </template>
              Save changes
            </n-button>
          </div>
        </template>
      </n-list>
    </div>

    <n-drawer
      v-model:show="showAddEditLinkDrawer"
      default-width="40%"
      placement="right"
      :mask-closable="false"
      :close-on-esc="false"
      :resizable="true"
      :auto-focus="true"
      class="min-w-[450px]"
    >
      <DrawerAddEditLink
        :hide-add-edit-link-drawer-function="hideAddEditLinkDrawerFunction"
        :project-identifier="projectIdentifier"
        :link-identifier="drawerLinkID"
      />
    </n-drawer>

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
        :class="{
          'opacity-75': showLoader,
          'cursor-not-allowed': showLoader,
        }"
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
            :loading="showLoader"
            @click="publishChangesToProject(false)"
          >
            <template #icon>
              <Icon name="fluent:form-new-48-filled" />
            </template>
            Create new version
          </n-button>

          <n-button
            size="large"
            type="error"
            :disabled="showLoader"
            @click="hideNewVersionModalFunction"
          >
            <template #icon>
              <Icon name="material-symbols:cancel" />
            </template>
            Cancel
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
