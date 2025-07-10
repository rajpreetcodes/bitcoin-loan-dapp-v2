// This file overrides Plug wallet's default behavior to use our correct host
// It needs to be imported before any Plug wallet interactions

// Function to override Plug wallet's default fetch behavior
export const overridePlugWallet = () => {
  if (typeof window !== 'undefined' && window.ic && window.ic.plug) {
    console.log('Overriding Plug wallet default settings');
    
    // Override the host
    if (!window.ic.plug._host) {
      window.ic.plug._host = 'http://localhost:4943';
    }
    
    // Override the agent creation if needed
    const originalCreateAgent = window.ic.plug.createAgent;
    window.ic.plug.createAgent = async (options = {}) => {
      const newOptions = {
        ...options,
        host: 'http://localhost:4943'
      };
      return originalCreateAgent(newOptions);
    };
    
    // Override the requestConnect method
    const originalRequestConnect = window.ic.plug.requestConnect;
    window.ic.plug.requestConnect = async (options = {}) => {
      const newOptions = {
        ...options,
        host: 'http://localhost:4943'
      };
      return originalRequestConnect(newOptions);
    };
  }
}; 