import { useState, useEffect } from 'react';
import { Notification } from '../types';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem(`stackit_notifications_${userId}`);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    setLoading(false);
  }, [userId]);

  const saveNotifications = (newNotifications: Notification[]) => {
    if (!userId) return;
    setNotifications(newNotifications);
    localStorage.setItem(`stackit_notifications_${userId}`, JSON.stringify(newNotifications));
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notification,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updatedNotifications);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
};