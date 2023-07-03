<script setup>
defineProps({
  state: Object,
  send: Function,
  additionalHeaders: Array,
  tasks: Array,
});
</script>

<template>
  <v-data-table :headers="headers" :items="items" :items-per-page="15" class="elevation-1">
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
</template>

<script>
export default {
  name: 'TasksTable',

  data() {
    return {
      headers: [
        { text: 'ID', value: 'id', align: 'start' },
        { text: 'Status', value: 'status' },
        { text: 'Priority', value: 'priority' },
        { text: 'Sequence', value: 'sequence', sortable: false },
        { text: 'Created at', value: 'createdAt' },
      ].concat(this.additionalHeaders),
      items: this.tasks,
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