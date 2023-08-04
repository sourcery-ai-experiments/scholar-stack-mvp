<template>
  <NaiveConfig>
    <n-message-provider>
      <NuxtLayout>
        <NuxtLoadingIndicator color="#be185d" :height="5" />
        <NuxtPage />
      </NuxtLayout>
    </n-message-provider>
  </NaiveConfig>
</template>

<script setup lang="ts">
import "md-editor-v3/lib/style.css";

import { ThemeConfig } from "@bg-dev/nuxt-naiveui";

// https://realtimecolors.com/?colors=040407-f5f6fa-3c4472-c5d0fc-e7bc0d
// https://realtimecolors.com/?colors=040407-f5f6fa-3c4472-ede9d9-e7bc0d
// https://realtimecolors.com/?colors=040407-f5f6fa-3c4472-ede9d9-f6c709
// https://realtimecolors.com/?colors=040407-f5f6fa-3c4472-ede9d9-995c99

const themeConfig: ThemeConfig = {
  dark: {}, // Theme options applied on dark mode
  light: {}, // Theme options applied on light mode
  mobile: {}, // Theme options applied on mobile only
  mobileOrTablet: {}, // Theme options applied on mobile and tablet
  shared: {}, // Common theme options
};

useHead({
  title: "Scholar Stack",
  bodyAttrs: {
    class: "test",
  },
  link: [
    { href: "/favicon.ico", rel: "icon", type: "image/x-icon" },
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
