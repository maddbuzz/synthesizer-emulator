<script setup>
import TaskForm from './TaskForm.vue';

defineProps({
  state: { type: Object, required: true },
  send: { type: Function, required: true },
});
</script>

<template>
  <div>
    <v-dialog v-model="showDialog" width="1250">

      <template #activator="{ on, attrs }">
        <v-btn class="blue white--text" v-bind="attrs" v-on="on">
          add task
        </v-btn>
      </template>

      <v-card class="text-center" outlined>
        <v-card-title class="text-h6 blue white--text">
          Add task
          <v-spacer></v-spacer>
          <v-btn icon dark @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <task-form :taskID="state.context.nextTaskID" :taskForEdit="null" submit-name="Create task" :send="send"
          event-name="CREATE_TASK" />

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
    showDialog: false, // initial state
  }),

};
</script>
