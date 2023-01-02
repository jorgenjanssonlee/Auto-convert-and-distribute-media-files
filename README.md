# Table of contents
1. [Overview](#overview)
2. [Use case diagram](#use-case-diagram)
3. [Compare Trakt and Radarr Docker container](#compare-trakt-and-radarr-docker-container)
4. [Handbrake scripts](#handbrake-scripts)
5. [Copy to/from USB and notify](#copy-tofrom-usb-and-notify)


# Overview
This collection of scripts automates the process of checking a friend's Trakt.tv watchlist, finding any items from the list that are available in your Radarr library, and then queueing the matching files for processing by Handbrake.
If this is installed on UnRaid, the transfer of processed files can be automated on insertion of a USB drive.
Additionally, a small script can start Handbrake on a schedule and shut it down once the processing queue is empty.

# Use case diagram
![use case diagram](diagrams/Auto-convert-and-distribute-use-case-diagram.drawio.svg)

# Compare Trakt and Radarr Docker container

## Prerequisites
- [Trakt.tv](https://trakt.tv) account with Trakt API App: https://trakt.tv/oauth/applications/new
- Trakt ID for an account with a watchlist to monitor (i.e. your friend's Trakt ID)
- [Radarr docker](https://hub.docker.com/r/binhex/arch-radarr/) with Radarr API key: https://wiki.servarr.com/radarr/settings#security
- [Handbrake docker](https://hub.docker.com/r/jlesage/handbrake/) with an automated watch folder 
- [Slack Webhook](https://api.slack.com/messaging/webhooks) (optional)

## Generic Installation
If you're not using UnRaid, see [Docker Hub](https://hub.docker.com/r/jorgenjanssonlee/compare-trakt-and-radarr)

You need to provide the following docker environment variables and volume mappings:
```docker
-v "<host path to app config location>":"/config" \
-v "<host path of watch folder from Handbrake container>":"/watch" \
-e traktFriendID="<friends trakt ID>" \
-e traktClientID="<from Trakt API App>" \
-e radarrIP="<http://radarr.ip.address>" \
-e radarrPort="<7878>" \
-e radarrApiKey="<Radarr API Key>" \
-e hbVolumeMappingHandbrake="<Media storage path from Handbrake container>" \
-e hbVolumeMappingRadarr="<Media storage path from Radarr container>" \
-e slackWebhookUrl="https://hooks.slack.com/services/RANDOMCHARS" \
```

- Please replace all variables defined by <> in the above command with the correct values.
- hbVolumeMappingHandbrake and hbVolumeMappingRadarr are used to construct symlinks that will work for Handbrake (reducing the need to copy the actual files for processing.) They *must* match the config of each docker container. See unraid example below.
- The slackWebHookUrl is optional. If provided, the script will send a notification at the end of processing.


## Installation on UnRaid
This docker has not (yet) been submitted to Community Applications, so the template needs to be created manually.

### Docker template 
to come
### Example config screenshot 
to come

# Handbrake scripts
to come

# Copy to/from USB and notify
This script is intended to be used on ![UnRaid](https://unraid.net/) and requires the excellent [Unassigned Devices plugin](https://forums.unraid.net/topic/92462-unassigned-devices-managing-disk-drives-and-remote-shares-outside-of-the-unraid-array/)
The use case is for sharing files with a friend, using a single USB drive.
The script will trigger on insertion of the USB drive to the UnRaid Server, then:
1. Move files from the drive to a folder on the server
2. Move files from a folder on the server (e.g. the Handbrake output folder) to the USB drive
3. Send a notification on completion and eject the USB drive

## Flow diagram
![Copy to/from USB and notify Flow diagram](diagrams/Copy-to-from-USB-and-notify%20flowchart.drawio.svg)

## Installation
to come