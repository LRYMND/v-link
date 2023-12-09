#!/bin/bash
echo "RTVI-Packager"

echo "Deleting old dist files..."
rm -rf dist/ frontend/dist/
echo "Done."

echo "Creating ./dist/ directory..."
    mkdir dist/
    mkdir dist/frontend/
    mkdir dist/backend/
echo "Done."

echo "Packaging frontend..."
cd frontend/
npm run build
cd ..
echo "Done."

echo "Copying files..."
cp -r frontend/dist/ dist/frontend/dist
cp -r backend/ dist/

cp Volvo-RTVI.py dist/Volvo-RTVI.py
cp requirements.txt dist/requirements.txt
cp Installer.sh dist/Installer.sh
echo "Done."

echo "Creating Zip..."
cd dist/
zip -r Volvo-RTVI.zip Volvo-RTVI.py requirements.txt frontend/ backend/
echo "Done."

echo "Cleaning up..."
rm -rf Volvo-RTVI.py requirements.txt frontend/ backend/

cd ..

echo "All Done."