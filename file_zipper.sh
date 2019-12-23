PUBLISHED_FILE=publish.zip

if [ -f "$PUBLISHED_FILE" ]; then
    echo "Deleting $PUBLISHED_FILE..."
    rm -f $PUBLISHED_FILE
fi

zip -r9 $PUBLISHED_FILE background.js content.js dependencies icons LICENSE.txt manifest.json META-INF options popup node_modules/

echo "Successfully zipped to '$PUBLISHED_FILE'"
