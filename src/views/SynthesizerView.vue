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
    <div class="text-center">Synthesizer state: {{ getSynthesizerStateNameString }}</div>
    <v-col class="text-center text-h5">
      <span class="blue white--text">{{ splitCurrentSequence[0] }}</span>
      <span class="red white--text">{{ splitCurrentSequence[1] }}</span>
      <span class="blue--text">{{ splitCurrentSequence[2] }}</span>
    </v-col>
    <div class="text-center">End time of all tasks: {{ getAllTasksEndTimeString }} ({{ getAllTasksEstimatedTime }} seconds left)</div>
    <v-btn elevation="4" color="accent" rounded block @click="send('ADD_NEW_TASK')">
      Add random task
    </v-btn>
    <tasks-table :additionalHeaders="additionalHeaders" :tasks="queue" :itemsPerPage="10" />
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
    getAllTasksEstimatedTime() {
      const { allTasksEstimatedTime } = this.state.context;
      return allTasksEstimatedTime / 1000;
    },
    getSynthesizerStateNameString() {
      const synState = this.state.value.synthesizer;
      const camelCaseString = typeof synState === 'object' ? Object.keys(synState)[0] : synState;
      return _snakeCase(camelCaseString).toUpperCase();
    },
    splitCurrentSequence() {
      const { state } = this;
      const { currentTask } = state.context;
      if (!Object.hasOwn(currentTask, 'elementsLeft')) {
        if (state.matches('synthesizer.onMaintenance')) return ['', '🛠', ''];
        if (state.matches('synthesizer.idle')) return ['', '', '♻']; // ['♺', '♲', '♻'];
        throw Error(`splitCurrentSequence: unknown state ${state.value}!`);
      }
      const { sequence, length, elementsLeft } = currentTask;
      const currentIndex = length - 1 - elementsLeft;
      const completed = sequence.slice(0, currentIndex);
      const processing = sequence.slice(currentIndex, currentIndex + 1);
      const pending = sequence.slice(currentIndex + 1);
      return [completed, processing, pending];
    },
  },
};
</script>
