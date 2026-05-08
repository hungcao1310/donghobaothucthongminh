#!/bin/bash

# Script to replace react-router with SimpleRouter in all pages

for file in /workspaces/default/code/src/app/pages/*.tsx; do
    if grep -q "from \"react-router\"" "$file" 2>/dev/null; then
        echo "Processing $(basename $file)..."

        # Replace imports
        sed -i 's/import { useNavigate, useParams } from "react-router"/import { useNavigation, useParams } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { Link, useNavigate, useParams } from "react-router"/import { useNavigation, useParams } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { useNavigate, useParams } from "react-router"/import { useNavigation, useParams } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { Link, useNavigate } from "react-router"/import { useNavigation } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { useNavigate } from "react-router"/import { useNavigation } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { Link } from "react-router"/import { useNavigation } from "..\/components\/SimpleRouter"/g' "$file"
        sed -i 's/import { useParams } from "react-router"/import { useParams } from "..\/components\/SimpleRouter"/g' "$file"

        # Replace useNavigate
        sed -i 's/const navigate = useNavigate()/const { navigate, goBack } = useNavigation()/g' "$file"

        # Replace navigate(-1) with goBack()
        sed -i 's/navigate(-1)/goBack()/g' "$file"

        echo "✓ Fixed $(basename $file)"
    fi
done

echo "Done!"
