import React, { useState } from 'react';
import PropTypes from 'prop-types';

const RefreshSlippage = ({ slippage, onRefresh }) => {
    return (
        <div className="flex items-center justify-between w-full mt-4">
            <button
                onClick={onRefresh}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#EEEFF6] bg-gradient-to-b from-[#6E85F71A] to-[#6E85F713] shadow-[0_2px_10px_0px_rgba(0,0,0,0.2)] hover:brightness-125 focus:outline-none focus:ring focus:ring-blue-500 transition"
                title="Refresh Price"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18" className="h-5 w-5">
                    <path
                        fill="currentColor"
                        d="M10 2.6a6.38 6.38 0 0 0-4.156 1.533.533.533 0 1 0 .692.81A5.3 5.3 0 0 1 10 3.668c2.771 0 5.04 2.1 5.307 4.8h-1.574l2.134 3.2L18 8.467h-1.627C16.1 5.187 13.348 2.6 10 2.6M4.133 6.333 2 9.533h1.627C3.9 12.813 6.652 15.4 10 15.4a6.38 6.38 0 0 0 4.156-1.533.535.535 0 0 0-.094-.895.53.53 0 0 0-.598.084A5.3 5.3 0 0 1 10 14.333c-2.771 0-5.04-2.1-5.307-4.8h1.574z"
                    />
                </svg>
            </button>
            <div className="text-sm text-tertiary font-medium flex items-center">
                <span>Slippage:</span>
                <span className="ml-1">{slippage}%</span>
            </div>
        </div>
    );
};

RefreshSlippage.propTypes = {
    slippage: PropTypes.number.isRequired,
    onRefresh: PropTypes.func.isRequired,
};

export default RefreshSlippage;
