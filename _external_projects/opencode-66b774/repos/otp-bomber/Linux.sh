#!/bin/bash

# Update the package list
echo "Updating system..."
sudo apt update

# Install PHP if not already installed
echo "Installing PHP..."
sudo apt install -y php

# Install cURL extension for PHP
echo "Installing PHP cURL extension..."
sudo apt install -y php-curl

# Install Apache2 if not already installed
echo "Installing Apache2..."
sudo apt install -y apache2

# Get the current directory where the script is located
file_path=$(pwd)

# Navigate to the current directory
cd "$file_path"
echo "Navigating to $file_path..."

# Start the PHP built-in server
echo "Starting PHP server at localhost:8000..."
php -S localhost:8000 &

# Wait for the server to start
sleep 5

# Prompt for an Indian phone number
read -p "Enter an Indian phone number (10 digits): " phone_number

# Basic validation for Indian phone number (10 digits)
if [[ ! "$phone_number" =~ ^[0-9]{10}$ ]]; then
  echo "Invalid phone number. Please enter a 10-digit number."
  exit 1
fi

# Prompt for the request interval (in seconds)
read -p "Enter the interval between requests (in seconds): " interval

# Validate the interval (should be a positive number)
if [[ ! "$interval" =~ ^[0-9]+$ ]] || [ "$interval" -le 0 ]; then
  echo "Invalid interval. Please enter a positive number."
  exit 1
fi

# Loop to make requests at specified intervals
while true; do
  # Make the HTTP request using curl
  curl -s "http://localhost:8000/bomb.php?number=$phone_number" > /dev/null
  echo "Request sent. Waiting for $interval seconds before the next request..."
  sleep "$interval"
done
