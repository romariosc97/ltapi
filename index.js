require("dotenv").config()
const cors = require('cors');

const fs = require("fs"),
      path = require("path"),
      jsforce = require("jsforce"),
      express = require("express"),
      mongoose = require("mongoose"),
    { v4: uuidv4 } = require("uuid"),
      session = require("express-session"),
      MongoStore = require("connect-mongo")(session);

global.appRoot = path.resolve(__dirname)

const config = require("./config"),
      util = require("./src/utils"),
      repo = require("./src/repo"),
      auth = require("./src/auth"),
      logger = require("./src/logger")
      socketio = require("socket.io"),
      router = require("./src/router")
      agenda = require("./src/agenda");

const app = express()

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(auth.session)
  .use("/api/*", auth.required)
  .use(auth.middleware)
  .use(logger)

const server = app.listen(process.env.PORT || 8080, async () => {
  await agenda.start()
  util.connectToDb()
})

const io = require("socket.io")(server)
// global.io = socket;

io.on('connection', socket => {
  console.log('connected client')
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
  res.sendStatus(200);
})

app.get("/test", async (req, res) => {
  await agenda.now("upload_logs")
  res.sendStatus(200)
})
