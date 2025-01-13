import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';


const PrizeModal = ({ campaign, onClose }) => {
    const [prizes, setPrizes] = useState([]);
    const [newPrize, setNewPrize] = useState({
        name: '',
        description: '',
        probability: '',
        quantity: '',
        is_winning:true
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
            const data = await response.json();
            setPrizes(data);
        } catch (err) {
            console.error('Error fetching prizes:', err);
            setError('Failed to load prizes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const totalProbability = prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0) + parseFloat(newPrize.probability);
            
            if (totalProbability > 100) {
                setError('Total probability cannot exceed 100%');
                return;
            }

            const response = await fetch(`${BASE_URL}/prizes/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newPrize.name,
                    description: newPrize.description,
                    probability: parseFloat(newPrize.probability),
                    quantity: parseInt(newPrize.quantity),
                    campaign: campaign.id  // Explicitly include campaign ID
                })
            });

            if (!response.ok) throw new Error('Failed to create prize');

            await fetchPrizes();
            setNewPrize({
                name: '',
                description: '',
                probability: '',
                quantity: ''
            });
            setError(null);
        } catch (err) {
            console.error('Error creating prize:', err);
            setError('Failed to create prize');
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
                // If response is not ok, try to get error message from response
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to delete prize');
            }
    
            // If successful, refresh the prizes list
            await fetchPrizes();
            setError(null); // Clear any existing errors
        } catch (err) {
            console.error('Error deleting prize:', err);
            setError(`Failed to delete prize: ${err.message}`);
        }
    };

    const totalProbability = prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

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
                        <span className="font-medium">Total Probability: {totalProbability}%</span>
                        <div className="w-full bg-gray-200 h-2 rounded mt-1">
                            <div 
                                className="bg-blue-500 h-2 rounded" 
                                style={{ width: `${totalProbability}%` }}
                            ></div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Current Prizes</h3>
                    <div className="space-y-3">
                        {prizes.map(prize => (
                            <div key={prize.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                                <div className="flex-grow">
                                    <div className="font-medium">{prize.name}</div>
                                    <div className="text-sm text-gray-600">{prize.description}</div>
                                    <div className="text-sm mt-1">
                                        <span className="mr-4">Probability: {prize.probability}%</span>
                                        <span>Quantity: {prize.quantity}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() =>{
                                        console.log('Deleting prize with ID:', prize.id);  // Debug log
                                        handleDeletePrize(prize.id)
                                    } }
                                    className="text-red-500 hover:text-red-700 ml-4"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
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
                                    // Reset quantity if non-winning
                                    quantity: e.target.value === 'true' ? newPrize.quantity : ''
                                })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="true">Prize</option>
                                <option value="false">Non-winning Outcome</option>
                            </select>
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
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    required
                                />
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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