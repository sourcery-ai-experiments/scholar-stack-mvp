<script setup lang="ts">
definePageMeta({
  layout: "dashboard-root",
  middleware: ["auth"],
});

const push = usePush();

const gridView = ref(true);
const modalIsOpen = ref(false);

const closeModal = () => {
  modalIsOpen.value = false;
};

const openModal = () => {
  modalIsOpen.value = true;
};

const { data: workspaces, error } = await useFetch("/api/workspaces", {
  headers: useRequestHeaders(["cookie"]),
});

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your workspaces",
  });

  navigateTo("/");
}

if (workspaces.value?.length === 0) {
  console.log("No workspaces found");

  // Create a new personal workspace
  const { data: workspace, error } = await useFetch("/api/workspaces", {
    body: JSON.stringify({
      title: "My workspace",
      description: "This is my personal workspace",
    }),
    headers: useRequestHeaders(["cookie"]),
    method: "POST",
  });

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "Please contact support",
    });

    navigateTo("/");
  }

  if (workspace.value) {
    console.log("Workspace created", workspace.value);

    push.success({
      title: "Workspace created",
      message: "You can now start adding your collections",
    });

    navigateTo(`dashboard/workspaces/${workspace.value.workspaceId}`);
  }
} else {
  console.log("Workspaces found", workspaces.value);
  // navigateTo(`dashboard/workspaces`);
}
</script>

<template>
  <main class="h-full bg-slate-50">
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

        <n-button size="large" color="black" @click="openModal">
          <template #icon>
            <Icon name="mdi:plus" />
          </template>
          Create a new workspace
        </n-button>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="workspace in workspaces"
          :key="workspace.id"
          to="/dashboard/workspace/${workspace.id}"
          class="flex flex-col space-y-5 rounded-md border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex items-center justify-start space-x-2">
            <n-avatar
              :size="40"
              :src="`https://api.dicebear.com/6.x/shapes/svg?seed=${workspace.id}`"
              class="hover:cursor-pointer hover:opacity-80"
            />

            <div class="flex flex-col space-y-1">
              <span class="text-lg">
                {{ workspace.title }}
              </span>

              <span class="text-sm text-slate-500">
                {{ workspace.created }}
              </span>
            </div>
          </div>

          <div>
            <span>
              {{ workspace.description }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

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
  </main>
</template>
