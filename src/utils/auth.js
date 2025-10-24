import { API_BASE_URL } from '../../utils/apiConfig'

const appId = import.meta.env.VITE_APP_ID;

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/apps/${appId}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.ok) {
      // Optionally reload the page to reset the app state
      window.location.reload()
    } else {
      console.error('Logout failed:', response.status)
    }
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

export const goToBillingPortal = () => {
  const currentUrl = window.location.href
  window.location.href = `${API_BASE_URL}/apps/${appId}/stripe/portal?returnUrl=${encodeURIComponent(currentUrl)}`
}