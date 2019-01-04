// config.js
// for now, use postman to generate/refresh codes

const config = {
 trakt: {
   traktFriendID: "",
   traktClientID: "",
   traktClientSecret: "",
   traktAccessToken: "",
   traktCreatedAt: ,
   traktAccessTokenExpiresIn: ,
   traktRefreshToken: ""
 },
 radarr: {
   ip: "",
   port: "",
   apikey: ""
 },
 handbrake: {
   hbWatchFolder: "/mnt/user/Media/Handbrake_hotfolder/watch",
   hbVolumeMappingHandbrake: "/storage",
   hbVolumeMappingRadarr: "/media"
 }
};

module.exports = config;
