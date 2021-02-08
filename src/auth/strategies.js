require("dotenv").config()

const jsforce = require("jsforce")

const { ltApi } = require(appRoot + "/config"),
      helpers = require("./helpers");

const salesforceInfo = async (connection) => {

  const identity = await connection.identity(),
        orgApi = await helpers.getSfdcApi(connection)

  return {
    api: orgApi,
    auth: {
      accessToken: connection.accessToken,
      instanceUrl: connection.instanceUrl
    },
    user: {
      id: identity.user_id,
      name: identity.display_name,
      email: identity.email,
      username: identity.username,
    }
  }

}

const handleSuccess = async (req, res, connection) => {

  req.session.salesforce = await salesforceInfo(connection)
  req.session.socketRoom = req.session.id
  req.session.jobs = []

  const { api, auth, user } = req.session.salesforce

  return res.status(200).json({
    message: `Logged in as ${user.name} at ${auth.instanceUrl} (API v${api.version})`
  })

}

const handleError = (res, error, code) => {
  console.error(error.message)
  return res.status(code || 500).json({ error: error.message })
}

/* Username & Password Login */

exports.credentialLogin = (req, res) => {
  const { username, password } = req.body
  const conn = new jsforce.Connection()

  conn.login(username, password)
    .then(_ => handleSuccess(req, res, conn))
    .catch(error => handleError(res, error, 403))
}

/* Salesforce Session */

exports.salesforceSession = (req, res) => {
    const sfdcSession = req.body
    const conn = new jsforce.Connection(sfdcSession)

    handleSuccess(req, res, conn)
      .catch(error => handleError(res, error))
}

/* Oauth2 */

const oauth2 = new jsforce.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.HOSTNAME + ltApi('auth_callback')
})

exports.oauthRedirect = (req, res) => {
  res.redirect(oauth2.getAuthorizationUrl())
}

exports.handleOauthCallback = async (req, res) => {

  const conn = new jsforce.Connection({ oauth2: oauth2 })

  conn.authorize(req.query.code)
    .then(async (_) => {

      req.session.salesforce = await salesforceInfo(conn)
      req.session.socketRoom = req.session.id
      req.session.jobs = []

      const { api, auth, user } = req.session.salesforce

      res.redirect(process.env.FRONTEND_HOSTNAME + '/deploy')

    })
    .catch(error => handleError(res, error, 403))

}

/* Session Info */

exports.getSessionInfo = (req, res) => {
  return res.status(200).json(req.session)
}

/* Logout */

exports.revokeSession = async (req, res) => {

  let result
  const conn = helpers.refreshConnection(req.session)

  try {
    await conn.logout()
    result = `Logged out`
  } catch (error) {
    result = `Log out failed`
  } finally {
    req.session.destroy()
    res.status(200).json({ message: `${result}. Session destroyed.` })
  }

}
