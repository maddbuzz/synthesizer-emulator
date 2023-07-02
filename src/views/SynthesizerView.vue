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
          {{ getPriorityString(item.priority) }}
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
      // console.log(priority);
      if (priority > 2) return 'red';
      if (priority < 2) return 'blue';
      return 'green';
    },
    getPriorityString(priority) {
      if (priority > 2) return 'критичный';
      if (priority < 2) return 'низкий';
      return 'средний';
    },
    getTimeString(timestamp) {
      return (new Date(timestamp)).toLocaleString('ru-RU');
    },
  },
};
</script>
