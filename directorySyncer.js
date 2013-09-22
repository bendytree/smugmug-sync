
var qs = require('querystring');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

var getAlbums = function(callback){
  var url = SETTINGS.BASEURL + "?method=smugmug.albums.get";
  request.get({url:url, oauth:SETTINGS.OAUTH, json:true}, function (e, r, result) {
    callback(null, result.Albums);
  });
};

var getOrCreateAlbumId = function(dir, callback){
  getAlbums(function(err, albums){
    var album = _.find(albums, function(a){ return a.Title == dir.title; });
    if(!album){
      console.log("no album, so creating: "+dir.title);
      var data = {
        method: 'smugmug.albums.create',
        Title: dir.title,
        Keywords: dir.keywords,
        CategoryID: 54411170 //family -> 54411170 //root => 140363724
      };
      var url = SETTINGS.BASEURL;
      request.post({url:url, oauth:SETTINGS.OAUTH, json:true, form:data }, function (e, r, result) {
        album = r.body.Album;
        
        if(!album.id){
          console.log(result);
          process.exit(1);
        }
        
        console.log("album created");
        callback(null, album);
      });
    }else{
      //console.log("album found");
      callback(null, album);
    }
  });
};

var getImages = function(album, callback){
  var url = SETTINGS.BASEURL + "?method=smugmug.images.get&Heavy=true&AlbumID="+album.id+"&AlbumKey="+album.Key;
  console.log(url);
  request.get({url:url, oauth:SETTINGS.OAUTH, json:true}, function (e, r, result) {
    callback(null, result.Album.Images);
  });
};

module.exports = function(dir, dirDone){
  getOrCreateAlbumId(dir, function(err, album){
    //console.log("getting images");
    getImages(album, function(err, images){

      //look for files
      var missingFiles = _.filter(dir.files, function(file){
        return !_.some(images, function(image){
          return image.FileName == file.name;
        });
      });
      console.log(dir.title + ": " +missingFiles.length+' of '+dir.files.length + " missing");
      console.log();
      if(missingFiles.length){
        console.log("NOT UPLOADED: "+_.map(missingFiles, function(file){
          return file.name;
        }).join(', '));
      }
      dir.files.sort(function(a,b){
        return a.name.localeCompare(a.name);
      });
      // images.sort(function(a,b){
      //   return a.FileName.localeCompare(a.FileName);
      // });
      // console.log("LOCAL HAS "+dir.files.length+": "+_.map(dir.files, function(file){
      //   return file.name;
      // }).join(', '));
      // console.log("SMUGMUG HAS "+images.length+": "+_.map(images, function(image){
      //   return image.FileName;
      // }).join(', '));
      
      if(SETTINGS.PREVIEW){
        dirDone();
        return;
      }
      
      var uploaders = _.map(missingFiles, function(file){
        return function(callback){
          var md5sum = crypto.createHash('md5');
          var s = fs.ReadStream(file.path);
          s.on('data', function(d){ md5sum.update(d); });
          s.on('end', function(){ 
            var md5 = md5sum.digest('hex');
            var headers = { 
              "Content-Length": fs.statSync(file.path).size,
              "Content-MD5": md5,
              "X-Smug-AlbumID": album.id,
              "X-Smug-FileName": file.name,
              "X-Smug-ResponseType": "JSON"
            };
            console.log(" >> "+file.name);
            fs.createReadStream(file.path).pipe(
              request.post(
                'http://upload.smugmug.com/', 
                { headers: headers,
                  oauth:   SETTINGS.OAUTH,
                  json:    true },
                function(error, response, body){
                  callback();
                }
              )
            );
          });
        };
      });
      
      async.parallelLimit(uploaders, 2, function(err, results){
        dirDone();
      });
      
    });
  });
};
