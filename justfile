run:
    DISABLED_ESLINT_PLUGIN=true npm run start

lint:
    npx eslint . --fix

test_adapter:
    npm test -- --watchAll=false --testPathPattern=src/adapters/DSAdapter.test.js