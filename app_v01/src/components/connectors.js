// connectors.js
import { initializeConnector } from "@web3-react/core";
import { Phantom } from "web3-react-phantom";

// Initialize the Phantom connector
const [phantom, phantomHooks] = initializeConnector((actions) => new Phantom({ actions }));

// Export the connectors and hooks
const connectors = [[phantom, phantomHooks]];

export default connectors;
