<script setup>
import _snakeCase from 'lodash/snakeCase';

defineProps({
  state: Object,
  send: Function,
});

const getSynthesizerStateName = (stateValue) => {
  const synState = stateValue.synthesizer;
  return typeof synState === 'object' ? 'BUSY' : _snakeCase(synState).toUpperCase();
};
</script>

<template>
  <div>
    <div>Synthesizer state: {{getSynthesizerStateName(state.value)}}</div>
    <div>End time of all tasks: {{state.context.allTasksEndTime}} ({{state.context.allTasksEstimatedTime / 1000}} seconds left)</div>
    <v-btn elevation="12" color="accent" rounded block @click="send('ADD_NEW_TASK')">
      Add random task
    </v-btn>
    <v-data-table :headers="headers" :items="queue" :items-per-page="10" class="elevation-1">
      <template v-slot:item.priority="{ item }">
        <v-chip :color="getPriorityColor(item.priority)" dark>
          {{ getPriorityName(item.priority) }}
        </v-chip>
      </template>
      <template v-slot:item.createdAt="{ item }">
        {{ getTimeString(item.createdAt) }}
      </template>
      <template v-slot:item.completedAt="{ item }">
        {{ getTimeString(item.completedAt) }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  data() {
    const { queue } = this.state.context;

    return {
      headers: [
        { text: 'ID', value: 'id', align: 'start' },
        { text: 'Status', value: 'status' },
        { text: 'Priority', value: 'priority' },
        { text: 'Sequence', value: 'sequence', sortable: false },
        { text: 'Created at', value: 'createdAt' },
        { text: 'Estimated time', value: 'estimatedTime' },
      ],
      queue,
    };
  },
  methods: {
    getPriorityColor(priority) {
      switch (priority) {
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'red';
        default: throw Error(`Unknown priority ${priority}!`);
      }
    },
    getPriorityName(priority) {
      switch (priority) {
        case 1: return 'Low';
        case 2: return 'Average';
        case 3: return 'Critical';
        default: throw Error(`Unknown priority ${priority}!`);
      }
    },
    getTimeString(timestamp) {
      if (!timestamp) return '';
      return (new Date(timestamp)).toLocaleString('ru-RU');
    },
  },
};
</script>
