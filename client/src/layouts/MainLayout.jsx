import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import NotificationBar from '../components/NotificationBar'
import { useAuth } from '../context/AuthContext'

const MainLayout = ({ children }) => {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const desktopSidebarPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Ignore fullscreen API errors to keep UI responsive.
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    const handleKeydown = (event) => {
      if (!event.shiftKey || event.repeat) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'f') {
        event.preventDefault()
        toggleFullscreen()
      }

      if (key === 's') {
        event.preventDefault()
        window.dispatchEvent(new Event('focus-global-search'))
      }

      if (key === 'b') {
        event.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  return (
    <div className={`flex min-h-screen bg-gray-100 ${desktopSidebarPadding}`}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        onLogout={logout}
      />
      <NotificationBar />
      
      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout