// NotificationManager.js
// Handles in-app and browser notifications, and cross-tab communication
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';

let channel;
if (typeof window !== 'undefined') {
  channel = new BroadcastChannel('global_notifications');
}

// Context for global notification usage
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timeoutRefs = useRef([]);

  // Listen for cross-tab notifications
  useEffect(() => {
    if (!channel) return;
    const handler = (event) => {
      if (event.data?.type === 'GLOBAL_NOTIFICATION') {
        addNotification(event.data.payload);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, []);

  // Add notification (with optional browser notification)
  function addNotification({ message, title = 'Notification', icon, showBrowser = true, duration = 3500 }) {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, title, icon }]);
    // Remove after duration
    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
    timeoutRefs.current.push(timeout);
    // Browser notification
    if (showBrowser && typeof window !== 'undefined' && window.Notification) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body: message, icon });
          }
        });
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Expose context
  const contextValue = {
    notify: (payload) => {
      // Send to all tabs
      if (channel) channel.postMessage({ type: 'GLOBAL_NOTIFICATION', payload });
      addNotification(payload);
    }
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToasts notifications={notifications} />
    </NotificationContext.Provider>
  );
}

export function useGlobalNotification() {
  return useContext(NotificationContext);
}

// Minimal, modern toast UI
function NotificationToasts({ notifications }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      pointerEvents: 'none',
    }}>
      {notifications.map(({ id, message, title, icon }) => (
        <div
          key={id}
          style={{
            minWidth: 260,
            maxWidth: 340,
            background: 'rgba(30,41,59,0.95)',
            color: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            fontFamily: 'Inter, sans-serif',
            pointerEvents: 'auto',
            border: '1px solid #334155',
            animation: 'fadeInUp 0.4s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="icon" style={{ width: 28, height: 28, borderRadius: 6, marginRight: 8 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 14, opacity: 0.92 }}>{message}</div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// For legacy usage (direct call, e.g. sendQueueNotification)
export function sendQueueNotification({ name, rateCard, rateType }) {
  const message = `${name} - ${rateCard} - ${rateType} is now In-Progress`;
  if (channel) channel.postMessage({ type: 'GLOBAL_NOTIFICATION', payload: { message, title: 'Queue Update' } });
  // Also show in this tab
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('queue-toast', { detail: { message, title: 'Queue Update' } }));
  }
  // Browser notification
  if (typeof window !== 'undefined' && window.Notification) {
    if (Notification.permission === 'granted') {
      new Notification('Queue Update', { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Queue Update', { body: message });
        }
      });
    }
  }
}

// For backward compatibility
export function useQueueNotificationListener(showInAppNotification) {
  useEffect(() => {
    if (!channel) return;
    const handler = (event) => {
      if (event.data?.type === 'GLOBAL_NOTIFICATION') {
        showInAppNotification(event.data.payload.message);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, [showInAppNotification]);
}
