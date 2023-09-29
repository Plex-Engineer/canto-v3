describe('Test User Login', () => {

    it('Connects with Metamask', () => {
    cy.addMetamaskNetwork({
        networkName: 'Canto Test network',
        rpcUrl: 'https://canto-testnet.plexnode.wtf',
        chainId: 7701,
        symbol: 'CANTO',
        blockExplorer: 'https://testnet.tuber.build',
        isTestnet: true,
        });
	cy.visit('http://localhost:3000')
        // find "Connect Wallet" button and click it
        cy.contains('Connect Wallet').click();
        // assuming there is only metamask popping up 
	// always important to switch between metamask and cypress window
    

    });
});