const Queue = require("bull")

const auth = require(appRoot + "/src/auth"),
      s3 = require(appRoot + "/src/repo");

const jobQueue = new Queue("lowtide_jobs", process.env.REDIS_URL)

jobQueue.process('template_deploy', (job) => {
  const params = job.data
  const conn = auth.refreshConnection(params.session)
  return s3.downloadAndDeployTemplate(conn, params)
})

jobQueue.process('generate_timeshift_dataflows', (job) => {
  const params = job.data
  console.log(params)
})

const sendUpdate = (job, message, object) => {
  io.to(job.data.session.socketRoom).emit('jobUpdate', {
    message: message, ...object
  })
}

jobQueue.on("completed", (job, result) => {
  console.log(`Job with id ${job.id} has been completed.`)
  sendUpdate(job, 'Job has completed.', result)
})

jobQueue.on("failed", (job, err) => {
  console.error(`Job with id ${job.id} has failed.`)
  sendUpdate(job, 'Job has failed.', err)
})

jobQueue.on("error", (error) => {
  console.error(`A job error occurred: ${error.message}.`)
})

jobQueue.on("waiting", (jobId) => {
  console.log(`Job with ID ${jobId} is waiting.`)
});

jobQueue.on("active", (job, jobPromise) => {
  console.error(`Job with id ${job.id} has started.`)
  sendUpdate(job, 'Job has started.')
})

jobQueue.on("stalled", (job) => {
  console.warning(`Job with id ${job.id} has stalled.`)
  sendUpdate(job, 'Job has stalled.')
})

jobQueue.on("progress", (job, progress) => {
  console.log(`Job with id ${job.id} has progressed.`)
  sendUpdate(job, 'Job has progressed.', progress)
})

jobQueue.on("drained", () => {
  console.log('Job queue has drained.')
})


module.exports = jobQueue
