<script setup>
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';

import { getRandomIntegerInRange } from '../math';
import { PRIORITY_NAMES, allowedNucleotides, getRandomSequence } from '../nucleotides-synthesizer-machine';

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
          Adding new task
        </v-card-title>

        <form class="pa-2">
          <v-text-field v-model="getID" label="ID" disabled></v-text-field>
          <v-text-field v-model="sequence" :error-messages="sequenceErrors" :counter="120" label="Sequence" required
            @input="$v.sequence.$touch()" @blur="$v.sequence.$touch()"></v-text-field>
          <v-select v-model="select" :items="priorities" :error-messages="selectErrors" label="Priority" required
            @change="$v.select.$touch()" @blur="$v.select.$touch()"></v-select>

          <v-btn class="blue white--text mr-3" @click="addTask">
            add task
          </v-btn>
          <v-btn class="blue white--text mr-3" @click="randomizeTask">
            randomize
          </v-btn>
          <v-btn class="blue white--text" @click="clear">
            clear
          </v-btn>
        </form>

      </v-card>

    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'TaskDialog',

  mixins: [validationMixin],

  validations: {
    sequence: { required, minLength: minLength(6), maxLength: maxLength(120) },
    select: { required },
  },

  data: () => ({
    dialog: false, // initial state

    // id: state.context.nextTaskID, // !error! - use computed getID instead!
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
    getID() {
      // console.log('this.state.context.nextTaskID', this.state.context.nextTaskID);
      return this.state.context.nextTaskID;
    },
  },

  methods: {
    addTask() {
      this.$v.$touch();
      if (this.sequenceErrors.length || this.selectErrors.length) return;
      const { $model: seq } = this.$v.sequence;
      const { $model: pri } = this.$v.select;
      const sequence = seq.toUpperCase();
      const priority = this.priorities.indexOf(pri) + 1;
      // console.log('this.state.context.nextTaskID', this.state.context.nextTaskID);
      this.send('ADD_NEW_TASK', { sequence, priority });
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
