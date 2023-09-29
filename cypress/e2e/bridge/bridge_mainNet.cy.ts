describe('Bridge Page', () => {
  it('record tests', () => {
    cy.visit('/bridge');
  });


  it('bridge_2.cy.ts', function() {
    cy.visit('http://localhost:3000/bridge');
    cy.get('[data-testid="rk-connect-button"]').click();
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.modal_overlay__Tyt8c').click();
    cy.get('#tab\\:r0\\:1 > p').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.bridge_confirmation-container__6On8U > .button_container__LQgz1').click();
    cy.get('.modal_close__2V9b5 > img').click();

  });

   it('Selection of Tokens Gravity Bridge', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000/bridge');
    cy.get('[data-testid="rk-connect-button"]').click();
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: column; gap: 14px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('.selector_grp-items__SezJ8 > :nth-child(7)').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(1)').click();
    //cy.get('input').clear('1');
    cy.get('input').type('1');
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(2)').click();
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(3)').click();
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(4)').click();
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
    cy.get('[style="width: 100%; display: flex; flex-direction: row; gap: 20px; justify-content: unset; align-items: unset;"] > .button_container__LQgz1 > div > p').click();
    cy.get('.selector_items-list__kmTvh > :nth-child(5)').click();
    cy.get('[style="height: 46px; cursor: pointer; width: 100%; background-color: var(--text-dark-color); padding: 20px; color: var(--text-light-color); font-family: var(--rm-mono); gap: 12px; font-weight: normal; flex-direction: row;"]').click();
    cy.get('.modal_close__2V9b5 > img').click();
  });


  it('Selecting Networks', () => {
    cy.visit('/bridge'); // Replace with the actual URL/path
    
    // Click on "BRIDGE IN" tab
    cy.contains('BRIDGE IN').click();

    cy.wait(2000);
    //$("button[type='button']")
    //cy.get("button[type='button']").click();

    //cy.get("body > div:nth-child(15) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1)").click();

    // cy.react('Bridging', { props: { hook: { selections: {token : {balance : 'balance'} } } } }).type(
    //   '1000'
    // );

    cy.get(".navbar_wallet-connect__Jl1C_").click();
    cy.contains('MetaMask').click();

    cy.wait(3000);

    // Example: cy.get('.your-selector').type('Your input text');
    //cy.get('')
    //cy.get("body div div[class='body'] div div div[class='react-tabs'] div[id='panel:r0:0'] section[class='bridge_container__rp1sN'] div[class='bridge_network-selection__Po_dh'] div button:nth-child(1)").click();
    //cy.get('.button_container__LQgz1').click();
    cy.get("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > section:nth-child(1) > div:nth-child(1) > div:nth-child(1) > button:nth-child(2) > div:nth-child(1)").click();

    cy.get("body div div[class='body'] div[id='modal-root'] div[class='modal_overlay__Tyt8c'] div[class='modal_wrapper__Rgio6'] div[class='modal_modal__fTdJs'] div[class='modal_body__q_EO3'] div[class='selector_scroll-view__HVJoi'] div[class='selector_items-list__kmTvh'] div:nth-child(1)").click();

    //Open Token Dropdown
    cy.get("div[class='bridge_network-selection__Po_dh'] div div button[class='button_container__LQgz1']").click();

    //Select Token 
    cy.get("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)").click();
        //Add the amount of tokens to be bridged
    cy.get("input[placeholder='0.0']").type("1.5");

    cy.get("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > section:nth-child(1) > button:nth-child(4)").click();
        //cy.contains('BRIDGE IN').click();
    cy.contains('Confirmation').end();

    //cy
    // Click the "BRIDGE IN" button
    

    //USDT
    //$("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1)")
    //USDC
    //$("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)")

    //WETH
    //$("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(3)")
  });



});