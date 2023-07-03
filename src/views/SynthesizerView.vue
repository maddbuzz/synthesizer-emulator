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
    <div>Synthesizer state: {{ getSynthesizerStateNameString }}</div>
    <div>End time of all tasks: {{ getAllTasksEndTimeString }} ({{ getAllTasksEstimatedTimeString }} seconds left)</div>
    <v-btn elevation="4" color="accent" rounded block @click="send('ADD_NEW_TASK')">
      Add random task
    </v-btn>
    <tasks-table :additionalHeaders="additionalHeaders" :tasks="queue" :itemsPerPage="5" />
    <v-col class="text-center text-h5" cols="12">
      <span class="rounded-lg red red--text text--lighten-5">{{ splitCurrentSequence[0] }}</span>
      <span class="rounded-lg purple purple--text text--lighten-5">{{ splitCurrentSequence[1] }}</span>
      <span class="rounded-lg blue blue--text text--lighten-5">{{ splitCurrentSequence[2] }}</span>
    </v-col>
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
    splitCurrentSequence() {
      const { currentTask } = this.state.context;
      if (!currentTask.sequence) return ['', '', ''];
      const { sequence, length, elementsLeft } = currentTask;
      // console.log('length, elementsLeft', length, elementsLeft);
      const currentIndex = length - 1 - elementsLeft;
      const completed = sequence.slice(0, currentIndex);
      const processing = sequence.slice(currentIndex, currentIndex + 1);
      const pending = sequence.slice(currentIndex + 1);
      // console.log([completed, processing, pending]);
      return [completed, processing, pending];
    },
  },
};
</script>
