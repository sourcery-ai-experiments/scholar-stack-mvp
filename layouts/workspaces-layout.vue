<script setup lang="ts">
const devMode = process.env.NODE_ENV === "development";

const items = ["Overview", "Activity", "Settings"];

function navigate() {
  // the callback is fired once the animation is completed
  // to allow smooth transition
}
</script>

<template>
  <div
    class="relative mx-auto flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <header class="z-10">
      <nav
        class="flex w-full flex-col-reverse border-b border-gray-200 bg-white px-4 pt-2.5 lg:px-6"
      >
        <NavGroup
          v-slot="{ ready, size, position, duration }"
          fluid
          :duration="350"
          as="div"
          class="relative pt-2"
        >
          <div class="relative py-1">
            <div
              v-if="ready"
              :style="{
                '--size': size,
                '--position': position,
                '--duration': duration,
              }"
              class="absolute -bottom-[2px] left-0 h-1 w-[--size] translate-x-[--position] rounded-full bg-slate-500 transition-[width,transform] duration-[--duration]"
            />

            <NavList as="ul" class="relative flex items-stretch gap-3">
              <NavItem
                v-for="(item, index) in items"
                :key="index"
                v-slot="{ setActive, isActive }"
                as="li"
                @activated="navigate"
              >
                <NuxtLink
                  to="#"
                  :class="[
                    isActive ? 'text-black' : 'text-slate-500 hover:text-black',
                  ]"
                  class="inline-block p-1 text-sm transition-all"
                  @click.prevent="setActive"
                >
                  {{ item }}
                </NuxtLink>
              </NavItem>
            </NavList>
          </div>
        </NavGroup>

        <div class="flex w-full flex-wrap items-center justify-between">
          <HeaderRightBar />

          <HeaderLeftBar />
        </div>
      </nav>
    </header>

    <slot />
  </div>
</template>
