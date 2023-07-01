<script setup>
defineProps({
  state: Object,
  send: Function,
});
</script>

<template>
  <div>
    <div>States = {{state.value}}</div>
    <button @click="send('ADD_NEW_TASK')">Add task</button>
    <div>nextTaskID = {{state.context.nextTaskID}}</div>
    <div>{{state.context.currentTask}}</div>
    <div>tasksCompletedInRow = {{state.context.tasksCompletedInRow}}</div>
    <div>{{state.context.queue}}</div>
    <div>{{state.context.completedTasks}}</div>
  </div>
</template>

<!-- <template>
  <synthesizer-and-queue />
</template>

<script>
import SynthesizerAndQueue from '../components/SynthesizerAndQueue.vue';

export default {
  name: 'SynthesizerView',

  components: {
    SynthesizerAndQueue,
  },
};
</script> -->
