/**
   * Format a path
   * @param {string} root 
   * @param {string} path 
   */
  function prettyPathFormatter(root, path) {
    const pathSplit = path.split('/');
    const indexOfRoot = pathSplit.indexOf(root);
    let prettyPath = root;
    for (let i = indexOfRoot; i < pathSplit.length; i++) {
      prettyPath += `/${pathSplit[i]}`;
    }

    return prettyPath;
  }

module.exports = prettyPathFormatter;