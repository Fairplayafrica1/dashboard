// const cron = require('node-cron');
// const { scanAllMovies } = require('../services/scanService');

// const startScheduler = () => {
//   console.log('Scan scheduler started');

//   // runs every 6 hours
//   cron.schedule('0 */6 * * *', async () => {
//     console.log('Auto-scan started:', new Date().toISOString());
//     try {
//       await scanAllMovies();
//       console.log('Auto-scan complete');
//     } catch (error) {
//       console.error('Auto-scan failed:', error.message);
//     }
//   });
// };

// module.exports = { startScheduler };
const cron = require('node-cron');
const { scanAllMovies } = require('../services/scanService');

const startScheduler = (app) => {
  console.log('Scan scheduler started');
  cron.schedule('0 */6 * * *', async () => {
    console.log('Auto-scan started:', new Date().toISOString());
    try {
      await scanAllMovies(app);
      console.log('Auto-scan complete');
    } catch (error) {
      console.error('Auto-scan failed:', error.message);
    }
  });
};

module.exports = { startScheduler };