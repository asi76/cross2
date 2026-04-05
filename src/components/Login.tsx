import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Loader2, X, Send, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  isPendingUser?: boolean;
  pendingEmail?: string;
}

export const Login = ({ isPendingUser, pendingEmail }: LoginProps) => {
  const { signIn, loading } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleRequestAccess = () => {
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (requestEmail.trim() && requestMessage.trim()) {
      // Save pending request to Firestore BEFORE auth
      await signIn(requestEmail, requestMessage);
      setShowRequestModal(false);
      setRequestEmail('');
      setRequestMessage('');
    }
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setRequestEmail('');
    setRequestMessage('');
  };

  const handleContactAdmin = () => {
    if (pendingEmail) {
      setRequestEmail(pendingEmail);
    }
    setShowRequestModal(true);
  };

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="app-topbar flex items-center gap-3 rounded-[28px] px-4 py-4">
            <Dumbbell className="w-6 h-6 text-lime-300" />
            <h1 className="display-font text-2xl uppercase text-white">Crossplanner</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-panel rounded-[32px] p-8">
            <div className="section-kicker mb-3">Modern Fitness UI</div>
            <h2 className="display-font text-5xl uppercase leading-[0.9] text-white">
              Pianifica, salva e lancia workout con un impatto piu deciso.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Una dashboard pensata per energia, ritmo e chiarezza operativa: schede, libreria esercizi e sessione live.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Focus</div>
                <div className="display-font text-3xl text-white">3</div>
              </div>
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Flow</div>
                <div className="display-font text-3xl text-white">Fast</div>
              </div>
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Style</div>
                <div className="display-font text-3xl text-white">Fit</div>
              </div>
            </div>
          </div>

          <div className="energy-panel rounded-[32px] p-8">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="rounded-full border border-white/10 bg-white/5 p-4 mb-4"
            >
              <Dumbbell className="w-12 h-12 text-orange-300" />
            </motion.div>
            <h1 className="display-font text-4xl uppercase text-white mb-2">Crossplanner</h1>
            <p className="text-slate-400 text-center">Accedi per entrare nella tua area workout.</p>
          </div>

          {isPendingUser ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4"
            >
              <p className="text-yellow-500 text-center text-sm">
                Your account is not yet enabled.
              </p>
              <p className="text-gray-400 text-center text-sm mt-2">
                Contact the administrator to request access.
              </p>
              <button
                onClick={handleContactAdmin}
                className="w-full mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/15 px-4 py-2 text-yellow-200 font-medium flex items-center justify-center gap-2 transition-colors hover:bg-yellow-400/20"
              >
                <Send className="w-4 h-4" />
                Contact Administrator
              </button>
            </motion.div>
          ) : null}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-gray-800 font-semibold flex items-center justify-center gap-3 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <button
            onClick={handleRequestAccess}
            className="btn-secondary w-full mt-4 rounded-xl px-4 py-3 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Request Access
          </button>

          <p className="text-white/35 text-xs text-center mt-6">
            Only approved Google accounts can access this app
          </p>
          </div>
        </div>
      </motion.div>

      {/* Request Access Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="energy-panel rounded-[28px] p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-300" />
                  Request Access
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="glass-btn p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 mb-4">
                Write a message to the administrator explaining why you should have access to the Crossplanner app.
              </p>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Your Google Email</label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="input-shell w-full rounded-xl p-4"
                />
              </div>

              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi, I would like to request access to the Crossplanner app because..."
                className="input-shell mb-4 h-32 w-full resize-none rounded-xl p-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1 rounded-xl py-3 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!requestEmail.trim() || !requestMessage.trim() || loading}
                  className="btn-primary flex-1 rounded-xl py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
