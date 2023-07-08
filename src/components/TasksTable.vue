<script setup>
import _debounce from 'lodash/debounce';
import { TASK_STATUSES, PRIORITY_NAMES } from '../nucleotides-synthesizer-machine';
import EditTaskDialog from './EditTaskDialog.vue';
import DeleteTaskDialog from './DeleteTaskDialog.vue';

defineProps({
  state: { type: Object, required: true },
  send: { type: Function, required: true },
  additionalHeaders: { type: Array, default: () => [] },
  shouldCompletedTasksBeShown: { type: Boolean, default: false },
  itemsPerPage: Number,
});
</script>

<template>
  <div>
    <v-row>
      <v-col>

        <div v-for="filter in selectedFilters" v-bind:key="filter.value">
          <v-text-field :label="filter.text" @input="debouncedOnInputTextField($event, filter.value)"></v-text-field>
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
          <template v-slot:item.editButton="{ item }">
            <edit-task-dialog :send="send" :taskForEdit="item" v-if="shouldButtonsBeShown(item)" />
          </template>
          <template v-slot:item.deleteButton="{ item }">
            <delete-task-dialog :send="send" :taskID="item.id" v-if="shouldButtonsBeShown(item)" />
          </template>
        </v-data-table>

      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'TasksTable',

  components: {
    EditTaskDialog,
    DeleteTaskDialog,
  },

  data() {
    return {
      headers: [
        { text: 'ID', value: 'id', align: 'start' },
        { text: 'Status', value: 'status' },
        { text: 'Priority', value: 'priority' },
        { text: 'Sequence', value: 'sequence', sortable: false },
        { text: 'Created at', value: 'createdAt' },
        { text: 'Estimated end time', value: 'taskEndTime' },
      ].concat(this.additionalHeaders)
        .map((h) => Object.assign(h, { filter: this.customFilterFor(h.value) }))
        .concat({ value: 'editButton', sortable: false }, { value: 'deleteButton', sortable: false }),

      queue: this.state.context.queue,
      completedTasks: this.state.context.completedTasks,

      allFilters: [
        {
          search: '', text: 'Status', value: 'status', slotMethod: this.identity,
        },
        {
          search: '', text: 'Priority', value: 'priority', slotMethod: this.getPriorityName,
        },
        {
          search: '', text: 'Created at', value: 'createdAt', slotMethod: this.getTimeString,
        },
        {
          search: '', text: 'Estimated end time', value: 'taskEndTime', slotMethod: this.getTimeString,
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

    items() {
      if (!this.shouldCompletedTasksBeShown) return this.queue;
      return this.completedTasks.concat(this.queue); // shallow copy
    },
  },

  created() {
    // https://css-tricks.com/debouncing-throttling-explained-examples/
    this.debouncedOnInputTextField = _debounce(this.onInputTextField, 500);
  },
  methods: {
    onInputTextField(text, filterValue) {
      const filter = this.allFilters.find((f) => f.value === filterValue);
      if (!filter) throw Error(`onInputTextField: can't find filterValue ${filterValue}`);
      filter.search = text;
    },
    onChangeSelect(value) {
      const newFilter = this.allFilters.find((f) => f.value === value);
      if (!newFilter) throw Error(`onChangeSelect: can't find value ${value}`);
      this.selectedFilters.push(newFilter);
    },
    customFilterFor(key) {
      return (value, _search, _item) => {
        const filter = this.selectedFilters.find((f) => f.value === key);
        if (!filter) return true;
        const cellValue = filter.slotMethod(value).toUpperCase();
        const searchElement = filter.search.toUpperCase();
        return cellValue.includes(searchElement);
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
        default: throw Error(`getPriorityColor: unknown priority ${priority}!`);
      }
    },
    getPriorityName(priority) {
      const name = PRIORITY_NAMES[priority];
      if (!name) throw Error(`getPriorityName: unknown priority ${priority}!`);
      return name;
    },
    getTimeString(timestamp) {
      if (!timestamp) return '';
      return (new Date(timestamp)).toLocaleString('ru-RU');
    },
    shouldButtonsBeShown({ status }) {
      return (status !== TASK_STATUSES.PROCESSING) && (status !== TASK_STATUSES.COMPLETED);
    },
  },
};
</script>
