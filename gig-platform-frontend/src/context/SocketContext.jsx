import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL, getNotifications } from '../services/api';

const SocketContext = createContext(null);
// The socket server lives on the same host as the API, just without the /api suffix.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL.replace(/\/api$/, '');

export const SocketProvider = ({ children }) => {
    const { token, user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            return [];
        }

        setNotificationsLoading(true);
        try {
            const { data } = await getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
            return data || [];
        } finally {
            setNotificationsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!token || !user?._id) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setSocket(null);
            setConnected(false);
            setNotifications([]);
            return undefined;
        }

        const nextSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = nextSocket;
        setSocket(nextSocket);

        nextSocket.on('connect', () => setConnected(true));
        nextSocket.on('disconnect', () => setConnected(false));
        nextSocket.on('notification:new', (notification) => {
            setNotifications((prev) => [notification, ...prev.filter((item) => item._id !== notification._id)]);
        });
        nextSocket.on('notification:updated', (notification) => {
            setNotifications((prev) => prev.map((item) => (item._id === notification._id ? notification : item)));
        });

        refreshNotifications();

        return () => {
            nextSocket.off('connect');
            nextSocket.off('disconnect');
            nextSocket.off('notification:new');
            nextSocket.off('notification:updated');
            nextSocket.disconnect();
        };
    }, [token, user?._id, refreshNotifications]);

    const joinGigRoom = useCallback((gigId) => {
        if (!socket || !gigId) return;
        socket.emit('join:gig', { gigId });
    }, [socket]);

    const leaveGigRoom = useCallback((gigId) => {
        if (!socket || !gigId) return;
        socket.emit('leave:gig', { gigId });
    }, [socket]);

    const value = useMemo(() => ({
        socket,
        connected,
        notifications,
        setNotifications,
        notificationsLoading,
        refreshNotifications,
        joinGigRoom,
        leaveGigRoom,
    }), [socket, connected, notifications, notificationsLoading, refreshNotifications, joinGigRoom, leaveGigRoom]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used within SocketProvider');
    return ctx;
};
