// var cronJob =  require('cron').CronJob;

// var job1 = new cronJob('* * * * * *',function(){
//     console.log('每秒执行一次');
// }) 
// job1.start();

// var job2 = new cronJob('*/5 * * * * *',function(){
//     console.log('每5秒执行一次');
// }) 
// job2.start();
var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');