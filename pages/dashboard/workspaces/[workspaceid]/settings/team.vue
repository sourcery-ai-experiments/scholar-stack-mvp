<script setup lang="ts">
import type { FormInst } from "naive-ui";

const formRef = ref<FormInst>();

const formValue = reactive({
  role: null,
  user: "",
});

const rules = {
  role: {
    message: "Please enter a role",
    required: true,
  },
  user: {
    message: "Please enter a username or email address",
    required: true,
  },
};

const options = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];
</script>

<template>
  <div class="flex flex-col">
    <h2 class="text-xl">Team</h2>

    <p class="pb-6 pt-1 text-slate-700">
      Invite your team members to collaborate on your workspace and projects.
    </p>

    <n-space vertical class="rounded-lg border border-zinc-300">
      <div class="rounded-lg bg-white p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-medium">
            Invite new members to your workspace
          </h3>
        </div>

        <n-divider />

        <n-form
          ref="formRef"
          inline
          :label-width="80"
          :model="formValue"
          :rules="rules"
          size="large"
          class="space-x-8"
        >
          <div class="w-2/4">
            <n-form-item label="Username or Email Address" path="user">
              <n-input
                v-model:value="formValue.user"
                placeholder="hi@sciconnect.io"
              />
            </n-form-item>
          </div>

          <div class="w-2/4">
            <n-form-item label="Role" path="role">
              <n-select
                v-model:value="formValue.role"
                :options="options"
                placeholder="Admin"
              />
            </n-form-item>
          </div>
        </n-form>
      </div>

      <div class="flex items-center justify-between px-6 py-3">
        <p class="text-sm">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        </p>

        <n-button color="black" size="large">
          <template #icon>
            <Icon name="mingcute:invite-fill" />
          </template>

          Send Invite
        </n-button>
      </div>
    </n-space>
  </div>
</template>
