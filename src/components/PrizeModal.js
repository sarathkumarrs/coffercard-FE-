import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';

const PrizeModal = ({ campaign, onClose }) => {
    const [prizes, setPrizes] = useState([]);
    const [newPrize, setNewPrize] = useState({
        name: '',
        description: '',
        probability: '',
        quantity: '',
        is_winning: true
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/prizes/?campaign=${campaign.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setPrizes(data);
        } catch (err) {
            console.error('Error fetching prizes:', err);
            setError('Failed to load prizes: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const token = localStorage.getItem('access_token');
            
            // Validate probability
            const newProb = parseFloat(newPrize.probability);
            if (isNaN(newProb) || newProb < 0 || newProb > 100) {
                setError('Probability must be between 0 and 100');
                return;
            }
            
            const totalProbability = prizes.reduce((sum, prize) => 
                sum + (parseFloat(prize.probability) || 0), 0);
            
            if (totalProbability + newProb > 100) {
                setError(`Total probability cannot exceed 100%. Current: ${totalProbability}%, Adding: ${newProb}%`);
                return;
            }

            // Validate quantity for winning prizes
            if (newPrize.is_winning) {
                const qty = parseInt(newPrize.quantity);
                if (isNaN(qty) || qty < 1) {
                    setError('Quantity must be at least 1 for prizes');
                    return;
                }
            }

            // Prepare payload - FIXED: Added is_winning field
            const payload = {
                name: newPrize.name.trim(),
                description: newPrize.description.trim(),
                probability: newProb,
                is_winning: newPrize.is_winning,  // THIS WAS MISSING!
                campaign: campaign.id
            };

            // Only add quantity for winning prizes
            if (newPrize.is_winning) {
                payload.quantity = parseInt(newPrize.quantity);
            } else {
                // For non-winning outcomes, backend automatically sets quantity to 9999
                payload.quantity = 9999;  // Backend will handle this, but send a value to satisfy validation
            }

            console.log('Sending payload:', payload);

            const response = await fetch(`${BASE_URL}/prizes/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Server error:', errorData);
                throw new Error(errorData?.detail || errorData?.message || `HTTP error! status: ${response.status}`);
            }

            await fetchPrizes();
            setNewPrize({
                name: '',
                description: '',
                probability: '',
                quantity: '',
                is_winning: true
            });
            setError(null);
        } catch (err) {
            console.error('Error creating prize:', err);
            setError('Failed to create prize: ' + err.message);
        }
    };

    const handleDeletePrize = async (prizeId) => {
        if (!window.confirm('Are you sure you want to delete this prize?')) {
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/prizes/${prizeId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to delete prize');
            }
    
            await fetchPrizes();
            setError(null);
        } catch (err) {
            console.error('Error deleting prize:', err);
            setError(`Failed to delete prize: ${err.message}`);
        }
    };

    const totalProbability = prizes.reduce((sum, prize) => 
        sum + (parseFloat(prize.probability) || 0), 0);
    
    const remainingProbability = 100 - totalProbability;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage Prizes - {campaign.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="bg-gray-100 p-3 rounded mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Total Probability: {totalProbability.toFixed(1)}%</span>
                            <span className="text-sm text-gray-600">Remaining: {remainingProbability.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded">
                            <div 
                                className={`h-2 rounded ${totalProbability > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(totalProbability, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Current Prizes</h3>
                    {prizes.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No prizes added yet</div>
                    ) : (
                        <div className="space-y-3">
                            {prizes.map(prize => (
                                <div key={prize.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{prize.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                prize.is_winning ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                                {prize.is_winning ? 'Prize' : 'Non-winning'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">{prize.description}</div>
                                        <div className="text-sm mt-1">
                                            <span className="mr-4">Probability: {prize.probability}%</span>
                                            {prize.is_winning && prize.quantity > 0 && <span>Quantity: {prize.quantity}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            console.log('Deleting prize with ID:', prize.id);
                                            handleDeletePrize(prize.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 ml-4"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Prize</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Prize Name</label>
                            <input
                                type="text"
                                value={newPrize.name}
                                onChange={e => setNewPrize({...newPrize, name: e.target.value})}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={newPrize.is_winning.toString()}
                                onChange={e => setNewPrize({
                                    ...newPrize,
                                    is_winning: e.target.value === 'true',
                                    quantity: e.target.value === 'true' ? newPrize.quantity : ''
                                })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="true">Prize</option>
                                <option value="false">Non-winning Outcome</option>
                            </select>
                            {!newPrize.is_winning && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Note: Quantity is automatically set to unlimited for non-winning outcomes
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={newPrize.description}
                                onChange={e => setNewPrize({...newPrize, description: e.target.value})}
                                className="w-full p-2 border rounded"
                                rows="2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Win Probability (%)</label>
                                <input
                                    type="number"
                                    value={newPrize.probability}
                                    onChange={e => setNewPrize({...newPrize, probability: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Remaining: {remainingProbability.toFixed(1)}%</p>
                            </div>
                            {newPrize.is_winning && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity Available</label>
                                    <input
                                        type="number"
                                        value={newPrize.quantity}
                                        onChange={e => setNewPrize({...newPrize, quantity: e.target.value})}
                                        className="w-full p-2 border rounded"
                                        min="1"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                disabled={totalProbability + parseFloat(newPrize.probability || 0) > 100}
                            >
                                Add Prize
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PrizeModal;