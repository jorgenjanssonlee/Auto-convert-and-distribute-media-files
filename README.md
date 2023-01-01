# Overview
Automation of checking if movies in a Trakt.tv watchlist are avaiable in the Radarr library.
If so, the files are queued for processing by Handbrake and eventually the converted files are moved to a USB drive.
This is intended to run on UnRaid, where transfer of processed files can be automated on insertion of USB drive using Unassigned Devices plugin.
For install and run instructions of the docker component, see: https://hub.docker.com/r/jorgenjanssonlee/compare-trakt-and-radarr

# Use case diagram
![use case diagram](/diagrams/Auto-convert-and-distribute-use-case-diagram.drawio.svg)

