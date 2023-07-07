<script setup>
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';

import { getRandomIntegerInRange } from '../math';
import { PRIORITY_NAMES, NUCLEOTIDES, getRandomSequence } from '../nucleotides-synthesizer-machine';

defineProps({
  taskID: { type: Number, required: true },
  taskForEdit: { type: Object, default: null },
  submitName: { type: String, required: true },
  send: { type: Function, required: true },
  eventName: { type: String, required: true },
});
</script>

<template>
  <form class="pa-2 elevation-4">
    <v-text-field v-model="idModel" label="ID" disabled></v-text-field>
    <v-text-field v-model="sequenceModel" :error-messages="sequenceErrors" :counter="120" label="Sequence" required
      @input="$v.sequenceModel.$touch()" @blur="$v.sequenceModel.$touch()"></v-text-field>
    <v-select v-model="priorityModel" :items="priorities" :error-messages="priorityErrors" label="Priority" required
      @change="$v.priorityModel.$touch()" @blur="$v.priorityModel.$touch()"></v-select>

    <v-btn class="blue white--text mr-3" @click="submit">
      {{ submitName }}
    </v-btn>
    <v-btn class="blue white--text mr-3" @click="randomizeTask">
      randomize
    </v-btn>
    <v-btn  class="blue white--text" @click="clear">
      clear
    </v-btn>
  </form>
</template>

<script>
export default {
  name: 'TaskForm',

  mixins: [validationMixin],

  validations: {
    sequenceModel: { required, minLength: minLength(6), maxLength: maxLength(120) },
    priorityModel: { required },
  },

  data: () => ({
    sequence: null,
    priority: null,
    priorities: Object.values(PRIORITY_NAMES),
  }),

  computed: {
    priorityErrors() {
      const errors = [];
      if (!this.$v.priorityModel.$dirty) return errors;
      if (!this.$v.priorityModel.required) errors.push('Priority is required');
      return errors;
    },
    sequenceErrors() {
      const errors = [];
      if (!this.$v.sequenceModel.$dirty) return errors;

      const { $model: sequence } = this.$v.sequenceModel;
      if ([...sequence.toUpperCase()].some((el) => !NUCLEOTIDES.includes(el))) {
        errors.push(`Sequence must contain only ${[...NUCLEOTIDES]}`);
      }

      if (!this.$v.sequenceModel.minLength) errors.push('Sequence must be at least 6 characters long');
      if (!this.$v.sequenceModel.maxLength) errors.push('Sequence must be at most 120 characters long');
      if (!this.$v.sequenceModel.required) errors.push('Sequence is required');
      return errors;
    },

    idModel() {
      return this.taskID;
    },
    sequenceModel: {
      get() {
        if (this.sequence === null) return this.taskForEdit ? this.taskForEdit.sequence : '';
        return this.sequence;
      },
      set(newValue) {
        this.sequence = newValue;
      },
    },
    priorityModel: {
      get() {
        if (this.priority === null) return this.taskForEdit ? PRIORITY_NAMES[this.taskForEdit.priority] : PRIORITY_NAMES[2];
        return this.priority;
      },
      set(newValue) {
        this.priority = newValue;
      },
    },
  },

  methods: {
    submit() {
      this.$v.$touch();
      if (this.sequenceErrors.length || this.priorityErrors.length) return;
      let { $model: sequence } = this.$v.sequenceModel;
      let { $model: priority } = this.$v.priorityModel;
      sequence = sequence.toUpperCase();
      priority = this.priorities.indexOf(priority) + 1;
      this.send(this.eventName, { id: this.taskID, sequence, priority });
      this.$emit('data-submitted-event'); // , payload);
    },
    randomizeTask() {
      const { sequence } = getRandomSequence();
      const priorityIndex = getRandomIntegerInRange(0, 3);
      this.sequenceModel = sequence;
      this.priorityModel = this.priorities[priorityIndex];
    },
    clear() {
      this.$v.$reset();
      this.sequenceModel = '';
      this.priorityModel = PRIORITY_NAMES['2']; // null;
    },

    nullSequenceAndPriority() {
      this.sequence = null;
      this.priority = null;
    },
  },
};
</script>
