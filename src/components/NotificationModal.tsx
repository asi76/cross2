import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'alert' | 'confirm' | 'success';

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const LISTENER_EVENT = 'jarvis-notification';

export function showNotification(data: NotificationData) {
  window.dispatchEvent(new CustomEvent(LISTENER_EVENT, { detail: data }));
}

export function NotificationModal() {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationData>;
      setNotification(customEvent.detail);
    };
    window.addEventListener(LISTENER_EVENT, handler);
    return () => window.removeEventListener(LISTENER_EVENT, handler);
  }, []);

  const handleClose = useCallback(() => {
    notification?.onCancel?.();
    setNotification(null);
  }, [notification]);

  const handleConfirm = useCallback(() => {
    notification?.onConfirm?.();
    setNotification(null);
  }, [notification]);

  if (!notification) return null;

  const Icon = notification.type === 'alert' ? AlertCircle : notification.type === 'success' ? CheckCircle : Info;
  const iconColor = notification.type === 'alert' ? 'text-red-400' : notification.type === 'success' ? 'text-green-400' : 'text-blue-400';
  const bgColor = notification.type === 'alert' ? 'bg-red-500/20' : notification.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20';

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="modal-shell w-full max-w-md overflow-hidden rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`${bgColor} rounded-xl p-2`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h2 className="display-font text-2xl uppercase text-white">{notification.title}</h2>
          </div>
          {notification.type === 'alert' && (
            <button
              onClick={handleClose}
              className="glass-btn rounded-xl p-2 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          )}
        </div>
        <div className="p-5">
          <p className="text-zinc-300 whitespace-pre-wrap leading-6">{notification.message}</p>
        </div>
        <div className="modal-footer flex justify-end gap-3 px-5 py-4">
          {notification.type === 'confirm' && (
            <button
              onClick={handleClose}
              className="btn-secondary rounded-xl px-4 py-2 font-medium transition-colors"
            >
              {notification.cancelText || 'Annulla'}
            </button>
          )}
          <button
            onClick={notification.type === 'confirm' ? handleConfirm : handleClose}
            className={`px-4 py-2 font-medium rounded-xl transition-colors ${
              notification.type === 'alert'
                ? 'btn-danger'
                : 'btn-primary'
            }`}
          >
            {notification.type === 'confirm' ? (notification.confirmText || 'Conferma') : 'Chiudi'}
          </button>
        </div>
      </div>
    </div>
  );
}
