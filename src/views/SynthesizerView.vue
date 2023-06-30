<script setup>
import { useMachine } from 'xstate-vue2';
import synthesizerMachine from '../nucleotides-synthesizer-machine';

const { state, send } = useMachine(synthesizerMachine);
</script>

<template>
  <div>
    <div>states = {{state.value}}</div>
    <button @click="send('ADD_NEW_TASK')">Add task</button>
    <div>nextTaskID = {{state.context.nextTaskID}}</div>
    <div>{{state.context.currentTask}}</div>
    <div>tasksCompletedInRow = {{state.context.tasksCompletedInRow}}</div>
    <div>{{state.context.queue}}</div>
    <div>{{state.context.completedTasks}}</div>
  </div>
</template>
