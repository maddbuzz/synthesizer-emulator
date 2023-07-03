<script setup>
import TasksTable from '../components/TasksTable.vue';

const props = defineProps({
  state: Object,
  send: Function,
});

const additionalHeaders = [
  { text: 'Completed at', value: 'completedAt' },
];
const { queue, completedTasks } = props.state.context;
const allTasks = completedTasks.concat(queue); // shallow copy
</script>

<template>
  <tasks-table :additionalHeaders="additionalHeaders" :tasks="allTasks" :itemsPerPage="15" />
</template>

<script>
export default {
  name: 'AllTasksView',
  components: {
    TasksTable,
  },
};
</script>
