run:
    DISABLED_ESLINT_PLUGIN=true npm run start

lint:
    npx eslint . --fix

test_adapters:
    npm test -- --watchAll=false