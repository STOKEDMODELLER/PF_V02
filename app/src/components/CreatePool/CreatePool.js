// File: src/components/CreatePool/CreatePool.js

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { initializePool, getPoolByTokens } from '../../utils/poolInteraction';
import { useNotification } from '../../context/NotificationContext';
import PoolInfoCard from './PoolInfoCard';
import TokenSelector from '../TokenSelector/TokenSelector';
import GlobalModal from '../Global/GlobalModal';

const CreatePool = () => {
  const { wallet, connected } = useWallet();
  const { showNotification } = useNotification();

  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(null);
  const [existingPool, setExistingPool] = useState(null);
  const [isLoadingPool, setIsLoadingPool] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Effect to check if a pool exists for the selected token pair
  useEffect(() => {
    const checkExistingPool = async () => {
      if (tokenA && tokenB && wallet && connected) {
        setIsLoadingPool(true);
        setExistingPool(null);
        try {
          const pool = await getPoolByTokens(tokenA.address, tokenB.address, wallet);
          if (pool) {
            setExistingPool(pool);
          } else {
            setExistingPool(null);
          }
        } catch (error) {
          console.error('Error fetching pool:', error);
          showNotification('Error fetching pool information.', 'error');
        } finally {
          setIsLoadingPool(false);
        }
      } else {
        setExistingPool(null);
      }
    };

    checkExistingPool();
  }, [tokenA, tokenB, wallet, connected, showNotification]);

  const handleCreatePool = async () => {
    if (!connected) {
      showNotification('Please connect your wallet.', 'error');
      return;
    }

    if (!tokenA || !tokenB || !amountA || !amountB) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }

    if (tokenA.address === tokenB.address) {
      showNotification('Token A and Token B must be different.', 'error');
      return;
    }

    if (existingPool) {
      showNotification('A pool already exists for this token pair.', 'error');
      return;
    }

    try {
      // Convert amounts to numbers
      const amountANumber = parseFloat(amountA);
      const amountBNumber = parseFloat(amountB);

      if (
        isNaN(amountANumber) ||
        isNaN(amountBNumber) ||
        amountANumber <= 0 ||
        amountBNumber <= 0
      ) {
        showNotification('Please enter valid amounts greater than zero.', 'error');
        return;
      }

      // Call initializePool with the required parameters
      await initializePool(
        tokenA.address,
        tokenB.address,
        amountANumber,
        amountBNumber,
        wallet
      );

      showNotification('Pool created successfully!', 'success');
      // Optionally reset the form or navigate to another page
      setTokenA(null);
      setTokenB(null);
      setAmountA('');
      setAmountB('');
      setExistingPool(null);
    } catch (error) {
      console.error('Error creating pool:', error);
      showNotification('Failed to create pool. Please check the console for more details.', 'error');
    }
  };

  const handleTokenSelect = (token) => {
    if (isTokenSelectorOpen === 'tokenA') {
      if (tokenB && token.address === tokenB.address) {
        showNotification('Token A and Token B must be different.', 'error');
        return;
      }
      setTokenA(token);
    } else if (isTokenSelectorOpen === 'tokenB') {
      if (tokenA && token.address === tokenA.address) {
        showNotification('Token A and Token B must be different.', 'error');
        return;
      }
      setTokenB(token);
    }
    setIsTokenSelectorOpen(null);
    setIsModalVisible(false);
  };

  const openTokenSelector = (type) => {
    setIsTokenSelectorOpen(type);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsTokenSelectorOpen(null);
    setIsModalVisible(false);
  };

  return (
    <>
      <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white mb-4">Create a New Pool</h2>

        {/* Token A Selection */}
        <div className="mb-4">
          <label className="text-sm text-white mb-2">Token A</label>
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-between px-4"
            onClick={() => openTokenSelector('tokenA')}
          >
            {tokenA ? (
              <>
                <div className="flex items-center">
                  <img
                    src={tokenA.metadata?.image || 'https://via.placeholder.com/24'}
                    alt={tokenA.metadata?.symbol || 'Token'}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  {tokenA.metadata?.symbol}
                </div>
                <span>
                  {tokenA.address.slice(0, 4)}...{tokenA.address.slice(-4)}
                </span>
              </>
            ) : (
              'Select Token A'
            )}
          </button>
        </div>

        {/* Token B Selection */}
        <div className="mb-4">
          <label className="text-sm text-white mb-2">Token B</label>
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-between px-4"
            onClick={() => openTokenSelector('tokenB')}
          >
            {tokenB ? (
              <>
                <div className="flex items-center">
                  <img
                    src={tokenB.metadata?.image || 'https://via.placeholder.com/24'}
                    alt={tokenB.metadata?.symbol || 'Token'}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  {tokenB.metadata?.symbol}
                </div>
                <span>
                  {tokenB.address.slice(0, 4)}...{tokenB.address.slice(-4)}
                </span>
              </>
            ) : (
              'Select Token B'
            )}
          </button>
        </div>

        {/* Amounts */}
        <div className="mb-4">
          <label className="text-sm text-white mb-2">Initial Amount of Token A</label>
          <input
            type="number"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            placeholder="0.0"
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="text-sm text-white mb-2">Initial Amount of Token B</label>
          <input
            type="number"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            placeholder="0.0"
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg focus:outline-none"
          />
        </div>

        {/* Create Pool Button */}
        <button
          onClick={handleCreatePool}
          className={`w-full py-3 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold rounded-lg hover:brightness-110 transition ${
            existingPool ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!!existingPool}
        >
          Create Pool
        </button>

        {/* Existing Pool Info */}
        {isLoadingPool ? (
          <div className="mt-4 text-white">Loading pool information...</div>
        ) : existingPool ? (
          <div className="mt-4">
            <h3 className="text-xl text-white mb-2">Existing Pool Found</h3>
            <PoolInfoCard
              pool={existingPool}
              tokenAInfo={tokenA?.metadata}
              tokenBInfo={tokenB?.metadata}
            />
          </div>
        ) : (
          tokenA &&
          tokenB && (
            <div className="mt-4 text-white">
              No existing pool found for this token pair. You can create one.
            </div>
          )
        )}
      </div>

      {/* Global Modal */}
      {isModalVisible && (
        <GlobalModal
          isVisible={isModalVisible}
          title="Select a Token"
          content={
            <TokenSelector onSelectToken={handleTokenSelect} onClose={closeModal} />
          }
          onClose={closeModal}
          options={{
            fixedHeader: true,
            scrollableContent: false, // TokenSelector handles its own scrolling
            modalWidth: '500px',
            modalHeight: '70%',
            showCloseButton: true,
            theme: 'dark',
          }}
        />
      )}
    </>
  );
};

export default CreatePool;
