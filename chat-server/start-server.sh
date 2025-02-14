#!/bin/bash

# Change to the chat server directory
cd /home/user/orbyt/chat-server

# Set NODE_ENV to production
export NODE_ENV=production

# Start the Node.js server
# Redirect output to a log file
exec node index.js >> /var/log/chat-server.log 2>&1
