import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthGateProps {
  onSuccess: () => void;
}

const AUTH_TOKEN_KEY = 'clip_memo_auth_token';

export const checkAuthToken = async (): Promise<boolean> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  try {
    const response = await fetch(`/api/auth?token=${encodeURIComponent(token)}`);
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
};

export const saveAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const AuthGate: React.FC<AuthGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        saveAuthToken(data.token);
        onSuccess();
      } else {
        setError('密码错误');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setError('验证失败，请重试');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
      {/* Frosted glass card */}
      <div 
        className={`
          relative w-full max-w-sm mx-4 p-8 
          bg-white/80 backdrop-blur-xl 
          rounded-3xl shadow-2xl shadow-stone-300/50
          border border-white/50
          transition-transform duration-100
          ${shake ? 'animate-shake' : ''}
        `}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-stone-800 mb-2">
          Clip Memo
        </h1>
        <p className="text-sm text-center text-stone-500 mb-8">
          请输入访问密码
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              autoFocus
              className={`
                w-full px-4 py-3 pr-12
                bg-white/60 backdrop-blur
                border-2 rounded-xl
                text-stone-800 placeholder-stone-400
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent
                ${error ? 'border-red-400' : 'border-stone-200'}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center animate-in fade-in duration-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className={`
              w-full py-3 px-4
              bg-gradient-to-r from-stone-700 to-stone-800
              hover:from-stone-800 hover:to-stone-900
              text-white font-medium rounded-xl
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              shadow-lg shadow-stone-300/50
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                验证中...
              </>
            ) : (
              '确认'
            )}
          </button>
        </form>
      </div>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthGate;
