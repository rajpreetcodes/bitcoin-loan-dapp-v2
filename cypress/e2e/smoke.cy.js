describe('Bitcoin Loan dApp Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
    // Spy on console errors
    cy.window().then(win => {
      cy.spy(win.console, 'error').as('consoleError');
    });
  });

  it('should load without CSP violations', () => {
    // Wait for initial page load
    cy.contains('Bitcoin-Backed Loans').should('be.visible');
    
    // Check for CSP errors
    cy.get('@consoleError').then(spy => {
      const cspErrors = spy.getCalls().filter(call => 
        String(call.args[0]).includes('Content Security Policy')
      );
      expect(cspErrors.length).to.equal(0);
    });
  });

  it('should authenticate and load dashboard without API errors', () => {
    // Mock Internet Identity authentication
    cy.window().then(win => {
      // Stub the auth client
      win.authClient = {
        isAuthenticated: () => true,
        getIdentity: () => ({
          getPrincipal: () => ({
            toText: () => 'test-principal'
          })
        })
      };
      
      // Stub the actor
      win.actor = {
        get_loans: () => [],
        get_btc_address: () => [],
        link_btc_address: (address) => Promise.resolve({ Ok: null })
      };
    });
    
    // Login button should be visible
    cy.contains('Login with Internet Identity').click();
    
    // Dashboard should load without errors
    cy.contains('Bitcoin Loan Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('Active Loans').should('be.visible');
    
    // No API errors should be present
    cy.get('@consoleError').then(spy => {
      const apiErrors = spy.getCalls().filter(call => 
        String(call.args[0]).includes('get_loans is not a function') ||
        String(call.args[0]).includes('canister_not_found')
      );
      expect(apiErrors.length).to.equal(0);
    });
  });

  it('should link Bitcoin address successfully', () => {
    // Mock authentication and actor
    cy.window().then(win => {
      win.authClient = {
        isAuthenticated: () => true,
        getIdentity: () => ({
          getPrincipal: () => ({
            toText: () => 'test-principal'
          })
        })
      };
      
      win.actor = {
        get_loans: () => [],
        get_btc_address: () => [],
        link_btc_address: (address) => Promise.resolve({ Ok: null })
      };
    });
    
    // Login
    cy.contains('Login with Internet Identity').click();
    
    // Enter Bitcoin address
    cy.get('input[placeholder*="Bitcoin address"]').type('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    cy.contains('Link Address').click();
    
    // Success message should appear
    cy.contains('Bitcoin address linked successfully', { timeout: 5000 }).should('be.visible');
    
    // No errors should be present
    cy.get('@consoleError').then(spy => {
      const linkErrors = spy.getCalls().filter(call => 
        String(call.args[0]).includes('Failed to link Bitcoin address')
      );
      expect(linkErrors.length).to.equal(0);
    });
  });
}); 