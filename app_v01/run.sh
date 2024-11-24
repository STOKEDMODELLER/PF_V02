#!/bin/sh

# Output file
output_file="compiled_js_css.txt"

# Create or clear the output file
> "$output_file"

# Function to compile JS and CSS files
compile_js_css_files() {
    dir="$1"

    # Check if the directory is "node_modules", and skip it
    if [ "$(basename "$dir")" = "node_modules" ]; then
        return
    fi

    # Process JS and CSS files in the current directory
    for file in "$dir"/*.js "$dir"/*.css; do
        if [ -f "$file" ]; then  # Check if the file exists
            echo "Processing: $file"
            
            # Write the directory and file name to the output file
            echo "---- Directory: $(dirname "$file") ----" >> "$output_file"
            echo "---- File: $(basename "$file") ----" >> "$output_file"
            
            # Append the file content to the output file
            cat "$file" >> "$output_file"
            
            # Add a separator
            echo "\n\n" >> "$output_file"
        fi
    done

    # Recursively process subdirectories
    for subdir in "$dir"/*/; do
        if [ -d "$subdir" ]; then
            compile_js_css_files "$subdir"
        fi
    done
}

# Start compiling from the current directory
compile_js_css_files "$(pwd)"

echo "All JavaScript and CSS files have been compiled into $output_file."
