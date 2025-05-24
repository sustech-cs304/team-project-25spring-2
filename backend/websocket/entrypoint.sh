#!/bin/bash

# Start the first process
node server.js &

# Start the second process
node term.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?