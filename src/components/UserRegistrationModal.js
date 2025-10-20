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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center sm:text-left">
                    Enter Your Details to Play
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="10-digit phone number"
                            required
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium mt-4"
                    >
                        Submit & Play
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserRegistrationModal;