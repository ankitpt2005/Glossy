import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, getNotificationPermissionState } from '../services/browser_notifications';
import { Bell } from 'lucide-react';

export const NotificationBanner = () => {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    setPermission(getNotificationPermissionState());
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  if (permission === 'granted' || permission === 'unsupported') {
    return null;
  }

  return (
    <div className="notification-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bell size={16} color="#DDEBE5" />
        <p>Enable Browser Notifications to get real-time OS alerts for important emails while away.</p>
      </div>
      <button className="btn-enable-notify" onClick={handleEnable}>
        Enable Notifications
      </button>
    </div>
  );
};
