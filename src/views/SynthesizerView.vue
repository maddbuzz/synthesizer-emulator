<script setup>
import _snakeCase from 'lodash/snakeCase';
import TasksTable from '../components/TasksTable.vue';
import TaskInput from '../components/TaskInput.vue';

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
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <div class="text-center">Synthesizer state: {{ getSynthesizerStateNameString }}</div>
        <span class="text-h5 blue white--text">{{ splitCurrentSequence[0] }}</span>
        <span class="text-h5 red white--text">{{ splitCurrentSequence[1] }}</span>
        <span class="text-h5 blue--text">{{ splitCurrentSequence[2] }}</span>
        <div class="text-center">End time of all tasks: {{ getAllTasksEndTimeString }} ({{ getAllTasksEstimatedTime }}
          seconds left)</div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="6">
        <task-input :send="send" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <tasks-table :additionalHeaders="additionalHeaders" :tasks="queue" :itemsPerPage="10" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'SynthesizerView',

  components: {
    TasksTable,
    TaskInput,
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
