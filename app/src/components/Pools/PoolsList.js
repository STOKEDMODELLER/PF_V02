import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { PublicKey } from "@solana/web3.js";
import idl from "../../utils/idl/solana_amm.json"; // Import the IDL with the program ID

const PoolInfo = ({ connection }) => {
    const [poolData, setPoolData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to decode pool data from the raw byte data
    const decodePoolData = useCallback((dataBuffer) => {
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

    // Function to fetch all pool data from the Solana blockchain
    const fetchAllPools = useCallback(async () => {
        setLoading(true);
        setError(null);

        const programId = new PublicKey(idl.metadata.address); // Program ID from IDL

        try {
            const programAccounts = await connection.getProgramAccounts(programId);

            if (!programAccounts || programAccounts.length === 0) {
                setError("No liquidity pools found.");
                setPoolData([]);
                return;
            }

            // Filter accounts to find pools (adjust based on actual data size)
            const filteredProgramAccounts = await connection.getProgramAccounts(programId, {
                filters: [{ dataSize: 256 }], // Assuming 256-byte data for each pool
            });

            if (!filteredProgramAccounts || filteredProgramAccounts.length === 0) {
                setError("No liquidity pools found.");
                setPoolData([]);
                return;
            }

            const decodedPools = filteredProgramAccounts
                .map(account => decodePoolData(account.account.data))
                .filter(pool => pool);

            if (decodedPools.length === 0) {
                setError("No pools found.");
                setPoolData([]);
            } else {
                setPoolData(decodedPools);  // Store all decoded pools
                setError(null);
            }
        } catch (error) {
            setError("Error fetching liquidity pool data. Please try again.");
            setPoolData([]);
        } finally {
            setLoading(false);
        }
    }, [connection, decodePoolData]);

    // Fetch all pools when the component mounts
    useEffect(() => {
        fetchAllPools();  // Initial fetch when the component is mounted
    }, [fetchAllPools]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            {loading ? (
                <div className="text-center text-gray-300">Loading pools...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : poolData ? (
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Pool Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Token A</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Token B</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Reserve A</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Reserve B</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Total LP Tokens</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Fee Percentage</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {poolData.length > 0 ? (
                            poolData.map((pool, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.poolName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.tokenA}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.tokenB}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.reserveA}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.reserveB}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.totalLpTokens}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{pool.feePercentage}%</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{new Date(pool.creationTimestamp * 1000).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center text-gray-400">No pools available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-gray-400">No pool data available</div>
            )}
        </div>
    );
};

PoolInfo.propTypes = {
    connection: PropTypes.instanceOf(Object).isRequired,
};

export default PoolInfo;
