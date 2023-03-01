# Commands to Implement

play
- argument: link to youtube video
- adds its audio track to end of queue

pause/resume
- toggles paused state

clear
- clears queue

disconnect
- disconnects bot

prev
- goes to previous track in queue

next
- goes to next track in queue

playlist
- argument: link to youtube playlist
- optional argument "shuffle", ensures playlist order is randomized
- adds audio tracks from playlist to end of queue

shuffle
- shuffles queue

loop
- loops current audio track

looplist
- loops the queue

would be nice:
- readout for # of songs left in queue and their cumulative duration (in hours/minutes)
- UI elements for pause/play/prev/next in addition to command interface
- volume slider for bot (global, not just for you)
- insert command (like play but adds to middle of queue)
