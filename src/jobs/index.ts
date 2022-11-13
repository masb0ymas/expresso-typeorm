import SessionJob from './SessionJob'
import UploadJob from './UploadJob'

function initialJobs(): void {
  // Upload Job
  const uploadTask = UploadJob.getTask()
  uploadTask.start()

  // Session Job
  const sessionTask = SessionJob.getTask()
  sessionTask.start()
}

export default initialJobs
