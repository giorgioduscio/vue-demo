<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import customStyle from './tools/styles';
import Navigation from './shared/navigation.vue';

onMounted(()=>{
  customStyle();
})
</script>

<template>
  <Navigation />

  <div>
    <RouterView />
  </div>

</template>
