import { printLog } from 'expresso-core'
import cron from 'node-cron'
import UploadService from '~/apps/services/upload.service'
import { NODE_ENV } from '~/config/env'

export class UploadJob {
  /**
   * Get Example Task
   */
  public static getTask(): cron.ScheduledTask {
    let cronExpression: string

    if (NODE_ENV === 'production') {
      cronExpression = '*/30 * * * *'
    } else {
      cronExpression = '*/5 * * * *'
    }

    // Run this job every 2:00 am
    const task = cron.schedule(cronExpression, async () => {
      // Update Signed URL Aws S3
      await UploadService.updateSignedURL()

      const msgType = `Cron Job:`
      const message = 'Running task every 15 minutes at 2:00 am'

      const logMessage = printLog(msgType, message)
      console.log(logMessage)
    })

    return task
  }
}
