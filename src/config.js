const fs = require('fs');
const logger = require('./logger');

const config = {}

function setConfig(cfg) {
  config = cfg;
  return config;
}

function getConfig() {
  return config;
}

function loadConfig(path) {
  const configFile = fs.readFileSync(`${path}/.config.json`, { encoding: 'utf-8' });
  config = JSON.parse(configFile);
  return config;
}

function createConfig(path, config) {
  logger.info('create config', `${path}/.config.json`);
  fs.writeFileSync(`${path}/.config.json`, JSON.stringify(config), { encoding: 'utf-8' });
}

module.exports = { loadConfig, createConfig, setConfig, getConfig }