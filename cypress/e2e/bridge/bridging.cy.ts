import 'cypress-react-selector';

describe('Bridge Page', () => {
  it('Loads without errors', () => {
    cy.visit('/bridge');
    cy.contains('BRIDGE IN'); // Ensure "BRIDGE IN" tab is present
    cy.contains('BRIDGE OUT'); 
    // Add more assertions as needed
  });

  it('Switches between "BRIDGE IN" and "BRIDGE OUT" tabs', () => {
    cy.visit('/bridge');

    cy.contains('BRIDGE OUT').click();
    cy.contains('BRIDGE OUT').should('exist'); // "BRIDGE OUT" content should exist
    
    cy.contains('BRIDGE IN').click();
    cy.contains('BRIDGE IN').should('exist'); // "BRIDGE IN" content should exist
  });
  // it("Injects token balances", () => {
  //   cy.window().then((win) => {
  //     // Replace these values with your desired balances
  //     const tokenBalance = "100.0"; // Token balance
  //     const maxAmount = "50.0"; // Amount for bridging

  //     // Inject token balances into the component's state
  //     //win.amount = maxAmount;
  //     win.props.hook.selections.token = {
  //       balance: tokenBalance,
  //       decimals: 18, // Token decimals
  //       // Other token properties as needed
  //     };
  //   });
  // });
  it('Connecting Metamask Wallet',() => {
    cy.visit('/bridge');

    cy.wait(3000);

    cy.get(".navbar_wallet-connect__Jl1C_").click();
    cy.contains('MetaMask').click();

    cy.wait(10000);
    //cy.get("body > div:nth-child(15) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1)").click();
    //cy.get("body > div:nth-child(13) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(3)")
    //cy.get("body > div:nth-child(15) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1)").click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div > p').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(4)').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > .selector_item__rcI8m').click();
    //cy.get('input').clear('0');
    //cy.get('input').type('0.2');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.bridge_confirmation-container__6On8U > .button_container__LQgz1').click();

  });

  // it('Selecting Tokens', () => {
  //   cy.visit('/bridge'); // Replace with the actual URL/path

  //   // Click on "BRIDGE IN" tab
  //   cy.contains('BRIDGE IN').click();

  //   // Example: cy.get('.your-selector').type('Your input text');
  //   //cy.get('')

  //   // Click the "BRIDGE IN" button
  //   cy.contains('BRIDGE IN').click();


  //   // Add more assertions as needed
  // });

  it('Select Networks and Tokens Bridging-In', function() {
    cy.visit('http://localhost:3000/bridge');
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('.selector_grp-items__SezJ8 > :nth-child(7)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('.selector_grp-items__SezJ8 > :nth-child(6)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_scroll-view__HVJoi').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(1)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > [alt="icon"]').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(3)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(5)').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('#tab\\:r0\\:1 > p').click();
    cy.get('#tab\\:r0\\:0 > p').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
  });


  /* ==== Test Created with Cypress Studio ==== */
  it('Bridging In with Fantom testnet', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000/bridge');
    cy.get('[data-testid="rk-connect-button"]').click();
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(3)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    ///cy.get('input').clear('0');
    cy.get('input').type('0.2');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.bridge_confirmation-container__6On8U > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div > p').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(4)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('#tab\\:r0\\:1 > p').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.modal_close__2V9b5 > img').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Bridging Out from Canto testnet to Fantom', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000/bridge');
    cy.get('[data-testid="rk-connect-button"]').click();
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    cy.get('#tab\\:r0\\:1 > p').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div > p').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
   //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.bridge_confirmation-container__6On8U > .button_container__LQgz1').click();
    cy.get(':nth-child(6) > [style="width: 100%; display: flex; flex-direction: column; justify-content: unset; align-items: unset;"] > [style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: unset;"] > p').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('.navbar_activity__fBmcX > .button_container__LQgz1 > img').click();
    cy.get('.modal_close__2V9b5 > img').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('new test', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000/bridge');
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[data-testid="rk-connect-button"]').click();
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    cy.get('#tab\\:r1\\:1 > p').click();
    cy.get('#tab\\:r1\\:0').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.bridge_confirmation-container__6On8U > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Test_x', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('localhost:3000/bridge');
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('.selector_grp-items__SezJ8 > :nth-child(3)').click();
    cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    /* ==== End Cypress Studio ==== */
  });
});
  