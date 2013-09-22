
GLOBAL.SETTINGS = require('./settings');

GLOBAL.request = require('request');
GLOBAL.fs = require('fs');
GLOBAL._ = require('lodash');
GLOBAL.async = require('async');
GLOBAL.MD5 = require('MD5');


// var url = SETTINGS.BASEURL + "?method=smugmug.categories.get";
// request.get({url:url, oauth:SETTINGS.OAUTH, json:true}, function (e, r, result) {
//   console.log(result.Categories);
// });


console.log("\nSearching:\t..."+SETTINGS.DIR.substring(SETTINGS.DIR.length-20));
var results = require('./getDirectories')();
console.log("Found: \t\t"+results.dirs.length+" folders, "+_.reduce(results.dirs, function(sum, dir){ return sum + dir.files.length; }, 0)+" photos");
console.log('');

if(results.errors.length){
  console.log(results.errors.length + ' UNKNOWN FILE TYPE!');
  _.each(results.errors, function(error){
    console.log(error);
    console.log();
  });
  process.exit(1);
}else{
  console.log("ALL FILES VALID :)\n")
  //process.exit(0);
}

//results.dirs = [results.dirs[results.dirs.length-1]];

var directorySyncers = _.map(results.dirs, function(dir){
  return function(callback){
    require('./directorySyncer')(dir, function(){
      callback();
    });
  };
});

async.series(directorySyncers, function(){
  console.log('\nDone.\n');
});
