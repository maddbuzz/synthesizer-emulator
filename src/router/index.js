import Vue from 'vue';
import VueRouter from 'vue-router';
// import HomeView from '../views/HomeView.vue';

import { useMachine } from 'xstate-vue2';
import SynthesizerView from '../views/SynthesizerView.vue';
import AllTasksView from '../views/AllTasksView.vue';
import synthesizerMachine from '../nucleotides-synthesizer-machine';
// import NotFound from '../components/NotFound.vue';

const { state, send } = useMachine(synthesizerMachine);

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'synthesizer',
    component: SynthesizerView,
    props: { state, send },
  },
  {
    path: '/all-tasks',
    name: 'all-tasks',
    component: AllTasksView,
    props: { state, send },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  // { path: '*', component: NotFound },
];

const router = new VueRouter({
  routes,
});

export default router;
