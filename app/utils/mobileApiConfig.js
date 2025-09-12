// Mobile-specific API configuration and error handling
import axios from 'axios';

let Capacitor = null;
let Network = null;

async function ensureCapacitorCore() {
    if (!Capacitor && typeof window !== 'undefined') {
        try {
            const mod = await import('@capacitor/core');
            Capacitor = mod.Capacitor;
        } catch {
            Capacitor = null;
        }
    }
    return Capacitor;
}

async function ensureNetwork() {
    if (!Network && typeof window !== 'undefined') {
        try {
            const mod = await import('@capacitor/network');
            Network = mod.Network;
        } catch {
            Network = null;
        }
    }
    return Network;
}

// Enhanced API instance for mobile with better error handling
export const mobileApi = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Media/",
    timeout: 10000, // 10 second timeout for mobile
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

// Network status checking
export class NetworkChecker {
    static async checkConnectivity() {
        const cap = await ensureCapacitorCore();
        if (!cap || !cap.isNativePlatform()) {
            return navigator.onLine;
        }
        
        try {
            const net = await ensureNetwork();
            if (!net) return navigator.onLine;
            const status = await net.getStatus();
            return status.connected;
        } catch (error) {
            console.error('Error checking network status:', error);
            return navigator.onLine; // Fallback to web API
        }
    }
    
    static async waitForConnection(maxWait = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (await this.checkConnectivity()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return false;
    }
}

// Enhanced request interceptor for mobile
mobileApi.interceptors.request.use(
    async (config) => {
        console.log('Making API request:', config.url);
        
        // Check network connectivity before making request
        const isConnected = await NetworkChecker.checkConnectivity();
        
        if (!isConnected) {
            console.warn('No network connection detected');
            throw new Error('No network connection available');
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Enhanced response interceptor
mobileApi.interceptors.response.use(
    (response) => {
        console.log('API response received:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.error('API response error:', error);
        
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            console.error('Network error detected, checking connectivity...');
            
            const isConnected = await NetworkChecker.checkConnectivity();
            if (!isConnected) {
                throw new Error('Network connection lost. Please check your internet connection.');
            }
        }
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
        }
        
        return Promise.reject(error);
    }
);

// Safe API wrapper function
export const safeMobileApiCall = async (apiFunction, ...args) => {
    try {
        // Wait for network connection if needed
        const hasConnection = await NetworkChecker.waitForConnection();
        
        if (!hasConnection) {
            throw new Error('Unable to connect to the internet. Please check your connection and try again.');
        }
        
        return await apiFunction(...args);
    } catch (error) {
        console.error('Safe API call error:', error);
        
        // Return a user-friendly error message
        if (error.message.includes('Network') || error.message.includes('connection')) {
            throw new Error('Network connection issue. Please check your internet and try again.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Request timed out. Please try again.');
        } else {
            throw new Error('An error occurred while loading data. Please try again.');
        }
    }
};
