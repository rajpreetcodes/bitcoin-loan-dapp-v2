// This file overrides Plug wallet's default behavior to use our correct host
// It needs to be imported before any Plug wallet interactions

// Function to check if Plug wallet is properly initialized
const isPlugWalletInitialized = () => {
  return typeof window !== 'undefined' && 
         window.ic && 
         window.ic.plug && 
         typeof window.ic.plug.requestConnect === 'function';
};

// Function to wait for Plug wallet to be available
const waitForPlugWallet = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (isPlugWalletInitialized()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isPlugWalletInitialized()) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Plug wallet initialization timeout'));
      }
    }, 100);
  });
};

// Function to override Plug wallet's default fetch behavior
export const overridePlugWallet = async () => {
  try {
    // Wait for Plug wallet to be available
    await waitForPlugWallet();

    console.log('Overriding Plug wallet default settings');
    
    // Override the host
    if (!window.ic.plug._host) {
      window.ic.plug._host = 'http://localhost:4943';
    }
    
    // Override the agent creation if needed
    const originalCreateAgent = window.ic.plug.createAgent;
    window.ic.plug.createAgent = async (options = {}) => {
      try {
        const newOptions = {
          ...options,
          host: 'http://localhost:4943'
        };
        return await originalCreateAgent(newOptions);
      } catch (error) {
        console.error('Failed to create Plug agent:', error);
        throw new Error('Failed to initialize Plug wallet agent. Please make sure Plug is properly installed and try again.');
      }
    };
    
    // Override the requestConnect method
    const originalRequestConnect = window.ic.plug.requestConnect;
    window.ic.plug.requestConnect = async (options = {}) => {
      try {
        const newOptions = {
          ...options,
          host: 'http://localhost:4943'
        };
        return await originalRequestConnect(newOptions);
      } catch (error) {
        console.error('Failed to connect to Plug:', error);
        throw new Error('Failed to connect to Plug wallet. Please make sure Plug is properly installed and try again.');
      }
    };

    return true;
  } catch (error) {
    console.error('Failed to override Plug wallet:', error);
    throw error;
  }
}; 