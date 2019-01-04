const config = require('./config');
//   config.handbrake.hbWatchFolder
//   config.handbrake.hbVolumeMappingHandbrake
//   config.handbrake.hbVolumeMappingRadarr

var fs = require('fs');

var movieMatches = [
  { imdbId: 'tt1034385',
    folderPath: '/media/English/Cold Skin (2017)',
    fileName:
     'Cold.Skin.2017.720p.BluRay.DD5.1.x264.1-SpaceHD-Obfuscated.mkv' },
  { imdbId: 'tt0113497',
    folderPath: '/media/English/Jumanji (1995)',
    fileName:
     'Jumanji.1995.1080p.BluRay.Plus.Comm.DD.5.1.x264-MaG-Obfuscated.mkv' }
   ];

createSymlinkForHandbrake(movieMatches);
// create symlink in Handbrake watch folder with volume mapping substitution
function createSymlinkForHandbrake(movies){
  for (var i = 0; i < movies.length; i++) {
    var destFile = config.handbrake.hbWatchFolder + "/" + movies[i].fileName;
    var remappedSourceFile = movies[i].folderPath.replace(config.handbrake.hbVolumeMappingRadarr, config.handbrake.hbVolumeMappingHandbrake) + "/" + movies[i].fileName;
    fs.symlinkSync(remappedSourceFile, destFile);
    console.log("symlink created: " + destFile);
  };
}
