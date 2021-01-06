const express = require("express")

const { ltApi } = require(appRoot + "/config"),
      strategies = require("./strategies");

const router = express.Router()

router
  .post(ltApi('auth_login'), strategies.credentialLogin)
  .post(ltApi('auth_sfdc'), strategies.salesforceSession)
  .get(ltApi('auth_oauth'), strategies.oauthRedirect)
  .get(ltApi('auth_callback'), strategies.handleOauthCallback)
  .get(ltApi('auth_session'), strategies.getSessionInfo)
  .get(ltApi('auth_revoke'), strategies.revokeSession)

module.exports = router
