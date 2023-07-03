<script setup>
import _snakeCase from 'lodash/snakeCase';
import TasksTable from '../components/TasksTable.vue';

const props = defineProps({
  state: Object,
  send: Function,
});

const getSynthesizerStateName = (stateValue) => {
  const synState = stateValue.synthesizer;
  const camelCaseString = typeof synState === 'object' ? Object.keys(synState)[0] : synState;
  return _snakeCase(camelCaseString).toUpperCase();
};

const additionalHeaders = [
  { text: 'Estimated time', value: 'estimatedTime' },
];
const { queue } = props.state.context;
</script>

<template>
  <div>
    <div>Synthesizer state: {{getSynthesizerStateName(state.value)}}</div>
    <div>End time of all tasks: {{state.context.allTasksEndTime}} ({{state.context.allTasksEstimatedTime / 1000}} seconds left)</div>
    <v-btn elevation="12" color="accent" rounded block @click="send('ADD_NEW_TASK')">
      Add random task
    </v-btn>
    <tasks-table :state="state" :send="send" :additionalHeaders="additionalHeaders" :tasks="queue"/>
  </div>
</template>

<script>
export default {
  name: 'SynthesizerView',
  components: {
    TasksTable,
  },
};
</script>
