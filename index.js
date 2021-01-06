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
      logger = require("./src/logger");

const app = express()

app
  .use(cors({
    origin: "*",
    credentials: true
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(logger)
  .use(session({
    genid: (req) => {
      return uuidv4()
    },
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: (60 * 60 * 1000),
      sameSite: "lax"
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
  }))

const server = app.listen(process.env.PORT || 8080, async () => {
  await agenda.queue.start()
  util.connectToDb()
})


const socket = require("./src/socket")(server);
const router = require("./src/router")(socket.io);
const agenda = require("./src/agenda")(socket.io);
const auth = require("./src/auth");

global.my_io = socket.io;

/* AUTH */

app.route(config.ltApi("auth_required"))
  .all(auth.handleAuthRequired)

app.route(config.ltApi("auth_request"))
  .get(auth.visitedAuth)
  .post(auth.routeRequest)

app.route(config.ltApi("auth_callback"))
  .get(auth.handleOauthCallback)

app.route(config.ltApi("auth_revoke"))
  .get(auth.destroyConnection)

app.route(config.ltApi("auth_session"))
  .get(auth.describeSession)

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
