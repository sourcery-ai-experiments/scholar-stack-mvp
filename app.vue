<template>
  <NaiveConfig>
    <n-message-provider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </n-message-provider>
  </NaiveConfig>
</template>

<script setup lang="ts">
import "vue3-lottie/dist/style.css";

useHead({
  title: "Scholar Stack",
  bodyAttrs: {
    class: "test",
  },
  link: [
    {
      href: "/apple-touch-icon.png",
      rel: "apple-touch-icon",
      sizes: "180x180",
    },
    {
      href: "/favicon-16x16.png",
      rel: "icon",
      sizes: "16x16",
      type: "image/png",
    },
    {
      href: "/favicon-32x32.png",
      rel: "icon",
      sizes: "32x32",
      type: "image/png",
    },
    {
      color: "#5bbad5",
      href: "/safari-pinned-tab.svg",
      rel: "mask-icon",
    },
    {
      href: "/site.webmanifest",
      rel: "manifest",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Scholar Stack is an application to help you manage your dependencies with ease",
    },
    {
      name: "msapplication-TileColor",
      content: "#2b5797",
    },
    {
      name: "theme-color",
      content: "#ffffff",
    },
  ],
});
</script>

<style>
/* Transitions between pages */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

/* Transitions between components */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
