<script setup>
import TasksTable from '../components/TasksTable.vue';

const props = defineProps({
  state: { type: Object, required: true },
  send: { type: Function, required: true },
});

const additionalHeaders = [
  { text: 'Estimated end time', value: 'taskEndTime' },
  { text: 'Completed at', value: 'completedAt' },
];
const { queue, completedTasks } = props.state.context;
const allTasks = completedTasks.concat(queue); // shallow copy
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <tasks-table :send="send" :additionalHeaders="additionalHeaders" :tasks="allTasks" :itemsPerPage="15" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AllTasksView',
  components: {
    TasksTable,
  },
};
</script>
