<script setup>
// import { TASK_STATUSES } from '../nucleotides-synthesizer-machine';

defineProps({
  send: { type: Function, required: true },
  taskID: { type: Number, required: true },
});
</script>

<template>
  <div>
    <v-dialog persistent v-model="showDialog" width="625">

      <template #activator="{ on, attrs }">
        <!-- <v-btn class="red--text" small v-bind="attrs" v-on="on"> -->
        <v-btn small v-bind="attrs" v-on="on">
          <v-icon>delete_forever</v-icon>
        </v-btn>
      </template>

      <v-card class="text-center" outlined>
        <v-card-title class="text-h6 red white--text">
          Delete task
          <v-spacer></v-spacer>
          <v-btn icon dark @click="sendCancelEventCloseDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="text-h6 mt-4">
          Are you sure you want to delete task number {{ taskID }}?
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn class="red white--text" @click="sendDestroyEventCloseDialog">
            yes
          </v-btn>
          <v-btn class="red white--text" @click="sendCancelEventCloseDialog">
            no
          </v-btn>
        </v-card-actions>

      </v-card>

    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'DeleteTaskDialog',

  data: () => ({
    showDialog: false, // initial state
  }),
  watch: {
    // whenever showDialog changes, this function will run
    showDialog(newValue, _oldValue) {
      if (newValue === true) {
        this.send('DELETE_TASK', { id: this.taskID });
      }
    },
  },

  methods: {
    sendDestroyEventCloseDialog() {
      this.send('DESTROY_TASK', { id: this.taskID });
      this.showDialog = false;
    },
    sendCancelEventCloseDialog() {
      // if (this.taskForEdit.status === TASK_STATUSES.EDITING) this.send('EDIT_CANCELED', { id: this.taskForEdit.id });
      this.send('DELETE_CANCELED', { id: this.taskID });
      this.showDialog = false;
    },
  },
};
</script>
