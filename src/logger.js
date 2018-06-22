const log = require('fancy-log');
const chalk = require('chalk');

const colors = {
  info: '#c4c4c4',
  success: '#4bbb8b',
  warning: '#ffb400',
  error: '#e36488',
  title: '#002bdc'
}

function info(title, text) {
  return log(`${chalk.default.hex(colors.title)(title)} - ${chalk.default.hex(colors.info)(text)}`);
}

function success(title, text) {
  return log(`${chalk.default.hex(colors.success)(title)} - ${chalk.default.hex(colors.info)(text)}`);
}

function warning(title, text) {
  return log(`${chalk.default.hex(colors.warning)(title)} - ${chalk.default.hex(colors.info)(text)}`);
}

function error(title, text) {
  return log(`${chalk.default.hex(colors.error)(title)} - ${chalk.default.hex(colors.info)(text)}`);
}

function longText(title, text) {
  log(`
  ${chalk.default.hex(colors.title)(title)}
  ${chalk.default.hex(colors.title)('-'.repeat(title.length))}

  ${chalk.default.hex(colors.info)(text)}
  `);
}

module.exports = {
  info,
  success,
  warning,
  error,
  longText
}