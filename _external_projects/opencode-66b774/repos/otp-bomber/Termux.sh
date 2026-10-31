#!/bin/bash

echo "Updating system..."
pkg update

echo "Installing PHP..."
pkg install -y php

echo "Installing PHP cURL extension..."
pkg install -y php-curl

echo "Installing Apache2..."
pkg install -y apache2

file_path=$(pwd)

cd "$file_path"
echo "Navigating to $file_path..."

echo "Starting PHP server at localhost:8000..."
php -S localhost:8000 &

sleep 5

read -p "Enter an Indian phone number (10 digits): " phone_number

if [[ ! "$phone_number" =~ ^[0-9]{10}$ ]]; then
  echo "Invalid phone number. Please enter a 10-digit number."
  exit 1
fi

read -p "Enter the interval between requests (in seconds): " interval

if [[ ! "$interval" =~ ^[0-9]+$ ]] || [ "$interval" -le 0 ]; then
  echo "Invalid interval. Please enter a positive number."
  exit 1
fi

while true; do
  # Make the HTTP request using curl
  curl -s "http://localhost:8000/bomb.php?number=$phone_number" > /dev/null
  echo "Request sent. Waiting for $interval seconds before the next request..."
  sleep "$interval"
done
