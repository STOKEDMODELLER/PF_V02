import React from 'react';
import PropTypes from 'prop-types';

const PoolInfoCard = ({ pool, tokenAInfo, tokenBInfo }) => {
  if (!pool || !pool.account) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
        <p>Error: Pool data is unavailable.</p>
      </div>
    );
  }

  try {
    const { publicKey, account } = pool;
    // Extract necessary pool data
    const tokenAPubKey = account.tokenA;
    const tokenBPubKey = account.tokenB;
    const reserveA = account.reserveA.toNumber();
    const reserveB = account.reserveB.toNumber();

    // Optional: Display token metadata if provided
    const tokenASymbol = tokenAInfo?.symbol || tokenAPubKey.toString().slice(0, 4) + '...' + tokenAPubKey.toString().slice(-4);
    const tokenBSymbol = tokenBInfo?.symbol || tokenBPubKey.toString().slice(0, 4) + '...' + tokenBPubKey.toString().slice(-4);
    const tokenAImage = tokenAInfo?.image || 'https://via.placeholder.com/24';
    const tokenBImage = tokenBInfo?.image || 'https://via.placeholder.com/24';

    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
        <h3 className="text-lg font-semibold mb-2">Pool Information</h3>
        <div className="flex items-center mb-4">
          <img src={tokenAImage} alt={tokenASymbol} className="w-6 h-6 mr-2 rounded-full" />
          <span>{tokenASymbol}</span>
          <span className="mx-2">/</span>
          <img src={tokenBImage} alt={tokenBSymbol} className="w-6 h-6 mr-2 rounded-full" />
          <span>{tokenBSymbol}</span>
        </div>
        <p className="mb-2">
          <strong>Pool Address:</strong> {publicKey.toString()}
        </p>
        <p className="mb-2">
          <strong>Reserve {tokenASymbol}:</strong> {reserveA}
        </p>
        <p className="mb-2">
          <strong>Reserve {tokenBSymbol}:</strong> {reserveB}
        </p>
        {/* Include additional pool details as needed */}
      </div>
    );
  } catch (error) {
    console.error('Error rendering PoolInfoCard:', error);
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
        <p>Error displaying pool information.</p>
      </div>
    );
  }
};

PoolInfoCard.propTypes = {
  pool: PropTypes.shape({
    publicKey: PropTypes.object.isRequired,
    account: PropTypes.shape({
      tokenA: PropTypes.object.isRequired,
      tokenB: PropTypes.object.isRequired,
      reserveA: PropTypes.object.isRequired, // Assuming BN
      reserveB: PropTypes.object.isRequired, // Assuming BN
    }).isRequired,
  }).isRequired,
  tokenAInfo: PropTypes.shape({
    symbol: PropTypes.string,
    image: PropTypes.string,
  }),
  tokenBInfo: PropTypes.shape({
    symbol: PropTypes.string,
    image: PropTypes.string,
  }),
};

PoolInfoCard.defaultProps = {
  tokenAInfo: null,
  tokenBInfo: null,
};

export default PoolInfoCard;
