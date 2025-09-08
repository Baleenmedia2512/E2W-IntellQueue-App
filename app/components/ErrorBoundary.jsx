'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to a reporting service here
    if (typeof window !== 'undefined') {
      console.log('Error occurred in mobile app:', {
        error: error.toString(),
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ color: '#f69435', marginBottom: '20px' }}>
              IntellQueue
            </h2>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>
              Something went wrong
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              The app encountered an unexpected error. Please try restarting the app.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              style={{
                backgroundColor: '#f69435',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Restart App
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details (Development)
                </summary>
                <pre style={{
                  backgroundColor: '#f0f0f0',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '10px'
                }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
