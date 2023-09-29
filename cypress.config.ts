import { defineConfig } from 'cypress';
//import cypressMetamask from '@positionex/cypress-metamask-v3/cypress/plugins';

import { config } from 'dotenv';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    experimentalStudio: true
  },
  video: true
})

