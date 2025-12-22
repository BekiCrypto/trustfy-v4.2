import {createContext, useContext, useMemo, useState} from 'react';

const WalletAuthContext = createContext({
  address: null,
  isAuthenticated: false,
  setAddress: () => {}
});

export function WalletAuthProvider({ children }) {
  const [address, setAddress] = useState(null);

  const value = useMemo(
    () => ({
      address,
      isAuthenticated: Boolean(address),
      setAddress
    }),
    [address]
  );

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
}

export const useWalletAuth = () => useContext(WalletAuthContext);

export default WalletAuthProvider;
