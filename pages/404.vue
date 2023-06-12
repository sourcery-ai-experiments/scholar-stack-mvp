<template>
  <main class="flex h-full w-full flex-col items-center px-12">
    <ClientOnly>
      <Vue3Lottie
        animation-link="https://assets10.lottiefiles.com/packages/lf20_ukmmbtae.json"
        :height="400"
        :width="400"
      />
    </ClientOnly>

    <h1>We couldn't find the resource you're looking for.</h1>
  </main>
</template>
