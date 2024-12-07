// ./components/PriceFeedDisplay/PriceFeedDisplay.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Connection, PublicKey } from '@solana/web3.js';

const PriceFeedDisplay = ({ feedAddress, connection }) => {
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            setLoading(true);
            setError(null);

            try {
                const accountInfo = await connection.getAccountInfo(new PublicKey(feedAddress));
                if (!accountInfo) throw new Error('Account info not found.');

                // Decode the data according to Chainlink's Solana data structure
                const data = accountInfo.data;
                const decodedData = decodeChainlinkData(data);

                setPrice(decodedData.answer);
            } catch (err) {
                console.error('Failed to fetch price:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrice();
    }, [feedAddress, connection]);

    const decodeChainlinkData = (data) => {
        // Chainlink data structure for Solana: 
        // https://docs.chain.link/solana/data-feeds
        const HEADER_SIZE = 40; // The size of the header
        const priceOffset = HEADER_SIZE + 8; // Skip header and round ID

        // Read the price (8 bytes after the header and round ID)
        const priceBuffer = data.slice(priceOffset, priceOffset + 8);
        const price = Number(priceBuffer.readBigInt64LE()) / 1e8;

        return { answer: price };
    };

    if (loading) {
        return <div className="text-gray-500 text-center">Loading price...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col items-center p-4 bg-gray-800 text-white rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-2">SOL/USD Price</h2>
            <p className="text-2xl font-bold">${price.toFixed(2)}</p>
        </div>
    );
};

PriceFeedDisplay.propTypes = {
    feedAddress: PropTypes.string.isRequired,
    connection: PropTypes.instanceOf(Connection).isRequired,
};

export default PriceFeedDisplay;
