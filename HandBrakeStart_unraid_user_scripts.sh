#!/bin/bash

if [ -d "/mnt/user/Media/Handbrake_hotfolder/watch" ] && [ -n "$(ls -A "/mnt/user/Media/Handbrake_hotfolder/watch")" ]; then
  docker start HandBrake
  logger "HandBrake started by CA user script"
fi
