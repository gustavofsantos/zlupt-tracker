const App = require('../src/app');

const app = new App();
app.init('/home/gustavo/Workspace/zlupt-tracker/sync-data', () => {
  console.log('ready')
  app.start();
});

