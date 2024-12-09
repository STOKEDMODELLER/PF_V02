import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { PublicKey } from "@solana/web3.js";
import LiquidityCard from "../LiquidityCard/LiquidityCard";
import idl from "../../utils/idl/solana_amm.json";

const LiquidityInfo = ({ connection, selectedTokens, onCreateLiquidity }) => {
    const [liquidityData, setLiquidityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [poolsFetched, setPoolsFetched] = useState(false); // Flag to prevent unnecessary re-renders

    // Function to decode pool data from the raw byte data
    const decodePoolData = useCallback((dataBuffer) => {
        const dataSize = 32 + 32 + 8 + 8 + 32 + 8 + 2 + 2 + 8 + 8 + 8 + 8 + 1 + 1 + 32 + 128;
        try {
            return {
                tokenA: new PublicKey(dataBuffer.slice(0, 32)).toBase58(),
                tokenB: new PublicKey(dataBuffer.slice(32, 64)).toBase58(),
                reserveA: Number(dataBuffer.readBigUInt64LE(64)),
                reserveB: Number(dataBuffer.readBigUInt64LE(72)),
                lpMint: new PublicKey(dataBuffer.slice(80, 112)).toBase58(),
                totalLpTokens: Number(dataBuffer.readBigUInt64LE(112)),
                feePercentage: dataBuffer.readUInt16LE(120),
                adminFeePercentage: dataBuffer.readUInt16LE(122),
                feesCollectedA: Number(dataBuffer.readBigUInt64LE(124)),
                feesCollectedB: Number(dataBuffer.readBigUInt64LE(132)),
                creationTimestamp: Number(dataBuffer.readBigInt64LE(140)),
                lastUpdatedTimestamp: Number(dataBuffer.readBigInt64LE(148)),
                isVerified: Boolean(dataBuffer.readUInt8(156)),
                isPaused: Boolean(dataBuffer.readUInt8(157)),
                poolName: Buffer.from(dataBuffer.slice(158, 190)).toString("utf8").replace(/\0/g, ""),
                poolDescription: Buffer.from(dataBuffer.slice(190)).toString("utf8").replace(/\0/g, ""),
            };
        } catch (error) {
            console.error("Error decoding pool data:", error);
            return null;
        }
    }, []);

    // Function to fetch liquidity data
    const fetchLiquidityData = useCallback(async () => {
        if (!selectedTokens?.fromToken || !selectedTokens?.toToken) {
            setError("Please select both tokens to search for liquidity pools.");
            setLiquidityData(null);
            return;
        }

        setLoading(true);
        setError(null);

        const programId = new PublicKey(idl.metadata.address);

        try {
            const programAccounts = await connection.getProgramAccounts(programId);
            if (!programAccounts || programAccounts.length === 0) {
                setError("No liquidity pools found. Ready to create your own?");
                setLiquidityData(null);
                return;
            }

            const filteredProgramAccounts = await connection.getProgramAccounts(programId, {
                filters: [{ dataSize: 256 }], // Assuming a constant dataSize for filtering
            });

            if (!filteredProgramAccounts || filteredProgramAccounts.length === 0) {
                setError("No liquidity pools found with the selected token pair. Create one?");
                setLiquidityData(null);
                return;
            }

            const decodedPools = filteredProgramAccounts
                .map(account => decodePoolData(account.account.data))
                .filter(pool => pool);

            const matchingPools = decodedPools.filter(
                pool => pool.tokenA === selectedTokens.fromToken && pool.tokenB === selectedTokens.toToken
            );

            if (matchingPools.length === 0) {
                setError("No matching pool found. Would you like to create one?");
                setLiquidityData(null);
            } else {
                setLiquidityData(matchingPools[0]);
                setError(null);
            }

            setPoolsFetched(true); // Mark that pools have been fetched
        } catch (error) {
            setError("Error fetching liquidity pool data. Please try again.");
            setLiquidityData(null);
        } finally {
            setLoading(false);
        }
    }, [selectedTokens, connection, decodePoolData]);

    // Re-fetch liquidity data every 30 seconds if no pool data is fetched
    useEffect(() => {
        if (!selectedTokens?.fromToken || !selectedTokens?.toToken || poolsFetched) return;

        const intervalId = setInterval(() => {
            fetchLiquidityData();
        }, 30000); // Refresh every 30 seconds

        fetchLiquidityData(); // Initial fetch when the component is mounted

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [selectedTokens, fetchLiquidityData, poolsFetched]);

    // Define actions based on liquidity data state
    const actions = liquidityData
        ? [
            { 
                label: "Add Liquidity", 
                onClick: () => console.log("Add Liquidity action triggered"),
                style: { backgroundColor: '#4CAF50', color: 'white' }
            },
            { 
                label: "View Pool", 
                onClick: () => console.log("View Pool action triggered"),
                style: { backgroundColor: '#2196F3', color: 'white' }
            },
        ]
        : [{ 
            label: "Create Liquidity", 
            onClick: onCreateLiquidity,
            style: { backgroundColor: '#FF9800', color: 'white' }
        }];

    return (
        <LiquidityCard
            title="Liquidity Pool Details"
            liquidityData={liquidityData}
            loading={loading}
            error={error}
            actions={actions}
            errorColor={error ? 'red' : 'green'} // Highlight error in red, success in green
        />
    );
};

LiquidityInfo.propTypes = {
    connection: PropTypes.instanceOf(Object).isRequired,
    selectedTokens: PropTypes.shape({
        fromToken: PropTypes.string.isRequired,
        toToken: PropTypes.string.isRequired,
    }).isRequired,
    onCreateLiquidity: PropTypes.func.isRequired,
};

export default LiquidityInfo;
