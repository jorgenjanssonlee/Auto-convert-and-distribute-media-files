#!/bin/sh
#
# This is an example of a post watch folder processing hook.  This script is
# always invoked with /bin/sh (shebang ignored).
#
# The argument of the script is the path to the watch folder.
#

WATCH_FOLDER=$1

echo "post-watch folder processing: Watch folder = $WATCH_FOLDER"

if [ -d "/$WATCH_FOLDER" ] && [ -z "$(ls -A "$WATCH_FOLDER")" ]; then
    echo "watch folder empty, shutting down"
    killall -sigterm ghb
fi
