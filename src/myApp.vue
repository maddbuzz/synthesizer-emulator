<!-- ???.vue -->
<!-- Top level bindigs are pre-processed via "setup" -->
<script setup>
import { useMachine } from 'xstate-vue2';
import synthesizerMachine from './nucleotides-synthesizer-machine';

const { state, send } = useMachine(synthesizerMachine);
</script>

<template>
  <div id="app">
    <div>states = {{state.value}}</div>
    <button @click="send('ADD_NEW_TASK')">Add task</button>
    <div>nextTaskID = {{state.context.nextTaskID}}</div>
    <div>{{state.context.currentTask}}</div>
    <div>tasksCompletedInRow = {{state.context.tasksCompletedInRow}}</div>
    <div>{{state.context.queue}}</div>
    <div>{{state.context.completedTasks}}</div>
  </div>
</template>

<!-- <script>
import { useMachine } from 'xstate-vue2';
import synthesizerMachine from './nucleotides-synthesizer-machine.js';

export default {
  name: "App",
  setup() {
    const { state, send } = useMachine(synthesizerMachine);
    return { state, send };
  }
};
</script> -->

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
