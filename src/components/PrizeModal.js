import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';

const PrizeModal = ({ campaign, onClose }) => {
    const [prizes, setPrizes] = useState([]);
    const [newPrize, setNewPrize] = useState({
        name: '',
        description: '',
        probability: '',
        quantity: '',
        coupon_code: '',
        is_winning: true
    });
    const [error, setError] = useState(null);
    const [editingPrize, setEditingPrize] = useState(null);

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

    const [isRebalancing, setIsRebalancing] = useState(false);

    const handleRebalancePrizes = async () => {
        if (!window.confirm('This will automatically scale all prizes so their combined probability equals exactly 100% (with winning odds capped at 85%). Proceed?')) {
            return;
        }
        try {
            setIsRebalancing(true);
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/campaigns/${campaign.id}/rebalance_prizes/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to rebalance prizes');
            }
            await fetchPrizes();
            setError(null);
        } catch (err) {
            console.error('Error rebalancing prizes:', err);
            setError(err.message);
        } finally {
            setIsRebalancing(false);
        }
    };

    const handleEditClick = (prize) => {
        setEditingPrize(prize.id);
        setNewPrize({
            name: prize.name,
            description: prize.description,
            probability: prize.probability.toString(),
            quantity: prize.quantity.toString(),
            coupon_code: prize.coupon_code || '',
            is_winning: prize.is_winning
        });
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingPrize(null);
        setNewPrize({
            name: '',
            description: '',
            probability: '',
            quantity: '',
            coupon_code: '',
            is_winning: true
        });
        setError(null);
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

            // Check if this is an edit that does not increase probability
            const editingPrizeObj = prizes.find(p => p.id === editingPrize);
            const origProb = editingPrizeObj ? (parseFloat(editingPrizeObj.probability) || 0) : null;
            const origIsWinning = editingPrizeObj ? editingPrizeObj.is_winning : true;
            const isEditNotIncreasing = editingPrize && origProb !== null && newProb <= origProb && newPrize.is_winning === origIsWinning;

            // Winning probability cannot be 100% or higher
            if (newPrize.is_winning && newProb >= 100) {
                setError('A winning prize cannot have 100% probability. Total winning probability must be strictly less than 100%.');
                return;
            }

            // Calculate total winning probability excluding the prize being edited
            const currentWinningProbability = prizes
                .filter(prize => prize.id !== editingPrize && prize.is_winning)
                .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

            if (newPrize.is_winning && !isEditNotIncreasing && (currentWinningProbability + newProb >= 100)) {
                setError(`Total winning probability cannot reach or exceed 100%. Current winning: ${currentWinningProbability.toFixed(1)}%, Adding: ${newProb}%. Total would be ${(currentWinningProbability + newProb).toFixed(1)}%. Must leave a margin for non-winning outcomes.`);
                return;
            }

            // Calculate total probability excluding the prize being edited
            const totalProbability = prizes
                .filter(prize => prize.id !== editingPrize)
                .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

            if (!isEditNotIncreasing && (totalProbability + newProb > 100)) {
                setError(`Total combined probability cannot exceed 100%. Current: ${totalProbability}%, Adding: ${newProb}%`);
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

            // Prepare payload
            const payload = {
                name: newPrize.name.trim(),
                description: newPrize.description.trim(),
                probability: newProb,
                is_winning: newPrize.is_winning,
                campaign: campaign.id
            };

            // Add coupon code if winning prize
            if (newPrize.is_winning && newPrize.coupon_code) {
                payload.coupon_code = newPrize.coupon_code.trim().toUpperCase();
            } else if (newPrize.is_winning && !newPrize.coupon_code) {
                payload.coupon_code = '';
            }

            // Only add quantity for winning prizes
            if (newPrize.is_winning) {
                payload.quantity = parseInt(newPrize.quantity);
            } else {
                payload.quantity = 9999;
            }

            console.log('Sending payload:', payload);

            // Determine if creating or updating
            const url = editingPrize
                ? `${BASE_URL}/prizes/${editingPrize}/`
                : `${BASE_URL}/prizes/`;
            const method = editingPrize ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Server error:', errorData);
                let msg = errorData?.detail || errorData?.message;
                if (!msg && errorData && typeof errorData === 'object') {
                    const firstKey = Object.keys(errorData)[0];
                    if (firstKey) {
                        const val = errorData[firstKey];
                        msg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
                    }
                }
                throw new Error(msg || `HTTP error! status: ${response.status}`);
            }

            await fetchPrizes();
            setNewPrize({
                name: '',
                description: '',
                probability: '',
                quantity: '',
                coupon_code: '',
                is_winning: true
            });
            setEditingPrize(null);
            setError(null);
        } catch (err) {
            console.error(`Error ${editingPrize ? 'updating' : 'creating'} prize:`, err);
            setError(`Failed to ${editingPrize ? 'update' : 'create'} prize: ` + err.message);
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

    const remainingProbability = Math.max(0, 100 - totalProbability);

    const winningProbability = prizes
        .filter(prize => prize.is_winning)
        .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

    const nonWinningProbability = prizes
        .filter(prize => !prize.is_winning)
        .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

    // Calculate probabilities excluding the currently editing prize
    const totalProbabilityExcludingEditing = prizes
        .filter(prize => prize.id !== editingPrize)
        .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

    const winningProbabilityExcludingEditing = prizes
        .filter(prize => prize.id !== editingPrize && prize.is_winning)
        .reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);

    const editingPrizeObj = prizes.find(p => p.id === editingPrize);
    const origProb = editingPrizeObj ? (parseFloat(editingPrizeObj.probability) || 0) : null;
    const origIsWinning = editingPrizeObj ? editingPrizeObj.is_winning : true;
    const isEditNotIncreasing = editingPrize && origProb !== null && parseFloat(newPrize.probability || 0) <= origProb && newPrize.is_winning === origIsWinning;

    const enteredProbability = parseFloat(newPrize.probability) || 0;
    const isExceedingTotal = !isEditNotIncreasing && (totalProbabilityExcludingEditing + enteredProbability > 100);
    const isExceedingWinning = newPrize.is_winning && !isEditNotIncreasing && (enteredProbability >= 100 || (winningProbabilityExcludingEditing + enteredProbability >= 100));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold">Manage Prizes - {campaign.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg mb-4 space-y-2">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="font-semibold text-gray-800">
                                Allocated Probability: {totalProbability.toFixed(1)}% / 100%
                            </span>
                            <span className="text-gray-500">
                                Remaining: <strong>{remainingProbability.toFixed(1)}%</strong>
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${Math.min(winningProbability, 100)}%` }}
                                title={`Winning Odds: ${winningProbability.toFixed(1)}%`}
                            ></div>
                            <div 
                                className="h-full bg-slate-400 transition-all duration-300"
                                style={{ width: `${Math.min(nonWinningProbability, Math.max(0, 100 - winningProbability))}%` }}
                                title={`Non-winning Odds: ${nonWinningProbability.toFixed(1)}%`}
                            ></div>
                        </div>
                        <div className="flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2 pt-1 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                    <span>Winning: <strong>{winningProbability.toFixed(1)}%</strong> <span className="text-amber-700 font-medium">(Must be &lt; 100%)</span></span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                                    <span>Non-winning: <strong>{nonWinningProbability.toFixed(1)}%</strong></span>
                                </span>
                            </div>
                            {winningProbability >= 99.9 && (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    ⚠️ Winning limit reached (&lt; 100%)
                                </span>
                            )}
                        </div>
                    </div>

                    {(totalProbability > 100 || winningProbability >= 100) && (
                        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-xs sm:text-sm">
                                <span className="font-bold">⚠️ Probability Over-allocated:</span> Total is {totalProbability.toFixed(1)}% (Winning: {winningProbability.toFixed(1)}%).
                                Click Auto-Balance to fit all prizes to 100.0%.
                            </div>
                            <button
                                type="button"
                                onClick={handleRebalancePrizes}
                                disabled={isRebalancing}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
                            >
                                {isRebalancing ? 'Balancing...' : '⚖️ Auto-Balance to 100%'}
                            </button>
                        </div>
                    )}

                    <h3 className="text-lg font-semibold mb-4">Current Prizes</h3>
                    {prizes.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No prizes added yet</div>
                    ) : (
                        <div className="space-y-3">
                            {prizes.map(prize => (
                                <div key={prize.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded border gap-3">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm sm:text-base">{prize.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                prize.is_winning ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                                {prize.is_winning ? 'Prize' : 'Non-winning'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">{prize.description}</div>
                                        <div className="text-xs sm:text-sm mt-1 flex items-center gap-3 flex-wrap">
                                            <span>Probability: {prize.probability}%</span>
                                            {prize.is_winning && (
                                                <span className="flex items-center gap-1.5 flex-wrap">
                                                    <span>Available to Win: <strong>{prize.quantity}</strong></span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-600">Won: <strong>{prize.claimed_count || 0}</strong></span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-blue-700 font-medium">Redeemed: <strong>{prize.redeemed_count || 0}</strong></span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className={prize.quantity > 0 ? "text-emerald-700 font-semibold" : "text-red-600 font-bold"}>
                                                        {prize.quantity > 0 ? "In Stock" : "Finished"}
                                                    </span>
                                                </span>
                                            )}
                                            {prize.coupon_code && (
                                                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                                    🎟️ {prize.coupon_code}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:ml-4">
                                        <button
                                            onClick={() => handleEditClick(prize)}
                                            className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log('Deleting prize with ID:', prize.id);
                                                handleDeletePrize(prize.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {editingPrize ? 'Edit Prize' : 'Add New Prize'}
                        </h3>
                        {editingPrize && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {newPrize.is_winning ? 'Win Probability (%)' : 'Outcome Probability (%)'}
                                </label>
                                <input
                                    type="number"
                                    value={newPrize.probability}
                                    onChange={e => setNewPrize({...newPrize, probability: e.target.value})}
                                    className={`w-full p-2 border rounded ${
                                        isExceedingWinning || isExceedingTotal ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                    }`}
                                    step="0.01"
                                    min="0.01"
                                    max={newPrize.is_winning ? "99.99" : "100"}
                                    required
                                />
                                {newPrize.is_winning ? (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max winning allowed: <strong className="text-gray-700">{Math.max(0, 99.9 - winningProbabilityExcludingEditing).toFixed(1)}%</strong> <span className="text-amber-700 font-medium">(Must be &lt; 100%)</span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max unallocated: <strong className="text-gray-700">{Math.max(0, 100 - totalProbabilityExcludingEditing).toFixed(1)}%</strong>
                                    </p>
                                )}
                                {isExceedingWinning && (
                                    <p className="text-xs text-red-600 font-semibold mt-1">
                                        ⚠️ Total winning probability cannot reach or exceed 100% (would be {(winningProbabilityExcludingEditing + enteredProbability).toFixed(1)}%). Must leave margin for losing.
                                    </p>
                                )}
                                {!isExceedingWinning && isExceedingTotal && (
                                    <p className="text-xs text-red-600 font-semibold mt-1">
                                        ⚠️ Total combined probability cannot exceed 100% (currently {(totalProbabilityExcludingEditing + enteredProbability).toFixed(1)}%).
                                    </p>
                                )}
                            </div>
                            {newPrize.is_winning && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity Available to Win</label>
                                    <input
                                        type="number"
                                        value={newPrize.quantity}
                                        onChange={e => setNewPrize({...newPrize, quantity: e.target.value})}
                                        className="w-full p-2 border rounded"
                                        min="1"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Number of times this prize can be won before it runs out.</p>
                                </div>
                            )}
                        </div>
                        {newPrize.is_winning && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon / Promo Code (Optional)</label>
                                <input
                                    type="text"
                                    value={newPrize.coupon_code}
                                    onChange={e => setNewPrize({...newPrize, coupon_code: e.target.value.toUpperCase()})}
                                    className="w-full p-2 border rounded font-mono uppercase tracking-wider text-sm"
                                    placeholder="e.g. SAVE20, LUCKY50, FREESHIP"
                                />
                                <p className="text-xs text-gray-500 mt-1">If blank, an automatic code will be generated for the winner.</p>
                            </div>
                        )}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            {editingPrize && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                                disabled={
                                    !newPrize.name.trim() ||
                                    !newPrize.probability ||
                                    enteredProbability <= 0 ||
                                    isExceedingTotal ||
                                    isExceedingWinning
                                }
                            >
                                {editingPrize ? 'Update Prize' : 'Add Prize'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PrizeModal;