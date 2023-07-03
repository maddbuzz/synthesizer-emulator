<script setup>
import _snakeCase from 'lodash/snakeCase';
import TasksTable from '../components/TasksTable.vue';

const props = defineProps({
  state: Object,
  send: Function,
});

const additionalHeaders = [
  { text: 'Estimated end time', value: 'taskEndTime' },
];
const { queue } = props.state.context;
</script>

<template>
  <div>
    <div>Synthesizer state: {{getSynthesizerStateNameString}}</div>
    <div>End time of all tasks: {{getAllTasksEndTimeString}} ({{getAllTasksEstimatedTimeString}} seconds left)</div>
    <v-btn elevation="4" color="accent" rounded block @click="send('ADD_NEW_TASK')">
      Add random task
    </v-btn>
    <tasks-table :additionalHeaders="additionalHeaders" :tasks="queue"/>
  </div>
</template>

<script>
export default {
  name: 'SynthesizerView',

  components: {
    TasksTable,
  },

  computed: {
    getAllTasksEndTimeString() {
      const { allTasksEndTime } = this.state.context;
      if (!allTasksEndTime) return '';
      return (new Date(allTasksEndTime)).toLocaleString('ru-RU');
    },
    getAllTasksEstimatedTimeString() {
      const { allTasksEstimatedTime } = this.state.context;
      return allTasksEstimatedTime / 1000;
    },
    getSynthesizerStateNameString() {
      const synState = this.state.value.synthesizer;
      const camelCaseString = typeof synState === 'object' ? Object.keys(synState)[0] : synState;
      return _snakeCase(camelCaseString).toUpperCase();
    },
  },
};
</script>
