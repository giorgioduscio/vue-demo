<script setup>
import { description, message } from 'valibot';

// esempio di componente a cui passare parametri

const props =defineProps({
  title:{
    type: String,
    required: true,
    validator: (value)=> value.length >3
  },
  description:{
    type: String,
    validator: (value)=> value.length >3
  }
})
</script>

<template>
    <div v-if="props.title" class="alert alert-info alert-dismissible fade show" role="alert">
      <strong class=" text-black">{{ props.title }}</strong>
      <span class="mx-2 text-black">{{ props.description }}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  <div v-else class="text-danger">Le props 'title' e 'description' sono obbligatorie!!</div>
</template>