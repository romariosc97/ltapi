# ltapi

---

### Todo

* ~~Show list of LTTS_TSDF dataflows~~
* Dataset refresh before timeshift
* Dataset refresh according to lastQueriedDate?
* Catch presence of LastProcessedDate
* Delete Primer dataflow after run
* Auto-schedule ongoing dataflow

### Lowtide-API

```
{

  "all" : "*",
  "auth_required" : "/api/*",

  "auth" : "/api/auth/*",
  "auth_login": "/api/auth/login",
  "auth_sfdc": "/api/auth/sfdc",
  "auth_oauth": "/api/auth/oauth",
  "auth_callback": "/api/auth/callback",
  "auth_session": "/api/auth/session",
  "auth_revoke": "/api/auth/revoke",

  "org" : "/api/org/*",

  "org_folders" : "/api/org/folder",

  "org_datasets" : "/api/org/dataset",
  "org_datasets_folder" : "/api/org/dataset/:folder_id",
  "org_datasets_refresh" : "/api/org/refresh",

  "org_dataflows" : "/api/org/dataflow",
  "org_dataflows_ts": "/api/org/dataflow/timeshift",
  "org_dataflows_folder" : "/api/org/dataflow/:folder_id",
  "org_dataflow_single" : "/api/org/dataflow/single/:dataflow_id",
  "org_dataflows_run" : "/api/org/dataflow/run/:dataflow_id",

  "timeshift_array" : "/api/org/timeshift",

  "org_templates" : "/api/org/template",
  "org_template_single" : "/api/org/template/:template_id",
  "org_template_download" : "/api/org/template/:template_id/download",
  "org_template_upload" : "/api/org/template/upload",

  "repo" : "/api/repository/*",

  "repo_templates" : "/api/repository/template/:branch",
  "repo_template_deploy" : "/api/repository/template/:branch/deploy",
  "repo_template_download" : "/api/repository/template/:branch/download",

  "session_jobs": "/api/jobs/session/all"

}
```
