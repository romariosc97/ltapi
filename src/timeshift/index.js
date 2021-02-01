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

exports.refreshDatasets = async (conn, params) => {

  const { datasetArray } = params

  // run touch then set for x minutes later to run ts generation logic

}

exports.generateTimeshiftDataflow = async (conn, params) => {

  let mergeBranches = (branchArray) => {
    const def = {}
    for (const b of branchArray) {
      Object.assign(def, b.object)
    } return def
  }

  let createDataflow = async (conn, folderLabel, folderApiName, isPrimer = true) => {

    const lowtideTsDf = 'LTTS',
          primerDev = isPrimer ? 'PRIMER_' : '',
          primer = isPrimer ? 'PRIMER' : '';

    const devName = `${lowtideTsDf}_TSDF_${primerDev}${folderApiName}`,
          tsLabel = `${folderLabel} Timeshift Dataflow ${primer}`;

    const dfCreate = await org.createDataflow(conn, {
      DeveloperName: devName.trim(),
      MasterLabel: tsLabel.trim(),
      State: 'Active'
    })

    const dfvCreate = await org.createDataflowVersion(conn, {
      DataflowId: dfCreate.id,
      DataflowDefinition: dataflowString
    })

    const dfvAssign = await org.assignDataflowVersion(conn, dfCreate.id, dfvCreate.id)

    return { devName, tsLabel, dfCreate, dfvCreate, dfvAssign }

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
    return new Dataflow.Branch({
      inputDataset: key,
      dateFields: dataset.fieldData,
      seedDate: dataset.suggestedDate,
      primer: true
    })
  })

  const dataflowObject = mergeBranches(generatedBranches),
        dataflowString = JSON.stringify(dataflowObject);

  try {

    const primerDataflow = await createDataflow(conn, folderLabel, folderApiName)
    sendMessage(session, 'timeshiftUpdate', 'Created Primer Dataflow', primerDataflow)

    const ongoingDataflow = await createDataflow(conn, folderLabel, folderApiName, false)
    sendMessage(session, 'timeshiftUpdate', 'Created Ongoing Dataflow', ongoingDataflow)

    const dfRun = await org.execRunDataflow(conn, session, primerDataflow.dfCreate.id)
    sendMessage(session, 'timeshiftUpdate', 'Running Primer Dataflow', dfRun)

    return {
      success: true,
      primerDataflow,
      ongoingDataflow,
      dfRun
    }

  } catch (error) {
    console.error(error.message)
    return {
      success: false,
      message: error.message
    }
  }


}
