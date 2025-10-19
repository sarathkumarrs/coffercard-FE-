import React, { useState } from 'react';

const UserRegistrationModal = ({onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});

    const validatePhone = (phone) => {
        // Remove any non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length === 10;
    };

    const handlePhoneChange = (e) => {
        const phone = e.target.value;
        setFormData({...formData, phone});

        // Clear error when user starts typing
        if (errors.phone) {
            setErrors({...errors, phone: ''});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!validatePhone(formData.phone)) {
            setErrors({...errors, phone: 'Phone number must be exactly 10 digits'});
            return;
        }

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Enter Your Details to Play</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Submit & Play
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserRegistrationModal;