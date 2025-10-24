import { useState, useEffect } from 'react'
import { Button, Typography, Space } from 'antd'
import { API_BASE_URL } from '../../../utils/apiConfig'

const { Title, Paragraph } = Typography

const appId = import.meta.env.VITE_APP_ID;

function LoginRequired() {
    const openGoogleLoginInPopup = window.location.href.includes('fly.dev')

    const handleGoogleLogin = () => {
        if (openGoogleLoginInPopup) {
            // Create the callback URL - use current URL structure to maintain path when in iframe
            const currentUrl = window.location.href
            const callbackUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + 'auth-callback.html'
            const authUrl = `${API_BASE_URL}/auth/google?appId=${appId}&redirectUrl=${encodeURIComponent(callbackUrl)}`
            
            const popup = window.open(
                authUrl,
                'googleLogin',
                'width=500,height=600,scrollbars=yes,resizable=yes,top=' + (window.screenY + 100) + ',left=' + (window.screenX + 100)
            )
            
            // Listen for messages from popup
            const handleMessage = (event) => {
                console.log('Received message:', event.data)
                if (event.origin !== window.location.origin) return
                
                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    console.log('Auth success - reloading page')
                    // Authentication successful, clean up and reload
                    popup.close()
                    window.removeEventListener('message', handleMessage)
                    clearInterval(checkClosed)
                    // Small delay to ensure popup is closed before reload
                    setTimeout(() => {
                        window.location.reload()
                    }, 100)
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    console.log('Auth error')
                    // Handle authentication error
                    popup.close()
                    window.removeEventListener('message', handleMessage)
                    clearInterval(checkClosed)
                }
            }
            
            window.addEventListener('message', handleMessage)
            
            // Fallback: if popup is closed manually, check auth status and clean up
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    console.log('Popup closed - checking auth status')
                    clearInterval(checkClosed)
                    window.removeEventListener('message', handleMessage)
                    // Check if auth succeeded even if we didn't get the message
                    setTimeout(() => {
                        console.log('Reloading page after popup close')
                        window.location.reload()
                    }, 1000)
                }
            }, 1000)
        } else {
            const currentUrl = encodeURIComponent(window.location.href)
            window.location.href = `${API_BASE_URL}/auth/google?appId=${appId}&redirectUrl=${currentUrl}`
        }
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)', 
            display: 'grid',
            placeItems: 'center',
            position: 'relative'
        }}>
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
                @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
            `}</style>

            <header style={{ 
                position: 'absolute', 
                top: 0,
                left: 20,
                right: 20,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>
                    Your Company
                </Title>
                <Button 
                    onClick={handleGoogleLogin}
                    style={{ 
                        fontWeight: '600',
                        fontSize: 'clamp(13px, 1.5vw, 16px)',
                        padding: 'clamp(4px, 1vw, 8px) clamp(12px, 2vw, 24px)',
                        height: 'clamp(32px, 4vw, 40px)',
                        background: 'transparent', 
                        color: 'white', 
                        border: 'none' 
                    }}
                >
                    Login
                </Button>
            </header>

            <div style={{
                position: 'absolute',
                width: 'min(600px, 90vw)',
                height: 'min(600px, 90vw)',
                background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite'
            }} />

            <Space direction="vertical" align="center" style={{ textAlign: 'center', zIndex: 1, padding: '20px' }}>
                <Title style={{ 
                    fontSize: 'clamp(40px, 10vw, 72px)', 
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient 8s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    lineHeight: 1.1
                }}>
                    Build Something<br />Amazing
                </Title>
                
                <Paragraph style={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontSize: 'clamp(18px, 3vw, 24px)',
                    maxWidth: '700px',
                    margin: '20px 0 40px'
                }}>
                    Transform your ideas into reality with our innovative platform designed to help you launch and scale your next big venture.
                </Paragraph>
                
                <Button 
                    type="primary" 
                    size="large"
                    onClick={handleGoogleLogin}
                    style={{ 
                        height: 'clamp(48px, 8vw, 60px)', 
                        fontSize: 'clamp(16px, 3vw, 20px)', 
                        padding: '0 clamp(30px, 5vw, 50px)',
                        boxShadow: '0 10px 30px rgba(24, 144, 255, 0.4)',
                        transition: 'transform 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Log in with Google
                </Button>
            </Space>
        </div>
    )
}

export default LoginRequired