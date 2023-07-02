<script setup>
defineProps({
  state: Object,
  send: Function,
});
</script>

<template>
  <v-data-table :headers="headers" :items="tasks" :items-per-page="15" class="elevation-1">
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
</template>

<script>
export default {
  data() {
    const { queue, completedTasks } = this.state.context;
    const allTasks = queue.concat(completedTasks); // shallow copy

    return {
      headers: [
        { text: 'ID', value: 'id', align: 'start' },
        { text: 'Status', value: 'status' },
        { text: 'Priority', value: 'priority' },
        { text: 'Sequence', value: 'sequence', sortable: false },
        { text: 'Created at', value: 'createdAt' },
        { text: 'Completed at', value: 'completedAt' },
      ],
      tasks: allTasks,
    };
  },
  methods: {
    getPriorityColor(priority) {
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
