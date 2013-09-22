
var wrench = require("wrench");

module.exports = function(){
  var directories = fs.readdirSync(SETTINGS.DIR);
  var directoryInfos = [];
  var errors = [];
  _.each(directories, function(dirName){
    var dirPath = SETTINGS.DIR + '/' + dirName;
    var title = /^[^-]*/.exec(dirName)[0].trim();
    var keywords = ~dirName.indexOf('-') ? /[^-]*$/.exec(dirName)[0].trim() : '';
    var stat = fs.statSync(dirPath);
    if(!stat.isDirectory()) return;
    var subFiles = [];
    
    var files = [];
    _.each(wrench.readdirSyncRecursive(dirPath), function(relFilePath){        
      var filePath = dirPath + "/" + relFilePath;
      var stat = fs.statSync(filePath);
      if(stat.isDirectory()) return;
      var fileName = /[^\/]*$/.exec(relFilePath)[0];
      var newPath = filePath.replace(SETTINGS.DIR, SETTINGS.DONEDIR);
      
      if(!/[.](jpg|png|bmp|gif|jpeg|tif|tiff|mov|mp3|mp4|mpv|mpeg|mpg|mpe|wmv|m4a|avi|aif|aiff|m1v|m2v|m4v|rm)$/i.test(relFilePath)){
        if(/[.](DS_STORE)$/i.test(relFilePath)){
          fs.unlinkSync(filePath);
          return;
        }
        errors.push(filePath);
      }
      
      files.push({
        path: filePath,
        name: fileName,
        newPath: newPath,
        newDir: newPath.replace(/[^\/]*$/, '')
      });
    });
    
    directoryInfos.push({
      title: title,
      keywords: keywords,
      name: dirName,
      path: dirPath,
      files: files
    });   
  });
  return {
    dirs: directoryInfos,
    errors: errors
  };
};
