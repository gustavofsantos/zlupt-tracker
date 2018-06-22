/**
   * Format a path
   * @param {string} root 
   * @param {string} path 
   */
  function prettyPathFormatter(root, path) {
    const pathSplit = path.split('/');
    const indexOfRoot = pathSplit.indexOf(root);
    let prettyPath = '';
    for (let i = indexOfRoot; i < pathSplit.length; i++) {
      prettyPath += `/${pathSplit[i]}`;
    }

    return prettyPath.slice(1);
  }

module.exports = prettyPathFormatter;