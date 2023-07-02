<script setup>
defineProps({
  state: Object,
  send: Function,
});
</script>

<!-- <template>
  <div>
    <div>States = {{state.value}}</div>
    <button @click="send('ADD_NEW_TASK')">Add task</button>
    <div>nextTaskID = {{state.context.nextTaskID}}</div>
    <div>{{state.context.currentTask}}</div>
    <div>tasksCompletedInRow = {{state.context.tasksCompletedInRow}}</div>
    <div>{{state.context.queue}}</div>
    <div>{{state.context.allTasksEstimatedTime / 1000}}</div>
    <div>{{state.context.allTasksEndTime}}</div>
    <div>{{state.context.completedTasks}}</div>
  </div>
</template> -->

<template>
  <div>
    <button @click="send('ADD_NEW_TASK')">Add task</button>
    <v-data-table :headers="headers" :items="queue" :items-per-page="6" class="elevation-1">
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
      return (new Date(timestamp)).toLocaleString('ru-RU');
    },
  },
};
</script>
