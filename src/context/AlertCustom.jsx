import { createContext, useContext, useState, useCallback } from 'react';
import './AlertCustom.css';

const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: 'Подтверждение',
    message: '',
    onConfirm: null,
  });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const confirm = useCallback((message, onConfirm, title = 'Подтверждение') => {
    setConfirmState({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, open: false }));
      },
    });
  }, []);

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirm }}>
      {children}
      <ToastContainer toasts={toasts} />
      <ConfirmDialog
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={closeConfirm}
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="custom-toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`custom-toast custom-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="form-actions confirm-actions">
          <button className="btn btn-primary confirm-yes" onClick={onConfirm}>Yes</button>
          <button className="btn btn-secondary confirm-no" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}