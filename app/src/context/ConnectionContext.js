import React, { createContext, useContext, useState, useEffect } from "react";
import { Connection } from "@solana/web3.js";

export const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const conn = new Connection(process.env.REACT_APP_MAIN_RPC); // Correct RPC endpoint
    setConnection(conn);
  }, []);

  return (
    <ConnectionContext.Provider value={{ connection }}>
      {children}
    </ConnectionContext.Provider>
  );
};
