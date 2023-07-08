<script setup>
import TasksTable from '../components/TasksTable.vue';

defineProps({
  state: { type: Object, required: true },
  send: { type: Function, required: true },
});

const additionalHeaders = [
  { text: 'Estimated end time', value: 'taskEndTime' },
  { text: 'Completed at', value: 'completedAt' },
];
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <tasks-table :state="state" :send="send" :additionalHeaders="additionalHeaders" :shouldCompletedTasksBeShown="true" :itemsPerPage="15" />
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
