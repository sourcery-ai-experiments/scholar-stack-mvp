<script setup lang="ts">
const push = usePush();

const modalIsOpen = ref(false);

const workspaceName = ref("");
const workspaceDescription = ref("");

const { workspaceid } = useRoute().params as { workspaceid: string };

const { data: workspace, error } = await useFetch(
  `/api/workspaces/${workspaceid}`,
  {
    headers: useRequestHeaders(["cookie"]),
  }
);

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your workspace details",
  });

  navigateTo("/dashboard");
}

if (workspace.value) {
  workspaceName.value = workspace.value.title;
  workspaceDescription.value = workspace.value.description;
}

const closeModal = () => {
  modalIsOpen.value = false;
};

const openModal = () => {
  modalIsOpen.value = true;
};

const updateWorkspaceDetails = async () => {
  const { data, error } = await useFetch(`/api/workspaces/${workspaceid}`, {
    body: JSON.stringify({
      title: workspaceName.value.trim(),
      description: workspaceDescription.value.trim(),
    }),
    headers: useRequestHeaders(["cookie"]),
    method: "PUT",
  });

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "We couldn't update your workspace details",
    });
  }

  if (data.value) {
    push.success({
      title: "Success",
      message:
        "Your workspace details have been updated. Please wait for a few seconds to see the changes.",
    });

    window.location.reload();
  }
};
</script>

<template>
  <div class="flex flex-col space-y-4">
    <CardWithAction title="Workspace Name">
      <p class="my-3 text-sm">
        This is the name of your workspace. You can change it to anything you
        want.
      </p>

      <n-input
        v-model:value="workspaceName"
        placeholder="Workspace Name"
        class="w-full"
        size="large"
      />

      <template #action>
        <div class="flex items-center justify-end">
          <n-button
            type="primary"
            color="black"
            :disabled="workspaceName.trim() === ''"
            @click="updateWorkspaceDetails"
          >
            Save
          </n-button>
        </div>
      </template>
    </CardWithAction>

    <CardWithAction title="Description">
      <p class="my-3 text-sm">
        This is the description of your workspace. You can change it to anything
        you want.
      </p>

      <n-input
        v-model:value="workspaceDescription"
        placeholder="Workspace Description"
        class="w-full"
        type="textarea"
        size="large"
      />

      <template #action>
        <div class="flex items-center justify-end">
          <n-button
            type="primary"
            color="black"
            :disabled="workspaceName.trim() === ''"
            @click="updateWorkspaceDetails"
          >
            Save
          </n-button>
        </div>
      </template>
    </CardWithAction>

    <CardWithAction title="Delete workspace">
      <p class="my-3 text-sm">
        Permanently remove your workspace and all of its contents from the
        platform. This action is not reversible, so please continue with
        caution.
      </p>

      <template #action>
        <div class="flex items-center justify-end">
          <n-button type="error" @click="openModal"> Delete </n-button>
        </div>
      </template>
    </CardWithAction>

    <HeadlessTransitionRoot appear :show="modalIsOpen" as="template">
      <HeadlessDialog as="div" class="relative z-10" @close="closeModal">
        <HeadlessTransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="bg-opacity-25 fixed inset-0 bg-white/80" />
        </HeadlessTransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <HeadlessTransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <HeadlessDialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <HeadlessDialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-slate-900"
                >
                  Payment successful
                </HeadlessDialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-slate-500">
                    Your payment has been successfully submitted. We’ve sent you
                    an email with all of the details of your order.
                  </p>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="closeModal"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </HeadlessDialogPanel>
            </HeadlessTransitionChild>
          </div>
        </div>
      </HeadlessDialog>
    </HeadlessTransitionRoot>
  </div>
</template>
