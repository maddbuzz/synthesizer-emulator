<script setup>
import { TASK_STATUSES } from '../nucleotides-synthesizer-machine';
import TaskForm from './TaskForm.vue';

defineProps({
  send: { type: Function, required: true },
  taskForEdit: { type: Object, required: true },
});
</script>

<template>
  <div>
    <v-dialog v-model="showDialog" width="1250">

      <template v-slot:activator="{ on, attrs }">
        <v-btn class="blue white--text" v-bind="attrs" v-on="on">
          edit task
        </v-btn>
      </template>

      <v-card class="text-center" outlined>
        <v-card-title class="text-h6 blue white--text">
          Edit task
          <v-spacer></v-spacer>
          <v-btn icon dark @click="sendEventCloseDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <task-form :taskID="taskForEdit.id" :taskForEdit="taskForEdit" submit-name="Save task" :send="send"
          event-name="UPDATE_TASK" />

      </v-card>

    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'EditTaskDialog',

  components: {
    TaskForm,
  },

  data: () => ({
    showDialog: false, // initial state
  }),
  watch: {
    // whenever showDialog changes, this function will run
    showDialog(newValue, _oldValue) {
      if (newValue === true) this.send('EDIT_TASK', { id: this.taskForEdit.id });
    },
  },

  methods: {
    sendEventCloseDialog() {
      if (this.taskForEdit.status === TASK_STATUSES.EDITING) this.send('EDIT_CANCELED', { id: this.taskForEdit.id });
      this.showDialog = false;
    },
  },
};
</script>
