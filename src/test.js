/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const loadConfig = require('./loadConfig');
const loadLibrary = require('./loadLibrary');
const loadYamlTestCases = require('./loadYamlTestCases');
const loadCodeService = require('./loadCodeService');
const buildTestSuite = require('./buildTestSuite');

function test(configPath) {
  const stat = fs.statSync(configPath);
  const configFiles = stat.isDirectory() ? detectConfigs(configPath) : [configPath];
  for (const configFile of configFiles) {
    console.info('CQLT Config:', configFile);
    const config = loadConfig(configFile);
    const library = loadLibrary(config.get('library.name'), config.get('library.paths'));
    const testCases = loadYamlTestCases(config.get('tests.path'));
    const codeService = loadCodeService(config.get('options.vsac.cache'));
    buildTestSuite(testCases, library, codeService, config.get('options'));
  }
}

function detectConfigs(configPath, configFiles=[]) {
  const stat = fs.statSync(configPath);
  if (stat.isDirectory()) {
    for (const fileName of fs.readdirSync(configPath)) {
      const file = path.join(configPath, fileName);
      detectConfigs(file, configFiles);
    }
  } else if (stat.isFile() && /.*[cC][qQ][lL][tT][^/\\]*\.[yY][aA]?[mM][lL]/.test(configPath)) {
    configFiles.push(configPath);
  }
  return configFiles;
}

module.exports = test;