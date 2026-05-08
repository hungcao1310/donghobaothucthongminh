#!/bin/bash

# Replace all Link components with buttons in pages

cd /workspaces/default/code/src/app/pages

# Find and replace Link to= with button onClick=
for file in *.tsx; do
    if grep -q "Link to=" "$file" 2>/dev/null; then
        echo "Fixing Links in $file..."

        # Replace Link imports
        sed -i '/import.*Link.*from "react-router"/d' "$file"

        # Replace simple Link to button (single line)
        perl -i -pe 's/<Link to="([^"]*)"(.*?)>/<button onClick={() => navigate("$1")}$2>/g' "$file"
        perl -i -pe 's/<\/Link>/<\/button>/g' "$file"

        echo "✓ Fixed $file"
    fi
done

echo "Done!"
