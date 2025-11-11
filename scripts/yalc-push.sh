#!/bin/bash

# Exit on any error
set -e

# Run build in the root directory
npm run build

# Navigate to packages/core and push with yalc
cd ./packages/core
yalc publish
yalc push

# Navigate to packages/common and push with yalc
cd ../common
yalc publish
yalc push

# Navigate to packages/cli and push with yalc
cd ../cli
yalc publish
yalc push

cd ../../plugins/static
yalc publish
yalc push

cd ../ejs
yalc publish
yalc push

cd ../nunjucks
yalc publish
yalc push

cd ../websocket
yalc publish
yalc push

cd ../session
yalc publish
yalc push

cd ../edge
yalc publish
yalc push

cd ../jwt
yalc publish
yalc push

cd ../react
yalc publish
yalc push

cd ../tailwindcss
yalc publish
yalc push

# Return to the root directory
cd ../..

echo "Build and push completed successfully!"