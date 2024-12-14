#!/bin/bash

# Define the target directory (passed as an argument or set a default)
TARGET_DIR=${1:-"./src"}
OUTPUT_FILE="consolidated_output.txt"

# Check if the target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Target directory '$TARGET_DIR' does not exist."
    exit 1
fi

# Clear the output file if it exists
> "$OUTPUT_FILE"

# Add the directory tree structure to the output file
echo "Directory Tree of '$TARGET_DIR':" >> "$OUTPUT_FILE"
echo "----------------------------------" >> "$OUTPUT_FILE"
tree "$TARGET_DIR" >> "$OUTPUT_FILE" || find "$TARGET_DIR" -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g' >> "$OUTPUT_FILE"
echo -e "\n\nContents of Files:" >> "$OUTPUT_FILE"
echo "----------------------------------" >> "$OUTPUT_FILE"

# Traverse through all files in the directory and subdirectories
while IFS= read -r -d '' file; do
    echo -e "\n--- File: $file ---\n" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
done < <(find "$TARGET_DIR" -type f -print0)

echo "Consolidation complete! Check the output file: $OUTPUT_FILE"
