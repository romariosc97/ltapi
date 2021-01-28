const org = require(appRoot + "/src/org")
const sendMessage = require(appRoot + "/src/socket")
const dates = require("./dates")

const { Dataflow } = require("./classes")

const parsePromises = (settledArray, session = null, message = null) => {

  const fulfilled = settledArray
    .filter(p => p.status === 'fulfilled')
    .map(p => p.value)

  const rejected = settledArray
    .filter(p => p.status === 'rejected')
    .map(p => p.reason)

  if (session && message)
    sendMessage(session, 'timeshiftUpdate', message, { fulfilled, rejected })

  return { fulfilled, rejected }

}

exports.generateTimeshiftDataflow = async (conn, params) => {

  let mergeBranches = (branchArray) => {
    const def = {}
    for (const b of branchArray) {
      Object.assign(def, b.object)
    } return def
  }

  const { session, folderApiName, folderLabel, datasetArray } = params

  const fieldData = await dates.gatherDateFields(conn, session, datasetArray),
        fieldsGathered = parsePromises(fieldData, session, 'Fetched Date Fields'),
        fieldsFlat = fieldsGathered.fulfilled.flat();

  const dateData = await dates.gatherDateValues(conn, session, fieldsFlat),
        { fulfilled, rejected } = parsePromises(dateData, session, 'Fetched Date Values');

  const parsedResults = dates.suggestDates(fulfilled)

  sendMessage(session, 'timeshiftUpdate', 'Date Values Parsed', parsedResults)

  const generatedBranches = Object.entries(parsedResults).map(([key, dataset]) => {


    const branchSettings = {
      inputDataset: key,
      dateFields: dataset.fieldData,
      seedDate: dataset.suggestedDate,
      primer: true
    }

    return new Dataflow.Branch(branchSettings)

  })

  const dataflowObject = mergeBranches(generatedBranches),
        dataflowString = JSON.stringify(dataflowObject);

  try {

    const dfCreate = await org.createDataflow(conn, {
      DeveloperName: 'Test_TS_Dataflow1',
      MasterLabel: 'Test Timeshift Dataflow 1',
      State: 'Active'
    })

    const dfvCreate = await org.createDataflowVersion(conn, {
      DataflowId: dfCreate.id,
      DataflowDefinition: dataflowString
    })

    const dfvAssign = await org.assignDataflowVersion(conn, dfCreate.id, dfvCreate.id)

    return {
      success: true,
      dataflowId: dfCreate.id,
      dataflowVersionId: dfvCreate.id
    }

  } catch (error) {
    console.error(error.message)
    return {
      success: false,
      message: error.message
    }
  }


}
