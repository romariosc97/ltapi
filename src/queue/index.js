const Queue = require("bull")

const auth = require(appRoot + "/src/auth")
const s3 = require(appRoot + "/src/repo")
const jobs = require("./jobs")

const deployQueue = new Queue("metadata_deploy", process.env.REDIS_URL)

deployQueue.process((job) => {
  const params = job.data
  const conn = auth.refreshConnection(params.session)
  return s3.downloadAndDeployTemplate(conn, params)
})

deployQueue.on("completed", (job, result) => {
  console.log(`Job with id ${job.id} has been completed.`)
  io.to(job.data.session.socketRoom).emit('jobUpdate', result)
})

module.exports = {
  deployQueue: deployQueue
}
