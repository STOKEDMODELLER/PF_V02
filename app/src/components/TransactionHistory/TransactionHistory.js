// ./components/TransactionHistory/TransactionHistory.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PublicKey } from '@solana/web3.js';
import './TransactionHistory.css';

const TransactionHistory = ({ walletAddress, connection }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!walletAddress) return;

        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const publicKey = new PublicKey(walletAddress);
                const transactionSignatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
                const fetchedTransactions = await Promise.all(
                    transactionSignatures.map((sig) => connection.getTransaction(sig.signature))
                );
                setTransactions(fetchedTransactions.filter(Boolean)); // Filter out nulls
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [walletAddress, connection]);

    if (loading) {
        return <div className="text-gray-500 text-center">Loading transactions...</div>;
    }

    if (transactions.length === 0) {
        return <div className="text-gray-500 text-center">No transactions found.</div>;
    }

    return (
        <div className="flex flex-col gap-y-4 bg-gray-800 text-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <ul className="divide-y divide-gray-700">
                {transactions.map((tx, index) => (
                    <li key={index} className="py-3">
                        <p className="text-sm">Signature: {tx.transaction.signatures[0]}</p>
                        <p className="text-xs text-gray-400">
                            Block Time: {new Date(tx.blockTime * 1000).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

TransactionHistory.propTypes = {
    walletAddress: PropTypes.string.isRequired,
    connection: PropTypes.object.isRequired, // Instance of Solana Connection
};

export default TransactionHistory;
