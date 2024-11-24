// Card.js
import React, { useEffect, useState } from "react";

const Card = ({ connector, hooks, name }) => {
  const { useSelectedAccount, useSelectedChainId, useSelectedIsActive, useSelectedIsActivating } =
    hooks;

  const isActivating = useSelectedIsActivating(connector);
  const isActive = useSelectedIsActive(connector);
  const account = useSelectedAccount(connector);
  const chainId = useSelectedChainId(connector);

  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [error, setError] = useState(null);

  const handleToggleConnect = async () => {
    setError(null);

    if (isActive) {
      if (connector.deactivate) {
        await connector.deactivate();
      } else {
        connector.resetState();
      }
    } else {
      setConnectionStatus("Connecting...");
      connector
        .activate()
        .then(() => setConnectionStatus("Connected"))
        .catch((err) => {
          setError(err);
          setConnectionStatus("Error");
          connector.resetState();
        });
    }
  };

  useEffect(() => {
    setConnectionStatus(isActive ? "Connected" : "Disconnected");
  }, [isActive]);

  return (
    <div className="card">
      <h2>{name.toUpperCase()}</h2>
      <p>Status: {error ? `Error: ${error.message}` : connectionStatus}</p>
      <p>Account: {account || "No account detected"}</p>
      <p>Chain ID: {chainId || "No chain connected"}</p>
      <button onClick={handleToggleConnect}>
        {isActive ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
};

export default Card;
