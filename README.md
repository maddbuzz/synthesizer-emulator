# Test project "Synthesizer emulator"

## Common words and logic
The synthesis of oligonucleotides is a complex process that in a real laboratory requires tuning and calibration of a real synthesizer and depends on the hardware, software and chemicals used. As part of the test task, we propose to abstract as much as possible from reality and concentrate on only one (and the most important) parameter: the synthesized nucleotide sequence. To refresh in memory what nucleotides are and what they are, it is proposed independently. As part of the test task, we are only interested in adenine (A), thymine (T), guanine (G) and cytosine (C).

Each sequence defines a “synthesis problem”.

Sequence processing logic: the time that the synthesizer spends on one “synthesis task” is directly proportional to the length of the sequence. The synthesis of one monomer (that is, one letter in the sequence) takes 1 second.
Thus, the task of synthesizing, for example, the sequence `atgcccgttaa` will take the synthesizer for 11 seconds.

The synthesizer can be in one of three states: “busy”, “idle”, “on maintenance”.

Rules for switching between states:
- initial state of the synthesizer: “idle”
- after the last scheduled task is completed, it also enters the “idle” state
- synthesis tasks can be created, edited and deleted. Editing and deleting are available only if the synthesis task is not yet processed by the synthesizer.
- when created, the task must either be immediately taken into work by the synthesizer, or added to the queue if the synthesizer is busy. After the release of the synthesizer, the task in turn should be taken into processing.
- after every five tasks, the synthesizer should go into maintenance mode for 5 seconds. At this time, he cannot perform tasks, but he can receive them and put them in a queue

## What needs to be done
It is required to develop a single-page application (SPA) that emulates the operation of an oligonucleotide synthesizer according to the above rules. Run on vue second or third version. Upload the solution to your github and send a link. The solution needs to be able to be run locally with `npm i` + `npm run start` (up to the package manager and script names), or to accompany the project with a clear README so that it can be easily run locally and tested.

### Minimum functionality:
- schematically display the synthesizer using html / css: we can assume that this is a box with several indicators; read about the information on the indicators below *(in reality, the synthesizer is a miracle of engineering in the form of a large box or server rack with a huge number of tubes, nozzles, valves and bottles inside, as well as software that visualizes everything that happens inside, but we, again, abstract from this and leave only the highest level of abstraction is sequence)*
- add synthesizer status indication
- add an indication of the progress of the synthesis of one sequence (so that you can see which letters have already been attached, which one is being attached, and which ones are yet to be attached)
- add an input to add sequences to the queue
  - limit sequence length to range (6 - 120)
  - add sequence validation: it should not contain any characters other than the Latin letters “atgc”
  - examples of valid sequences: `atgcccgttaa`, `atgcgg`, `ggccggccggcc`
- implement a timer system that emulates the addition of a letter to a sequence. One letter joins the sequence in 1 second.
- wrap the task queue in the state manager of your choice (for example, vuex or pinia). In reality, of course, the source of information about the state of the tasks is the database and the state manager, which is a layer between the data and the display, but as part of the test task, we will update the task states using js.
- add a display of the queue of sequences for synthesis with an indication of the task that is currently in progress
- add UI elements for editing queued sequences

### Tasks for A+
- add the ability to prioritize tasks for synthesis:
  - "critical"
  - "average"
  - "low"
  - by default, the task gets a priority of "average".
  - you can change the status of a task to synthesis only if it is not in progress
- add an estimate of the time it will take the synthesizer to complete all tasks in the queue, and the end time for the current state of the queue.

# 

###  Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
