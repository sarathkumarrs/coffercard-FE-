import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Phone, Settings } from 'lucide-react';

const RenewalModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-indigo-100 rounded-full p-3">
            <Phone className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          Renew Your Subscription
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Contact our customer care executive to renew or extend your subscription
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">Customer Care Number</p>
          <a
            href="tel:7034714831"
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 text-center block"
          >
            7034714831
          </a>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ExpiredAccessOverlay = ({ accessStatus, onRenewClick, onLogout }) => {
  const isTrial = accessStatus?.status === 'trial_expired';
  const isExpired = accessStatus?.status === 'expired';

  if (!isTrial && !isExpired) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {isTrial ? 'Trial Period Ended' : 'Subscription Expired'}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {isTrial
            ? 'Your 7-day trial period has ended. Please contact our customer care to activate your subscription and continue using CofferCard.'
            : 'Your subscription has expired. Please renew to continue accessing your campaigns and features.'
          }
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <p className="text-sm text-gray-600 text-center mb-3 font-medium">
            Contact Customer Care to Renew
          </p>
          <a
            href="tel:7034714831"
            className="text-3xl font-bold text-indigo-600 hover:text-indigo-700 text-center block mb-2"
          >
            7034714831
          </a>
          <p className="text-xs text-gray-500 text-center">
            Available Mon-Sat, 9 AM - 6 PM
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRenewClick}
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Call to Renew
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if access is expired
  const isAccessExpired = () => {
    if (!user?.access_status) return false;
    return user.access_status.status === 'trial_expired' || user.access_status.status === 'expired';
  };

  // Check if we should show the renewal warning (days < 10)
  const shouldShowRenewalWarning = () => {
    if (!user?.access_status) return false;
    const daysLeft = user.access_status.days_left;
    return daysLeft !== null && daysLeft !== undefined && daysLeft < 10 && daysLeft >= 0;
  };

  const getDaysLeftDisplay = () => {
    const daysLeft = user?.access_status?.days_left;
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  const handleRenewCall = () => {
    window.location.href = 'tel:7034714831';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 text-xl font-bold text-indigo-600">
                CofferCard
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/campaigns"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/campaigns')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Campaigns
                </Link>
                <Link
                  to="/settings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/settings')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Renewal Warning */}
              {shouldShowRenewalWarning() && (
                <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    {getDaysLeftDisplay()}
                  </span>
                  <button
                    onClick={() => setIsRenewalModalOpen(true)}
                    className="ml-2 px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                  >
                    Renew
                  </button>
                </div>
              )}

              {/* Company Name */}
              <span className="text-sm text-gray-700 font-medium">{user?.company_name}</span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
      />

      {/* Expired Access Overlay - Blocks all interaction when expired */}
      {isAccessExpired() && (
        <ExpiredAccessOverlay
          accessStatus={user?.access_status}
          onRenewClick={handleRenewCall}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Layout;