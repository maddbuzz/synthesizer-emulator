<script setup>
import TaskForm from './TaskForm.vue';

defineProps({
  state: Object,
  send: Function,
});
</script>

<template>
  <div>
    <v-dialog v-model="dialog" width="1250">

      <template v-slot:activator="{ on, attrs }">
        <v-btn class="blue white--text" v-bind="attrs" v-on="on">
          add task
        </v-btn>
      </template>

      <v-card class="text-center" outlined>
        <v-card-title class="text-h6 blue white--text">
          Add task
        </v-card-title>

        <task-form :taskID="state.context.nextTaskID" submit-name="Create task" :send="send" event-name="CREATE_TASK" />

      </v-card>

    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddTaskDialog',

  components: {
    TaskForm,
  },

  data: () => ({
    dialog: false, // initial state
  }),

};
</script>
