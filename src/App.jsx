import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Monetization from './components/monetization/Monetization'
import SimpleLayout from './components/SimpleLayout'
import Home from './components/Home'
import { ThemeProvider } from './contexts/ThemeContext'
import { getRouterBasename } from './utils/routerUtils'

function App() {

  return (
    <ThemeProvider>
      <Monetization>
        <Router basename={getRouterBasename()}>
          <SimpleLayout>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </SimpleLayout>
        </Router>
      </Monetization>
    </ThemeProvider>
  )
}

export default App