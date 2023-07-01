import { assign, createMachine } from 'xstate';
import { getRandomIntegerInRange } from './math';

const TASKS_BEFORE_MAINTENANCE = 5;
const ON_MAINTENANCE_TIME = 5000;
const ELEMENT_SYNTHESIS_TIME = 1000;
const ESTIMATED_TIME_RECALCULATION_INTERVAL = 1000;

// Task statuses:
const PENDING = 'PENDING';
const PROCESSING = 'PROCESSING';
const COMPLETED = 'COMPLETED';
// const EDITING = 'EDITING';

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
    nextTaskID: 1,
    tasksCompletedInRow: 0,
    allTasksEstimatedTime: 0,
    allTasksEndTime: '',
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
              entry: 'decrementElementsLeft',
              after: {
                ELEMENT_SYNTHESIS_TIME: [
                  {
                    target: '#nucleotidesSynthesizer.synthesizer.busy.elementSynthesis',
                    cond: 'elementsLeft',
                    actions: [],
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
            ON_MAINTENANCE_TIME: {
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

    estimatedTimeCalculator: {
      initial: 'calculateTime',
      states: {
        calculateTime: {
          entry: 'calculateEstimatedTime',
          after: {
            ESTIMATED_TIME_RECALCULATION_INTERVAL: {
              target: '#nucleotidesSynthesizer.estimatedTimeCalculator.calculateTime',
              actions: [],
              internal: false,
            },
          },
        },
      },
    },
  },
}, {
  guards: {
    queueNotEmpty: (context, _event) => (!!context.queue.length),
    elementsLeft: ({ currentTask }) => (!!currentTask.elementsLeft),
    manyTasksCompletedInRow: ({ tasksCompletedInRow }) => (tasksCompletedInRow >= TASKS_BEFORE_MAINTENANCE),
    // TODO:
    taskPending: () => false,
  },

  actions: {
    prepareCurrentTask: assign({
      currentTask: (context) => {
        const task = context.queue[0];
        task.elementsLeft = task.length;
        task.status = PROCESSING;
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
        queue, completedTasks, currentTask, tasksCompletedInRow,
      } = context;
      const index = queue.indexOf(currentTask);
      if (index === -1) throw Error("moveToCompleted: can't find currentTask!");
      currentTask.status = COMPLETED;
      completedTasks.push(currentTask);
      queue.splice(index, 1);
      return {
        queue, completedTasks, currentTask: {}, tasksCompletedInRow: tasksCompletedInRow + 1,
      };
    }),

    resetTasksCompletedInRow: assign({ tasksCompletedInRow: 0 }),

    pushTask: assign({
      queue: (context) => {
        const { queue, nextTaskID } = context;
        const defaultTask = {
          id: nextTaskID, status: PENDING, priority: 2, sequence: '', length: 0,
        };
        const priority = getRandomIntegerInRange(1, 4);
        const newTask = { ...defaultTask, priority, ...getRandomSequence(6, 13) };
        queue.push(newTask);
        return queue;
      },
      nextTaskID: ({ nextTaskID }) => nextTaskID + 1,
    }),

    sortTasks: assign({
      queue: (context) => {
        const { queue } = context;
        queue.sort((a, b) => b.priority - a.priority);
        return queue;
      },
    }),

    calculateEstimatedTime: assign((context) => {
      const { queue } = context;
      if (!queue.length) return { allTasksEstimatedTime: 0 };
      let tasksNumber = 0;
      const tasksTime = queue
        .reduce((acc, task) => {
          if (PENDING !== task.status && PROCESSING !== task.status) return acc;
          tasksNumber += 1;
          const time = (undefined !== task.elementsLeft ? task.elementsLeft : task.length) * ELEMENT_SYNTHESIS_TIME;
          return acc + time;
        }, 0);
      const estimatedTime = tasksTime + (tasksNumber / TASKS_BEFORE_MAINTENANCE) * ON_MAINTENANCE_TIME;
      const allTasksEstimatedTime = Math.trunc(estimatedTime);
      const allTasksEndTime = (new Date(Date.now() + allTasksEstimatedTime)).toTimeString();
      return { allTasksEstimatedTime, allTasksEndTime };
    }),

    // TODO:
    editTask: () => console.log('editTask'),
    deleteTask: () => console.log('deleteTask'),
  },

  delays: { // can be a function: (context, event) => ...
    ELEMENT_SYNTHESIS_TIME,
    ON_MAINTENANCE_TIME,
    ESTIMATED_TIME_RECALCULATION_INTERVAL,
  },
});

export default synthesizerMachine;
