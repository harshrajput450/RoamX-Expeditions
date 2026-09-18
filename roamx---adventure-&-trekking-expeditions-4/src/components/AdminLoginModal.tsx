import React, { useState } from 'react';
import { Shield, Lock, X, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminEmail: string) => void;
}

export const OWNER_EMAIL = 'harsh_cse24@delhitechnicalcampus.ac.in';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = password.trim();

      // Authorized owner emails
      const isAuthorizedEmail =
        trimmedEmail === OWNER_EMAIL.toLowerCase() ||
        trimmedEmail === 'admin@roamx.com' ||
        trimmedEmail.endsWith('@delhitechnicalcampus.ac.in');

      // Secure Passwords
      const isValidPassword =
        trimmedPass === 'Harsh@RoamX2026' ||
        trimmedPass === 'roamx2026' ||
        trimmedPass === 'Harsh2026';

      if (!isAuthorizedEmail || !isValidPassword) {
        setError('Invalid Email or Password. Access is restricted to authorized administrators.');
        setIsLoading(false);
        return;
      }

      // Successful Auth
      localStorage.setItem('roamx_admin_auth', 'true');
      localStorage.setItem('roamx_admin_email', trimmedEmail);
      setIsLoading(false);
      onLoginSuccess(trimmedEmail);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-w-md sm:rounded-2xl rounded-none shadow-2xl border-0 sm:border border-gray-200 overflow-hidden relative animate-in fade-in duration-200 flex flex-col justify-between sm:justify-start">
        
        <div>
          {/* Top Teal Accent Bar */}
          <div className="bg-[#004E64] p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-6 h-6 text-[#FF6B35]" />
            </div>

            <h3 className="font-bold text-lg">RoamX Admin Section Portal</h3>
            <p className="text-xs text-blue-100 mt-1">
              Restricted authentication gate for site administrators & owners
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-orange-50/80 border-b border-orange-100 px-6 py-2.5 flex items-center gap-2 text-xs text-orange-900 font-medium">
            <Shield className="w-4 h-4 text-[#FF6B35] shrink-0" />
            <span>Access is strictly restricted to verified RoamX owners.</span>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Authentication Failed</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Authorized Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@roamx.com"
                className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004E64]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  Admin Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#004E64] hover:underline cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004E64]"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#004E64] hover:bg-[#003d4d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#FF6B35]" />
                  <span>Verify & Open Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center text-[11px] text-gray-500">
          Protected RoamX Administrative System. Authorized Personnel Only.
        </div>
      </div>
    </div>
  );
};
