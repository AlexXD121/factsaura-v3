import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Layout({ children, className = '' }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [aiStatus, setAiStatus] = useState('active') // active, monitoring, offline
    const [alertCount, setAlertCount] = useState(0)
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const location = useLocation()

    const navigation = [
        { name: 'Feed', href: '/', icon: '🏠', badge: alertCount > 0 ? alertCount : null },
        { name: 'Submit', href: '/submit', icon: '📝' },
        { name: 'Family Tree', href: '/family-tree', icon: '🧬' },
        { name: 'About', href: '/about', icon: 'ℹ️' },
        { name: 'About Us', href: '/about-us', icon: '👥' }
    ]

    // Simulate real-time AI monitoring status
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date())
            
            // Simulate occasional alerts
            if (Math.random() < 0.1) {
                setAlertCount(prev => prev + 1)
            }
            
            // Simulate AI status changes
            if (Math.random() < 0.05) {
                const statuses = ['active', 'monitoring', 'offline']
                const currentIndex = statuses.indexOf(aiStatus)
                const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                setAiStatus(nextStatus)
            }
        }, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [aiStatus])

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className={`min-h-screen flex flex-col ${className}`}>
            {/* Header - Trust Pattern */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/50 shadow-lg"
                style={{ 
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
                    borderImage: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent) 1'
                }}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-24">
                        {/* Enhanced Logo with AI Status */}
                        <Link to="/" className="flex items-center space-x-4 group">
                            <motion.div
                                whileHover={{ 
                                    scale: 1.15, 
                                    rotate: [0, -5, 5, 0],
                                    filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="text-3xl relative p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                                transition={{ duration: 0.3 }}
                            >
                                <span className="text-white">🔍</span>
                                {/* AI Status Indicator */}
                                <motion.div
                                    animate={{ 
                                        scale: aiStatus === 'active' ? [1, 1.3, 1] : 1,
                                        opacity: aiStatus === 'offline' ? 0.5 : 1
                                    }}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: aiStatus === 'active' ? Infinity : 0 
                                    }}
                                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                                        aiStatus === 'active' ? 'bg-green-500' :
                                        aiStatus === 'monitoring' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                />
                            </motion.div>
                            <div className="flex flex-col">
                                <motion.h1
                                    whileHover={{ 
                                        scale: 1.05,
                                        background: "linear-gradient(45deg, #3B82F6, #8B5CF6)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                    className="text-3xl font-black text-primary tracking-tight"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    FactSaura
                                </motion.h1>
                                <motion.span 
                                    className="text-sm text-secondary font-medium hidden sm:block"
                                    whileHover={{ color: "#3B82F6" }}
                                >
                                    AI {aiStatus === 'active' ? 'Monitoring' : aiStatus === 'monitoring' ? 'Scanning' : 'Offline'} • Real-time Detection
                                </motion.span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-2">
                            {navigation.map((item) => (
                                <Link key={item.name} to={item.href}>
                                    <motion.div
                                        whileHover={{ 
                                            scale: 1.05,
                                            y: -2,
                                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                      px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                      flex items-center space-x-2 relative group cursor-pointer
                      backdrop-blur-sm border
                      ${isActive(item.href)
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                                                : 'text-secondary hover:text-white bg-white/70 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border-gray-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25'
                                            }
                    `}
                                    >
                                        <motion.span 
                                            className="text-base"
                                            whileHover={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {item.icon}
                                        </motion.span>
                                        <span className="relative">
                                            {item.name}
                                            {/* Cool underline effect */}
                                            <motion.div
                                                className="absolute -bottom-1 left-0 h-0.5 bg-white rounded-full"
                                                initial={{ width: 0 }}
                                                whileHover={{ width: "100%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </span>
                                        {item.badge && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                                className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                                            >
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>

                        {/* Enhanced Mobile menu button */}
                        <motion.button
                            whileHover={{ 
                                scale: 1.1,
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400 transition-all duration-300"
                        >
                            <motion.div
                                animate={{ 
                                    rotate: isMobileMenuOpen ? 180 : 0,
                                    scale: isMobileMenuOpen ? 1.1 : 1
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="text-lg font-bold"
                            >
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </motion.div>
                        </motion.button>
                    </div>

                    {/* Mobile Navigation */}
                    <motion.div
                        initial={false}
                        animate={{
                            height: isMobileMenuOpen ? 'auto' : 0,
                            opacity: isMobileMenuOpen ? 1 : 0
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden overflow-hidden"
                    >
                        <div className="py-4 space-y-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ 
                                            scale: 1.02, 
                                            x: 8,
                                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                      px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-300
                      flex items-center space-x-4 relative backdrop-blur-sm border
                      ${isActive(item.href)
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg'
                                                : 'text-secondary hover:text-white bg-white/70 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border-gray-200 hover:border-blue-400'
                                            }
                    `}
                                    >
                                        <motion.span 
                                            className="text-xl"
                                            whileHover={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {item.icon}
                                        </motion.span>
                                        <span className="flex-1">{item.name}</span>
                                        {item.badge && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                                className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                                            >
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.header>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
            >
                {children}
            </motion.main>

            {/* Footer - Trust Pattern */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t border-gray-200 bg-white/80 backdrop-blur-md"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-2 text-secondary">
                            <span>🤖</span>
                            <span className="text-sm">
                                Powered by AI • Fighting misinformation with transparency
                            </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-secondary">
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                href="#"
                                className="hover:text-primary transition-colors"
                            >
                                Privacy
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                href="#"
                                className="hover:text-primary transition-colors"
                            >
                                Terms
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                href="#"
                                className="hover:text-primary transition-colors"
                            >
                                Contact
                            </motion.a>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}

export default Layout