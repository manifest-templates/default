import { Typography } from 'antd'
import { useTheme } from '../contexts/ThemeContext'
import defaultPlaceholder from '../assets/default-placeholder.svg'

const { Title, Paragraph } = Typography

function Home() {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8">
          <img
            src={defaultPlaceholder}
            alt="Build your app"
            className="w-64 h-auto mx-auto mb-6"
          />
        </div>

        <Title
          level={1}
          className="text-center mb-6"
          style={{
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            fontSize: '2rem'
          }}
        >
          What would you like to build today?
        </Title>

        <Paragraph
          className="text-center mb-6"
          style={{
            color: isDarkMode ? '#d1d5db' : '#4b5563',
            fontSize: '1.5rem'
          }}
        >
          Start typing to build your app.
        </Paragraph>
      </div>
    </div>
  )
}

export default Home