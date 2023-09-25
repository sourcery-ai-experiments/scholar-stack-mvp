<script setup lang="ts">
const push = usePush();
const route = useRoute();

const selectedWorkspace = ref("");

const { data: workspaces, error } = await useFetch("/api/workspaces", {
  headers: useRequestHeaders(["cookie"]),
});

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your workspaces",
  });
}

// watch for route changes and update selected workspace
watchEffect(() => {
  const workspaceid = route.params.workspaceid;

  if (workspaceid) {
    selectedWorkspace.value = workspaceid as string;
  }
});

const navigateToWorkspace = (workspaceid: string) => {
  console.log(workspaceid);
  navigateTo(`/dashboard/workspaces/${workspaceid}`);
};

const navigateToDashboard = () => {
  navigateTo("/dashboard");
};
</script>

<template>
  <div class="flex items-center justify-start">
    <NuxtLink to="/dashboard" class=" ">
      <img src="/logo/logo.svg" alt="Logo" class="w-10" />
    </NuxtLink>

    <svg
      fill="none"
      shape-rendering="geometricPrecision"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      class="h-8 w-8 text-gray-200"
    >
      <path d="M16.88 3.549L7.12 20.451"></path>
    </svg>

    <div class="w-max">
      <HeadlessListbox v-model="selectedWorkspace">
        <div class="relative">
          <HeadlessListboxButton
            class="relative w-full cursor-pointer rounded-lg border border-slate-100 bg-white py-2 pl-3 pr-10 text-left transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm sm:text-sm"
          >
            <div class="flex items-center justify-start space-x-2">
              <n-avatar
                :size="20"
                :src="`https://api.dicebear.com/6.x/shapes/svg?seed=${selectedWorkspace}`"
                class="border hover:cursor-pointer hover:opacity-80"
                round
              />

              <span class="text-base font-medium">{{
                workspaces?.find(
                  (workspace) => workspace.id === selectedWorkspace
                )?.title
              }}</span>
            </div>

            <span
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <Icon name="ph:caret-up-down-bold" class="h-5 w-5" />
            </span>
          </HeadlessListboxButton>

          <transition
            leave-active-class="transition duration-100 ease-in"
            enter-active-class="transition duration-75 ease-out"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            enter-from-class="opacity-0 transition transform origin-top-right scale-95"
            enter-to-class="opacity-100 transform origin-top-right scale-100"
          >
            <HeadlessListboxOptions
              class="absolute mt-1 max-h-60 w-max overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 sm:text-sm"
            >
              <HeadlessListboxOption
                v-for="workspace in workspaces"
                v-slot="{ active, selected }"
                :key="workspace.id"
                :value="workspace.id"
                as="template"
                @click="navigateToWorkspace(workspace.id)"
              >
                <li
                  :class="[
                    active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                    'flex w-full cursor-pointer items-center justify-between px-4 py-2',
                  ]"
                >
                  <div class="flex items-center justify-start space-x-2 pr-4">
                    <n-avatar
                      :size="20"
                      :src="`https://api.dicebear.com/6.x/shapes/svg?seed=${workspace.id}`"
                      class="border hover:cursor-pointer hover:opacity-80"
                      round
                    />

                    <span
                      :class="[
                        selected ? 'font-medium' : 'font-normal',
                        'block truncate',
                      ]"
                      >{{ workspace.title }}</span
                    >
                  </div>

                  <span
                    v-if="selected"
                    class="flex items-center text-amber-600"
                  >
                    <Icon name="ph:check-bold" class="h-5 w-5" />
                  </span>
                </li>
              </HeadlessListboxOption>

              <div class="mx-auto my-1 h-[1px] w-[90%] bg-slate-200"></div>

              <HeadlessListboxOption
                v-slot="{ active }"
                as="template"
                @click="navigateToDashboard"
              >
                <li
                  :class="[
                    active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                    'flex w-full cursor-pointer items-center justify-between px-4 py-2',
                  ]"
                >
                  <div class="flex items-center justify-start space-x-2 pr-4">
                    <Icon name="ph:plus-circle-bold" />

                    <span class="block truncate font-medium">
                      Create a new workspace
                    </span>
                  </div>
                </li>
              </HeadlessListboxOption>
            </HeadlessListboxOptions>
          </transition>
        </div>
      </HeadlessListbox>
    </div>
  </div>
</template>
