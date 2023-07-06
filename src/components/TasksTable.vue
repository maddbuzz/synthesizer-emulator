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
          <v-text-field :label="filter.text" @change="onChangeTextField($event, filter.value)"></v-text-field>
        </div>

      </v-col>
      <v-col>

        <v-select :items="availableFilters" @change="onChangeSelect($event)" label="Select filters"></v-select>

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
      ].concat(this.additionalHeaders)
        .map((h) => Object.assign(h, { filter: this.customFilterFor(h.value) })),

      items: this.tasks,

      allFilters: [
        {
          search: '', text: 'Status', value: 'status', method: this.identity,
        },
        {
          search: '', text: 'Priority', value: 'priority', method: this.getPriorityName,
        },
        {
          search: '', text: 'Created at', value: 'createdAt', method: this.getTimeString,
        },
        {
          search: '', text: 'Estimated end time', value: 'taskEndTime', method: this.getTimeString,
        },
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
    onChangeTextField(text, filterValue) {
      const filter = this.allFilters.find((f) => f.value === filterValue);
      if (!filter) throw Error(`onChangeTextField can't find value ${filterValue}`);
      filter.search = text;
    },
    onChangeSelect(value) {
      const newFilter = this.allFilters.find((f) => f.value === value);
      if (!newFilter) throw Error(`onChangeSelect can't find value ${value}`);
      this.selectedFilters.push(newFilter);
    },
    customFilterFor(key) {
      return (value, _search, _item) => {
        const filter = this.selectedFilters.find((f) => f.value === key);
        if (!filter) return true;
        return filter.method(value).includes(filter.search);
      };
    },

    identity(value) {
      return value;
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
