import {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  GCP_PROJECT_ID,
  GCS_BUCKET_NAME,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
} from '@config/env'
import UploadService from '@controllers/Upload/service'
import { logServer } from '@expresso/helpers/Formatter'
import cron from 'node-cron'

class UploadJob {
  /**
   * Get Example Task
   */
  public static getTask(): cron.ScheduledTask {
    // Run this job every 2:00 am
    const task = cron.schedule('*/30 * * * *', async () => {
      // Update Signed URL from Aws S3
      if (AWS_ACCESS_KEY && AWS_SECRET_KEY) {
        await UploadService.updateSignedUrlS3()
      }

      // Update Signed URL from GCS
      if (GCP_PROJECT_ID && GCS_BUCKET_NAME) {
        await UploadService.updateSignedUrlGCS()
      }

      // Update Signed URL from MinIO
      if (MINIO_ACCESS_KEY && MINIO_SECRET_KEY) {
        await UploadService.updateSignedUrlMinIO()
      }

      const msgType = `Cron Job:`
      const message = 'Running task every 30 minutes'

      console.log(logServer(msgType, message))
    })

    return task
  }
}

export default UploadJob
