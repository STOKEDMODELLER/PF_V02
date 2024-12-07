// ./components/LiquidityInfo/LiquidityInfo.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PublicKey } from "@solana/web3.js";
import LiquidityCard from "../LiquidityCard/LiquidityCard";

const LiquidityInfo = ({ poolAddress, connection, onCreateLiquidity }) => {
    const [liquidityData, setLiquidityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!poolAddress) return;

        const fetchLiquidityData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Validate pool address
                const poolPublicKey = new PublicKey(poolAddress);

                const poolAccountInfo = await connection.getAccountInfo(poolPublicKey);

                if (!poolAccountInfo) {
                    throw new Error("Pool account not found.");
                }

                const poolData = deserializePoolData(poolAccountInfo.data);
                setLiquidityData(poolData);
            } catch (err) {
                if (err.message.includes("Non-base58 character")) {
                    setError("Invalid pool address: contains non-base58 characters.");
                } else {
                    setError(err.message);
                }
                setLiquidityData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLiquidityData();
    }, [poolAddress, connection]);

    const deserializePoolData = (data) => {
        const buffer = Buffer.from(data);
        return {
            tokenA: new PublicKey(buffer.slice(0, 32)).toBase58(),
            tokenB: new PublicKey(buffer.slice(32, 64)).toBase58(),
            reserveA: Number(buffer.readBigUInt64LE(64)),
            reserveB: Number(buffer.readBigUInt64LE(72)),
        };
    };

    const actions = liquidityData
        ? [
              { label: "Add Liquidity", onClick: () => console.log("Add Liquidity action triggered") },
              { label: "View Pool", onClick: () => console.log("View Pool action triggered") },
          ]
        : [{ label: "Create Liquidity", onClick: onCreateLiquidity }];

    return (
        <LiquidityCard
            title="Liquidity Pool Details"
            liquidityData={liquidityData}
            loading={loading}
            error={error}
            actions={actions}
        />
    );
};

LiquidityInfo.propTypes = {
    poolAddress: PropTypes.string.isRequired,
    connection: PropTypes.object.isRequired,
    onCreateLiquidity: PropTypes.func.isRequired,
};

export default LiquidityInfo;
