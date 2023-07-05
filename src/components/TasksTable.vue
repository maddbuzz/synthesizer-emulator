<script setup>
import { PRIORITY_NAMES } from '../nucleotides-synthesizer-machine';

defineProps({
  additionalHeaders: Array,
  tasks: Array,
  itemsPerPage: Number,
});
</script>

<template>
  <div>
    <v-row>
      <v-col>
        <div v-for="filter in selectedFilters" v-bind:key="filter.value">
          <v-text-field :label="filter.text"></v-text-field>
        </div>
      </v-col>
      <v-col>
        <v-select :items="availableFilters" @change="onChange($event)"></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table :headers="headers" :items="items" :items-per-page="itemsPerPage" class="elevation-4">
          <template v-slot:item.priority="{ item }">
            <v-chip :color="getPriorityColor(item.priority)" dark>
              {{ getPriorityName(item.priority) }}
            </v-chip>
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ getTimeString(item.createdAt) }}
          </template>
          <template v-slot:item.taskEndTime="{ item }">
            {{ getTimeString(item.taskEndTime) }}
          </template>
          <template v-slot:item.completedAt="{ item }">
            {{ getTimeString(item.completedAt) }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
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

      allFilters: [
        { header: 'Select filters' },
        { text: 'Status', value: 'status' },
        { text: 'Priority', value: 'priority' },
        { text: 'Created at', value: 'createdAt' },
        { text: 'Estimated end time', value: 'taskEndTime' },
      ],
      selectedFilters: [],
    };
  },

  computed: {
    availableFilters() {
      return this.allFilters
        .filter(({ value }) => (
          this.selectedFilters
            .findIndex((f) => f.value === value) === -1
        ));
    },
  },

  methods: {
    onChange(value) {
      const newFilter = this.allFilters.find((f) => f.value === value);
      if (!newFilter) throw Error(`onChange can't find value ${value}`);
      this.selectedFilters.push(newFilter);
    },
    getPriorityColor(priority) {
      switch (priority) {
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'red';
        default: throw Error(`Unknown priority ${priority}!`);
      }
    },
    getPriorityName(priority) {
      const name = PRIORITY_NAMES[priority];
      if (!name) throw Error(`Unknown priority ${priority}!`);
      return name;
    },
    getTimeString(timestamp) {
      if (!timestamp) return '';
      return (new Date(timestamp)).toLocaleString('ru-RU');
    },
  },
};
</script>
