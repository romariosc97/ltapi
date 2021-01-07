require("dotenv").config()

const fs = require("fs"),
      path = require("path"),
      jsforce = require("jsforce"),
      express = require("express"),
      cors = require("cors"),
      session = require("express-session"),
      socketSession = require("express-socket.io-session");

global.appRoot = path.resolve(__dirname)

const config = require("./config"),
      util = require("./src/utils"),
      repo = require("./src/repo"),
      auth = require("./src/auth"),
      logger = require("./src/logger")
      socketio = require("socket.io"),
      router = require("./src/router");

const app = express()

app
  .use(cors(config.corsOptions))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(auth.session)
  .use("/api/*", auth.required)
  .use(auth.middleware)

const server = app.listen(process.env.PORT || 8080)

global.io = socketio(server)

io.use(socketSession(auth.session))

io.on('connection', socket => {

  socket.on('subscribeToJobUpdates', (providedId) => {
    const sessionId = providedId || socket.handshake.session.socketRoom
    console.log('Subscribing to updates, roomId:', sessionId)
    socket.join(sessionId)
  })

})

/* ORG FOLDERS, DATASETS, DATAFLOWS, TEMPLATES */

app.route(config.ltApi("org_folders"))
  .get(router.org.getOrgFolders)

app.route(config.ltApi("org_datasets"))
  .get(router.org.getOrgDatasets)

app.route(config.ltApi("org_datasets_folder"))
  .get(router.org.getOrgDatasets)

app.route(config.ltApi("org_datasets_refresh"))
  .get(router.org.refreshDatasets)

app.route(config.ltApi("org_dataflows"))
  .get(router.org.getOrgDataflows)
  .post(router.timeshift.dataflowOperation)

app.route(config.ltApi("org_dataflows_folder"))
  .get(router.org.getOrgDataflows)

app.route(config.ltApi("org_dataflow_single"))
  .get(router.org.getCurrentDataflowVersion)

app.route(config.ltApi("org_dataflows_run"))
  .get(router.org.runDataflow)

app.route(config.ltApi("org_templates"))
  .get(router.org.getOrgTemplates)
  .post(router.org.createTemplateFromApp)
  .patch(router.org.updateTemplateFromApp)

app.route(config.ltApi("org_template_single"))
  .get(router.org.getSingleOrgTemplate)
  .delete(router.org.deleteSingleOrgTemplate)

/* SERVER REPOSITORY: TEMPLATES */

app.route(config.ltApi("repo_templates"))
  .get(router.repo.getTemplates)

app.route(config.ltApi("repo_template_deploy"))
  .post(router.repo.deployFromS3)

/* ASYNC JOB QUEUE */

app.route(config.ltApi("job_status"))
  .get(router.jobs.getStatus)

app.route(config.ltApi("session_jobs"))
  .get(router.jobs.checkSessionJobs)

app.get("/", (_, res) => {
  res.sendFile(__dirname + '/public/home.html');
})
