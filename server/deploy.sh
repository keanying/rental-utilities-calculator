#!/bin/bash

# MongoDB Backend Server Deployment Script

NODE_ENV=production
PORT=3001

echo "Starting MongoDB backend server in production mode..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the server with PM2 (if available) or directly with Node
if command -v pm2 &> /dev/null; then
  echo "Starting server with PM2..."
  pm2 start server.js --name "rent-diary-backend" -- --port $PORT
else
  echo "PM2 not found, starting with Node directly..."
  NODE_ENV=$NODE_ENV PORT=$PORT nohup node server.js > server.log 2>&1 &
  echo "Server started in background. Check server.log for output."
fi

echo "Deployment completed."
