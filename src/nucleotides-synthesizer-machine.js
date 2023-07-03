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
    allTasksEstimatedTime: 0, // milliseconds timestamp
    allTasksEndTime: 0, // also timestamp
  },

  states: {
    synthesizer: {
      initial: 'idle',
      states: {
        idle: {
          always: {
            target: 'busy',
            cond: 'someTaskPending',
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
    someTaskPending: ({ queue }) => queue.some((task) => (PENDING === task.status)),
    elementsLeft: ({ currentTask }) => (currentTask.elementsLeft > 0),
    manyTasksCompletedInRow: ({ tasksCompletedInRow }) => (tasksCompletedInRow >= TASKS_BEFORE_MAINTENANCE),
    // TODO:
    taskPending: (_context, _event) => false,
  },

  actions: {
    pushTask: assign(({ queue, nextTaskID }) => {
      const newTaskProps = {
        id: nextTaskID, status: PENDING, priority: 2, sequence: '', length: 0, createdAt: Date.now(),
      };
      const priority = getRandomIntegerInRange(1, 4);
      const newTask = { ...newTaskProps, priority, ...getRandomSequence(6, 13) };
      queue.push(newTask);
      return { queue, nextTaskID: nextTaskID + 1 };
    }),

    sortTasks: assign(({ queue }) => {
      queue.sort((a, b) => b.priority - a.priority);
      return { queue };
    }),

    prepareCurrentTask: assign(({ queue }) => {
      const currentTask = queue.find((task) => (PENDING === task.status));
      if (undefined === currentTask) throw Error("prepareCurrentTask: can't find pending task!");
      currentTask.status = PROCESSING;
      currentTask.elementsLeft = currentTask.length;
      return { currentTask };
    }),

    decrementElementsLeft: assign((context) => {
      const { currentTask } = context;
      currentTask.elementsLeft -= 1;
      return { currentTask };
    }),

    moveToCompleted: assign((context) => {
      const {
        queue, completedTasks, currentTask, tasksCompletedInRow,
      } = context;
      const index = queue.indexOf(currentTask);
      if (index === -1) throw Error("moveToCompleted: can't find currentTask!");
      currentTask.status = COMPLETED;
      currentTask.completedAt = Date.now();
      delete currentTask.length;
      delete currentTask.elementsLeft;
      completedTasks.push(currentTask);
      queue.splice(index, 1);
      return {
        queue, completedTasks, currentTask: {}, tasksCompletedInRow: tasksCompletedInRow + 1,
      };
    }),

    resetTasksCompletedInRow: assign({ tasksCompletedInRow: 0 }),

    calculateEstimatedTime: assign(({ queue, tasksCompletedInRow }) => {
      if (!queue.length) return { allTasksEstimatedTime: 0 };
      if (TASKS_BEFORE_MAINTENANCE === tasksCompletedInRow) return {}; // synthesizer on maintenance?

      let taskEstimatedTime = 0;
      let taskEndTime = 0;

      let tasksNumber = 0;
      queue.reduce((accTime, task) => {
        if ((PENDING !== task.status) && (PROCESSING !== task.status)) return accTime;
        tasksNumber += 1;
        const taskTime = (undefined !== task.elementsLeft ? task.elementsLeft : task.length) * ELEMENT_SYNTHESIS_TIME;

        let estimatedMaintenancesNumber = (tasksCompletedInRow + tasksNumber) / TASKS_BEFORE_MAINTENANCE;
        if (Number.isInteger(estimatedMaintenancesNumber)) estimatedMaintenancesNumber -= 1;
        else estimatedMaintenancesNumber = Math.trunc(estimatedMaintenancesNumber);
        const maintenancesTime = ON_MAINTENANCE_TIME * estimatedMaintenancesNumber;

        const accumulatedTime = accTime + taskTime;

        taskEstimatedTime = accumulatedTime + maintenancesTime;
        taskEndTime = Date.now() + taskEstimatedTime;
        Object.assign(task, { taskEndTime });

        return accumulatedTime;
      }, 0);

      return { allTasksEstimatedTime: taskEstimatedTime, allTasksEndTime: taskEndTime };
    }),

    // TODO:
    editTask: () => console.log('editTask'),
    deleteTask: () => console.log('deleteTask'),
  },

  delays: { // can be a constant or a function: (context, event) => ...
    ELEMENT_SYNTHESIS_TIME,
    ON_MAINTENANCE_TIME,
    ESTIMATED_TIME_RECALCULATION_INTERVAL,
  },
});

export default synthesizerMachine;
