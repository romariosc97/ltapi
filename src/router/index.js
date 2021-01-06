module.exports = (io) => {
  return {
    timeshift: require("./timeshift"),
    jobs: require("./jobs")(io),
    org: require("./org")(io),
    repo: require("./repo")(io)
  }
}
