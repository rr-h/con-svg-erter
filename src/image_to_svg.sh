#!/bin/bash

# Use Zenity to create a file selection dialog
input_file=$(zenity --file-selection --title="Select an image file" --file-filter="Images | *.jpeg *.jpg *.png *.webp")

# Check if the user selected a file or canceled the dialog
if [ -z "$input_file" ]; then
  zenity --error --text="No file selected."
  exit 1
fi

# Check if the input file exists
if [ ! -f "$input_file" ]; then
  zenity --error --text="File not found!"
  exit 1
fi

# Get the directory and filename without extension
input_dir=$(dirname "$input_file")
filename=$(basename -- "$input_file")
filename="${filename%.*}"

# Output file path
output_file="${input_dir}/${filename}.svg"

# Convert the input image to PGM format using ImageMagick
pgm_file="${input_dir}/${filename}.pgm"
if ! convert "$input_file" "$pgm_file"; then
  zenity --error --text="Failed to convert $input_file to PGM format."
  exit 1
fi

# Convert the PGM file to SVG using Potrace
if ! potrace -s -o "$output_file" "$pgm_file"; then
  zenity --error --text="Failed to convert $pgm_file to SVG format."
  # Ensure the PGM file is deleted even if Potrace fails
  rm "$pgm_file"
  exit 1
fi

# Remove the temporary PGM file
rm "$pgm_file"

# Notify the user of the successful conversion
zenity --info --text="Conversion complete: $output_file"
