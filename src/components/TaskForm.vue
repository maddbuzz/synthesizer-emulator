<script setup>
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';

import { getRandomIntegerInRange } from '../math';
import { PRIORITY_NAMES, allowedNucleotides, getRandomSequence } from '../nucleotides-synthesizer-machine';

defineProps({
  send: Function,
});
</script>

<template>
  <form class="pa-2 elevation-4">
    <v-text-field v-model="sequence" :error-messages="sequenceErrors" :counter="120" label="Sequence" required
      @input="$v.sequence.$touch()" @blur="$v.sequence.$touch()"></v-text-field>
    <v-select v-model="select" :items="priorities" :error-messages="selectErrors" label="Priority" required
      @change="$v.select.$touch()" @blur="$v.select.$touch()"></v-select>

    <v-btn class="mr-3" @click="addTask">
      add new task
    </v-btn>
    <v-btn class="mr-3" @click="randomizeTask">
      randomize
    </v-btn>
    <v-btn @click="clear">
      clear
    </v-btn>
  </form>
</template>

<script>
export default {
  name: 'TaskForm',

  mixins: [validationMixin],

  validations: {
    sequence: { required, minLength: minLength(6), maxLength: maxLength(120) },
    select: { required },
  },

  data: () => ({
    sequence: '',
    select: PRIORITY_NAMES[2], // null,
    priorities: Object.values(PRIORITY_NAMES),
  }),

  computed: {
    selectErrors() {
      const errors = [];
      if (!this.$v.select.$dirty) return errors;
      if (!this.$v.select.required) errors.push('Priority is required');
      return errors;
    },
    sequenceErrors() {
      const errors = [];
      if (!this.$v.sequence.$dirty) return errors;

      const { $model: seq } = this.$v.sequence;
      if ([...seq.toUpperCase()].some((el) => !allowedNucleotides.includes(el))) {
        errors.push(`Sequence must contain only ${[...allowedNucleotides]}`);
      }

      if (!this.$v.sequence.minLength) errors.push('Sequence must be at least 6 characters long');
      if (!this.$v.sequence.maxLength) errors.push('Sequence must be at most 120 characters long');
      if (!this.$v.sequence.required) errors.push('Sequence is required');
      return errors;
    },
  },

  methods: {
    // submit() {
    //   this.$v.$touch();
    // },
    addTask() {
      this.$v.$touch();
      if (this.sequenceErrors.length || this.selectErrors.length) return;
      const { $model: seq } = this.$v.sequence;
      const { $model: pri } = this.$v.select;
      const sequence = seq.toUpperCase();
      const priority = this.priorities.indexOf(pri) + 1;
      this.send('CREATE_TASK', { sequence, priority });
    },
    randomizeTask() {
      const { sequence } = getRandomSequence();
      const priorityIndex = getRandomIntegerInRange(0, 3);
      this.sequence = sequence;
      this.select = this.priorities[priorityIndex];
    },
    clear() {
      this.$v.$reset();
      this.sequence = '';
      this.select = PRIORITY_NAMES['2']; // null;
    },
  },
};
</script>
