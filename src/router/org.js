const org = require(appRoot + "/src/org"),
      auth = require(appRoot + "/src/auth");

const getOrgFolders = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getFolders(conn)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const getOrgDatasets = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getDatasets(conn, req.params.folder_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const getOrgDataflows = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getDataflows(conn, req.params.folder_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const getOrgTsDataflows = async (req, res) => {
  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getTsDataflows(conn)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }
}

const getCurrentDataflowVersion = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getSingleDataflow(conn, req.params.dataflow_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const getOrgTemplates = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getTemplates(conn)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const getSingleOrgTemplate = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.getSingleTemplate(conn, req.params.template_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const deleteSingleOrgTemplate = async (req, res) => {

  try {
    const conn = auth.refreshConnection(req.session)
    const result = await org.deleteSingleTemplate(conn, req.params.template_id)
    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const createTemplateFromApp = async (req, res) => {

  try {

    const params = {
      session: req.session,
      folder_id: req.body.folder_id,
      dataflow_id: req.body.dataflow_id
    }

    const conn = auth.refreshConnection(req.session)
    const result = await org.createTemplate(conn, params)

    res.status(200).json(result)

  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const updateTemplateFromApp = async (req, res) => {

  try {

    const params = {
      session: req.session,
      folder_id: req.body.folder_id,
      dataflow_id: req.body.dataflow_id
    }

    const conn = auth.refreshConnection(req.session)
    const result = await org.updateTemplate(conn, params)

    res.status(200).json(result)

  } catch (e) {
    console.error(e)
    res.status(500).json(e.message)
  }

}

const refreshDatasets = async (req, res) => {

  // implement with bull

}

const runDataflow = async (req, res) => {

  const params = {
    session: req.session,
    dataflow_id: req.params.dataflow_id
  }

  // implement with bull

}

module.exports = {
  getOrgFolders: getOrgFolders,
  getOrgDatasets: getOrgDatasets,
  getOrgDataflows: getOrgDataflows,
  getOrgTsDataflows: getOrgTsDataflows,
  getCurrentDataflowVersion: getCurrentDataflowVersion,
  getOrgTemplates: getOrgTemplates,
  getSingleOrgTemplate: getSingleOrgTemplate,
  deleteSingleOrgTemplate: deleteSingleOrgTemplate,
  createTemplateFromApp: createTemplateFromApp,
  updateTemplateFromApp: updateTemplateFromApp,
  refreshDatasets: refreshDatasets,
  runDataflow: runDataflow
}
