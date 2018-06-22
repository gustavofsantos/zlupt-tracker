/**
 * Create a package to send over feed
 * @param {string} type 
 * @param {object} data 
 * @param {string} signature 
 */
function package(type, data, signature) {
  const p = {};
  if (type == 'request') {
    p = {
      query: 'request',
      operation: data.operation,
      timestamp: Date.now(),
      signature
    }
  }
  else if (type == 'response') {
    p = {
      query: 'response',
      result: data.result,
      timestamp: Date.now(),
      signature
    }
  }
  else if (type == 'data') {
    p = {
      operation: data.operation,
      path: data.path,
      timestamp: Date.now(),
      signature
    }
  }
  return p;
}

module.exports = package;