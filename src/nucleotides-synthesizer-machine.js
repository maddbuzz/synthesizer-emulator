/* eslint-disable no-param-reassign */
import { assign, createMachine } from 'xstate';
// import { useMachine } from 'xstate-vue2';

import { getRandomIntegerInRange } from './math';

const getRandomNucleotide = (nucleotides = 'ATGC') => nucleotides[getRandomIntegerInRange(0, nucleotides.length)];

const getRandomSequence = (minLengthInclusive = 6, maxLengthExclusive = 121) => {
  const length = getRandomIntegerInRange(minLengthInclusive, maxLengthExclusive);
  const sequence = Array
    .from({ length }, () => getRandomNucleotide())
    .join('');
  return { sequence, length };
};

const synthesizerMachine = createMachine({
  id: 'nucleotidesSynthesizer',
  type: 'parallel',
  predictableActionArguments: true,
  preserveActionOrder: true,
  context: {
    queue: [],
    currentTask: {},
    completedTasks: [],
    // nextTaskID: 1,
    // tasksCompletedInRow: 0,
    tasksParams: {
      nextTaskID: 1,
      tasksCompletedInRow: 0,
    },
  },

  states: {
    synthesizer: {
      initial: 'idle',
      states: {
        idle: {
          always: {
            target: 'busy',
            cond: 'queueNotEmpty',
          },
        },
        busy: {
          initial: 'taskStarted',
          states: {
            taskStarted: {
              entry: 'prepareCurrentTask',
              always: {
                target: 'elementSynthesis',
              },
            },
            elementSynthesis: {
              after: {
                1000: [
                  {
                    target: '#nucleotidesSynthesizer.synthesizer.busy.elementSynthesis',
                    cond: 'elementsLeft',
                    actions: ['decrementElementsLeft'],
                    internal: false,
                  },
                  {
                    target: '#nucleotidesSynthesizer.synthesizer.busy.taskCompleted',
                    actions: [],
                    internal: false,
                  },
                ],
              },
            },
            taskCompleted: {
              entry: 'moveToCompleted',
              type: 'final',
            },
          },
          onDone: [
            {
              target: 'onMaintenance',
              cond: 'manyTasksCompletedInRow',
            },
            {
              target: 'idle',
            },
          ],
        },
        onMaintenance: {
          after: {
            5000: {
              target: '#nucleotidesSynthesizer.synthesizer.idle',
              actions: [],
              internal: false,
            },
          },
          exit: 'resetTasksCompletedInRow',
        },
      },
    },
    tasksQueue: {
      initial: 'waiting',
      states: {
        waiting: {
          on: {
            ADD_NEW_TASK: {
              target: 'taskEnqueueing',
            },
            EDIT_TASK: {
              target: 'taskEditing',
              cond: 'taskPending',
            },
            DELETE_TASK: {
              target: 'taskDeleting',
              cond: 'taskPending',
            },
          },
        },
        taskEnqueueing: {
          entry: 'pushTask',
          always: {
            target: 'sortByPriorities',
          },
        },
        taskEditing: {
          entry: 'editTask',
          always: {
            target: 'sortByPriorities',
          },
        },
        taskDeleting: {
          entry: 'deleteTask',
          always: {
            target: 'waiting',
          },
        },
        sortByPriorities: {
          entry: 'sortTasks',
          always: {
            target: 'waiting',
          },
        },
      },
    },
  },
}, {
  guards: {
    queueNotEmpty: (context, _event) => (context.queue.length !== 0),
    elementsLeft: ({ currentTask }) => (currentTask.elementsLeft !== 0),
    manyTasksCompletedInRow: ({ tasksParams }) => (tasksParams.tasksCompletedInRow >= 5),
    // TODO:
    taskPending: () => false,
  },

  actions: {
    prepareCurrentTask: assign({
      currentTask: (context) => {
        const task = context.queue[0];
        task.elementsLeft = task.length;
        task.status = 'processing';
        return task;
      },
    }),

    decrementElementsLeft: assign({
      currentTask: (context) => {
        const { currentTask } = context;
        currentTask.elementsLeft -= 1;
        return currentTask;
      },
    }),

    moveToCompleted: assign((context) => {
      const {
        queue, currentTask, completedTasks, tasksParams,
      } = context;
      const index = queue.indexOf(currentTask);
      if (index === -1) throw Error("moveToCompleted: can't find currentTask!");
      currentTask.status = 'completed';
      tasksParams.tasksCompletedInRow += 1;
      completedTasks.push(currentTask);
      context.currentTask = {};
      queue.splice(index, 1);
      return context;
    }),

    resetTasksCompletedInRow: assign({
      tasksParams: ({ tasksParams }) => {
        tasksParams.tasksCompletedInRow = 0;
        return tasksParams;
      },
    }),

    pushTask: assign({
      queue: (context) => {
        const { queue, tasksParams: { nextTaskID } } = context;
        const defaultTask = {
          id: nextTaskID, status: 'pending', priority: 2, sequence: '', length: 0,
        };
        const priority = getRandomIntegerInRange(1, 4);
        const newTask = { ...defaultTask, priority, ...getRandomSequence(6, 13) };
        queue.push(newTask);
        return queue;
      },
      tasksParams: ({ tasksParams }) => {
        tasksParams.nextTaskID += 1;
        return tasksParams;
      },
    }),

    sortTasks: assign({
      queue: (context) => {
        const { queue } = context;
        queue.sort((a, b) => b.priority - a.priority);
        return queue;
      },
    }),

    // TODO:
    editTask: () => console.log('editTask'),
    deleteTask: () => console.log('deleteTask'),
  },
});

export default synthesizerMachine;
