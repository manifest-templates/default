import { useState, useEffect } from 'react'
import Loading from './Loading'
import LoginRequired from './LoginRequired'
import PaymentRequired from './PaymentRequired'
import SubscriptionRequired from './SubscriptionRequired'
import { API_BASE_URL } from '../../../utils/apiConfig'

const appId = import.meta.env.VITE_APP_ID;

function Monetization({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState('open') // 'open', 'login_required', 'payment_required', 'subscription_required'
  const [config, setConfig] = useState(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const userResponse = await fetch(`${API_BASE_URL}/apps/${appId}/me`, {
          credentials: 'include'
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.appId === appId) {
            setUserData(userData)
            setIsUserLoggedIn(true)
          } else {
            setUserData(null)
            setIsUserLoggedIn(false)
          }
        } else {
          setUserData(null)
          setIsUserLoggedIn(false)
        }
      } catch (error) {
        console.error('Error checking user login status:', error)
        setUserData(null)
        setIsUserLoggedIn(false)
      }
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/apps/${appId}/config`, {
          credentials: 'include'
        })
        const configData = await response.json()

        console.log('configData',configData);
        
        console.log('config.monetization.type', configData.monetization?.type)
        
        setConfig(configData)
        setState(configData.monetization?.type || 'open')
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching config:', error)
        // Fallback to open state if config fetch fails
        setState('open')
        setIsLoading(false)
      }
    }

    const initializeComponent = async () => {
      await checkUserLogin()
      await fetchConfig()
    }

    // Listen for authentication events from popup
    const handleAuthMessage = (event) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        // Re-check user login status when popup auth succeeds
        checkUserLogin()
      }
    }

    window.addEventListener('message', handleAuthMessage)
    initializeComponent()

    // Cleanup event listener
    return () => {
      window.removeEventListener('message', handleAuthMessage)
    }
  }, [])

  if (isLoading) {
    return <Loading />
  }
  
  // Handle different states
  switch (state) {
    
    case 'login_required':
      // If user is already logged in, show children; otherwise show login required
      return isUserLoggedIn ? <>{children}</> : <LoginRequired />

    case 'payment_required':
      // If user is not logged in, show login required
      if (!isUserLoggedIn) {
        return <LoginRequired />
      }
      // If user is logged in, check billing status
      if (!userData || userData.billingStatus !== 'current') {
        console.log('userData.billingStatus is not current', userData.billingStatus)
        return <PaymentRequired />
      }
      // If billingStatus is 'current', show children
      console.log('userData.billingStatus is current')
      return <>{children}</>

    case 'subscription_required':
      return <SubscriptionRequired>{children}</SubscriptionRequired>

    case 'open':
    default:
      console.log('state is open')
      // Show the original content
      return <>{children}</>
  }
}

export default Monetization 