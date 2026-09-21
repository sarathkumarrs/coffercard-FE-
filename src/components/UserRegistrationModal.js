import React, { useState } from 'react';

const UserRegistrationModal = ({onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePhone = (phone) => {
        // Allow 10 to 15 digits (to support country codes)
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    };

    const handlePhoneChange = (e) => {
        const phone = e.target.value;
        setFormData({...formData, phone});

        // Clear error when user starts typing
        if (errors.phone || errors.submit) {
            setErrors({...errors, phone: '', submit: ''});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validate phone number
        if (!validatePhone(formData.phone)) {
            setErrors({...errors, phone: 'Please enter a valid phone number (10-15 digits)'});
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: err.message || 'Registration failed. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
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
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm rounded">
                            {errors.submit}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2.5 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base mt-4 transition-colors ${
                            isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit & Play'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserRegistrationModal;