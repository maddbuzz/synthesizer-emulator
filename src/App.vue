<template>
  <v-app>

    <v-app-bar app>
      <v-toolbar-title>
        <!-- <router-link to="/" tag="span" style="cursor: pointer">{{ appTitle }}</router-link> -->
        {{ appTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn text v-for="item in menuItems" :key="item.title" :to="item.path">
          <v-icon left dark>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      appTitle: 'Nucleotides Synthesizer Emulator',
      menuItems: [
        // { title: 'Home', path: '/home', icon: 'home' },
        // { title: 'Sign Up', path: '/signup', icon: 'face' },
        // { title: 'Sign In', path: '/signin', icon: 'lock_open' },
        { title: 'Synthesizer', path: '/', icon: 'add_task' },
        { title: 'All tasks', path: '/all-tasks', icon: 'table_rows' },
      ],
    };
  },
};
</script>

<style></style>
