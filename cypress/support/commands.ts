import '@testing-library/cypress/add-commands';

const addExtensionCommands = require('cypress-browser-extension-plugin/commands');
addExtensionCommands(Cypress);