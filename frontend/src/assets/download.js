const https = require('https');
const fs = require('fs');

const url = "https://lh3.googleusercontent.com/aida/AP1WRLukCKZtlu-wrEtlYzH_Zi6KCxZM601SWi37oWdXDf8YwWChH-YRunVH4gEzB0K1muOck23h59Nu70dT8elP8z9DF2rLVvaFwE8aT80SOFbZ_ojLRy33IMJhekE7zgq0YUTAVNL3dZRG2EOOdTDzZEiHFSfWg38YF0vHWWJgrHLjFuY0XSTP6FFNMcu9davgB4NPEmA_YsULvQa4Wl8t6nkK4JC5rhDS0UbQBUPXgweEeoa430x5iP5WGCk";
const file = fs.createWriteStream("aromi-avatar.svg");

https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => console.log('Download complete.'));
  });
}).on('error', function(err) {
  fs.unlink("aromi-avatar.svg", () => {});
  console.error("Error downloading file: ", err.message);
});
