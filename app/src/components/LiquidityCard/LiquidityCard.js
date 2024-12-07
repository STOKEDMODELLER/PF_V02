// ./components/LiquidityCard/LiquidityCard.js
import React from "react";
import PropTypes from "prop-types";
import CreateLiquidityButton from "../CreateLiquidityButton/CreateLiquidityButton";

const LiquidityCard = ({ title, liquidityData, loading, error, actions }) => {
    if (loading) {
        return (
            <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
                <p className="text-gray-400 text-center">Loading liquidity data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    if (!liquidityData) {
        return (
            <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
                <p className="text-gray-500 text-center mb-4">No liquidity data available.</p>
                <div className="flex justify-center">
                    <CreateLiquidityButton onCreate={actions[0]?.onClick} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
            <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center justify-between p-4 bg-indigo-800 rounded-lg border border-transparent">
                    <div className="flex flex-col w-[65%]">
                        <label className="text-sm text-white">Token A</label>
                        <span className="text-white text-2xl font-semibold">
                            {liquidityData.reserveA}
                        </span>
                        <span className="text-sm text-gray-300">
                            {liquidityData.tokenA.slice(0, 4)}...{liquidityData.tokenA.slice(-4)}
                        </span>
                    </div>
                </div>

                <div className="relative flex items-center justify-between p-4 bg-indigo-800 rounded-lg border border-transparent">
                    <div className="flex flex-col w-[65%]">
                        <label className="text-sm text-white">Token B</label>
                        <span className="text-white text-2xl font-semibold">
                            {liquidityData.reserveB}
                        </span>
                        <span className="text-sm text-gray-300">
                            {liquidityData.tokenB.slice(0, 4)}...{liquidityData.tokenB.slice(-4)}
                        </span>
                    </div>
                </div>
            </div>
            {actions.length > 0 && (
                <div className="flex justify-end gap-2 mt-4">
                    {actions.map(({ label, onClick }, index) => (
                        <button
                            key={index}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:brightness-110 transition"
                            onClick={onClick}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

LiquidityCard.propTypes = {
    title: PropTypes.string.isRequired,
    liquidityData: PropTypes.shape({
        tokenA: PropTypes.string.isRequired,
        tokenB: PropTypes.string.isRequired,
        reserveA: PropTypes.number.isRequired,
        reserveB: PropTypes.number.isRequired,
    }),
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
        })
    ).isRequired,
};

export default LiquidityCard;
