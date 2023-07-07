import { assign, createMachine } from 'xstate';
import { getRandomIntegerInRange } from './math';

const TASKS_BEFORE_MAINTENANCE = 5;
const ON_MAINTENANCE_TIME = 5000;
const ELEMENT_SYNTHESIS_TIME = 1000;
const ESTIMATED_TIME_RECALCULATION_INTERVAL = 1000;

export const TASK_STATUSES = Object.freeze({
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  EDITING: 'Editing',
  DELETION_CONFIRMATION: 'Deletion confirmation',
});

export const PRIORITY_NAMES = Object.freeze({
  1: 'Low',
  2: 'Average',
  3: 'Critical',
});

export const NUCLEOTIDES = 'ATGC';

const getRandomNucleotide = (nucleotides = NUCLEOTIDES) => nucleotides[getRandomIntegerInRange(0, nucleotides.length)];
export const getRandomSequence = (minLengthInclusive = 6, maxLengthExclusive = 121) => {
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
            CREATE_TASK: {
              // actions: [(context, event) => console.log(event)],
              target: 'taskEnqueueing',
            },
            EDIT_TASK: [
              {
                target: 'taskEditing',
                cond: 'taskPending',
              },
              {
                target: 'waiting',
                internal: false,
              },
            ],
            DELETE_TASK: [
              {
                target: 'taskDeleting',
                cond: 'taskPending',
              },
              {
                target: 'waiting',
                internal: false,
              },
            ],
          },
        },
        taskEnqueueing: {
          entry: 'pushTask',
          always: {
            target: 'sortByPriorities',
          },
        },
        sortByPriorities: {
          entry: 'sortTasks',
          always: {
            target: 'waiting',
          },
        },
        taskEditing: {
          entry: 'updateTaskStatus',
          on: {
            EDIT_CANCELED: {
              target: 'sortByPriorities', // !
              actions: 'updateTaskStatus',
            },
            UPDATE_TASK: {
              target: 'sortByPriorities',
              actions: 'updateTask',
            },
          },
        },
        taskDeleting: {
          entry: 'updateTaskStatus',
          on: {
            DELETE_CANCELED: {
              target: 'sortByPriorities', // !
              actions: 'updateTaskStatus',
            },
            DESTROY_TASK: {
              target: 'waiting',
              actions: 'destroyTask',
            },
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
    elementsLeft: ({ currentTask }) => (currentTask.elementsLeft > 0),
    manyTasksCompletedInRow: ({ tasksCompletedInRow }) => (tasksCompletedInRow >= TASKS_BEFORE_MAINTENANCE),
    someTaskPending: ({ queue }) => queue.some((task) => (TASK_STATUSES.PENDING === task.status)),
    taskPending: ({ queue }, event) => {
      const { id } = event;
      const task = queue.find((t) => t.id === id);
      if (!task) throw Error(`taskPending: can't find task with id === ${id}`);
      return TASK_STATUSES.PENDING === task.status;
    },
  },

  actions: {
    pushTask: assign({
      queue: ({ queue, nextTaskID }, event) => {
        const newTaskProps = {
          id: nextTaskID, status: TASK_STATUSES.PENDING, priority: 2, sequence: '', length: 0, createdAt: Date.now(), taskEndTime: 0,
        };
        const { priority, sequence } = event;
        const newTask = {
          ...newTaskProps, priority, sequence, length: sequence.length,
        };
        queue.push(newTask);
        return queue;
      },
      nextTaskID: ({ nextTaskID }) => nextTaskID + 1,
    }),

    updateTaskStatus: assign({
      queue: ({ queue }, event) => {
        console.log('updateTaskStatus', event);
        const { id } = event;
        const task = queue.find((t) => t.id === id);
        if (!task) throw Error(`updateTaskStatus: can't find task with id === ${id}`);
        let newStatus;
        switch (event.type) {
          case 'EDIT_TASK': newStatus = TASK_STATUSES.EDITING; break;
          case 'EDIT_CANCELED': newStatus = TASK_STATUSES.PENDING; break;
          case 'DELETE_TASK': newStatus = TASK_STATUSES.DELETION_CONFIRMATION; break;
          case 'DELETE_CANCELED': newStatus = TASK_STATUSES.PENDING; break;
          default: throw Error(`updateTaskStatus: unexpected event.type ${event.type}`);
        }
        Object.assign(task, { status: newStatus });
        return queue;
      },
    }),

    updateTask: assign({
      queue: ({ queue }, event) => {
        console.log('updateTask', event);
        const { id, priority, sequence } = event;
        const task = queue.find((t) => t.id === id);
        if (!task) throw Error(`updateTask: can't find task with id === ${id}`);
        Object.assign(task, { priority, sequence, status: TASK_STATUSES.PENDING });
        return queue;
      },
    }),

    destroyTask: assign({
      queue: ({ queue }, event) => {
        console.log('destroyTask', event);
        const { id } = event;
        const index = queue.findIndex((t) => t.id === id);
        if (index === -1) throw Error(`destroyTask: can't find task with id === ${id}`);
        queue.splice(index, 1);
        return queue;
      },
    }),

    sortTasks: assign({
      queue: ({ queue }) => {
        queue.sort((a, b) => {
          if (b.status === TASK_STATUSES.PROCESSING) return +1;
          if (a.status === TASK_STATUSES.PROCESSING) return -1;
          return b.priority - a.priority;
        });
        return queue;
      },
    }),

    prepareCurrentTask: assign({
      currentTask: ({ queue }) => {
        const currentTask = queue.find((task) => (TASK_STATUSES.PENDING === task.status));
        if (undefined === currentTask) throw Error("prepareCurrentTask: can't find pending task!");
        currentTask.status = TASK_STATUSES.PROCESSING;
        currentTask.elementsLeft = currentTask.length;
        return currentTask;
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
      currentTask.status = TASK_STATUSES.COMPLETED;
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

    // Tasks must be sorted before calculateEstimatedTime!
    calculateEstimatedTime: assign(({ queue, tasksCompletedInRow }) => {
      if (!queue.length) return { allTasksEstimatedTime: 0 };
      if (TASKS_BEFORE_MAINTENANCE === tasksCompletedInRow) return {}; // synthesizer on maintenance

      let taskEstimatedTime = 0;
      let taskEndTime = 0;

      let tasksNumber = 0;
      queue.reduce((accTime, task) => {
        if ((TASK_STATUSES.PENDING !== task.status) && (TASK_STATUSES.PROCESSING !== task.status)) return accTime;
        tasksNumber += 1;
        const taskTime = (undefined !== task.elementsLeft ? task.elementsLeft : task.length) * ELEMENT_SYNTHESIS_TIME;
        const newAccTime = accTime + taskTime;

        let estimatedMaintenancesNumber = (tasksCompletedInRow + tasksNumber) / TASKS_BEFORE_MAINTENANCE;
        if (Number.isInteger(estimatedMaintenancesNumber)) estimatedMaintenancesNumber -= 1;
        else estimatedMaintenancesNumber = Math.trunc(estimatedMaintenancesNumber);
        const maintenancesTime = ON_MAINTENANCE_TIME * estimatedMaintenancesNumber;

        taskEstimatedTime = newAccTime + maintenancesTime;
        taskEndTime = Date.now() + taskEstimatedTime;
        Object.assign(task, { taskEndTime }); // //

        return newAccTime;
      }, 0);

      return { queue, allTasksEstimatedTime: taskEstimatedTime, allTasksEndTime: taskEndTime };
    }),
  },

  delays: { // can be a constant or a function: (context, event) => ...
    ELEMENT_SYNTHESIS_TIME,
    ON_MAINTENANCE_TIME,
    ESTIMATED_TIME_RECALCULATION_INTERVAL,
  },
});

export default synthesizerMachine;
