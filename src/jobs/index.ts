import ExampleJob from './ExampleJob'

function initialJobs(): void {
  // Example Job
  const exampleTask = ExampleJob.getTask()
  exampleTask.start()
}

export default initialJobs
