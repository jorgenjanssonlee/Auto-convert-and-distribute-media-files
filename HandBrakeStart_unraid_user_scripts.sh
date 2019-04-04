#!/bin/bash

# Set the path to the Handbrake watch folder as seen from the Unraid command line
WATCH="/mnt/user/Media/Handbrake_hotfolder/watch"

if [ -d "$WATCH" ] && [ -n "$(ls -A "/$WATCH")" ]; then
  docker start HandBrake
  logger "HandBrake started by User Scripts"
fi
