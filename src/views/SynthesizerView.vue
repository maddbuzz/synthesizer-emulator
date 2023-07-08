<script setup>
import _snakeCase from 'lodash/snakeCase';
import TasksTable from '../components/TasksTable.vue';
import AddTaskDialog from '../components/AddTaskDialog.vue';

defineProps({
  state: { type: Object, required: true },
  send: { type: Function, required: true },
});

const additionalHeaders = [
  { text: 'Estimated end time', value: 'taskEndTime' },
];
</script>

<template>
  <v-container fluid>
    <v-row class="text-center">
      <v-col cols="12">
        <div class="text-center">Synthesizer state: {{ getSynthesizerStateNameString }}</div>
        <span class="text-h6 blue white--text">{{ splitCurrentSequence[0] }}</span>
        <span class="text-h6 red white--text">{{ splitCurrentSequence[1] }}</span>
        <span class="text-h6 blue--text">{{ splitCurrentSequence[2] }}</span>
        <div class="text-center">End time of all tasks: {{ getAllTasksEndTimeString }} ({{ getAllTasksEstimatedTime }}
          seconds left)</div>
        <add-task-dialog class="mt-3" :state="state" :send="send" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <tasks-table :state="state" :send="send" :additionalHeaders="additionalHeaders" :itemsPerPage="10" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'SynthesizerView',

  components: {
    TasksTable,
    AddTaskDialog,
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
        throw Error(`splitCurrentSequence: unexpected state ${state.value}!`);
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
