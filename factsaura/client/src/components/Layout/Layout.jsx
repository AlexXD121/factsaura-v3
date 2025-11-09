import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Layout({ children, className = '' }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navigation = [
        { name: 'Feed', href: '/', icon: '🏠' },
        { name: 'Submit', href: '/submit', icon: '📝' },
        { name: 'About', href: '/about', icon: 'ℹ️' }
    ]

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className={`min-h-screen flex flex-col ${className}`}>
            {/* Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-2xl"
                            >
                                🔍
                            </motion.div>
                            <motion.h1
                                whileHover={{ scale: 1.05 }}
                                className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                            >
                                FactSaura
                            </motion.h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigation.map((item) => (
                                <Link key={item.name} to={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center space-x-2
                      ${isActive(item.href)
                                                ? 'bg-white/20 text-white border border-white/30'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }
                    `}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile menu button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            <motion.div
                                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
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
                        <div className="py-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                      px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center space-x-3
                      ${isActive(item.href)
                                                ? 'bg-white/20 text-white border border-white/30'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }
                    `}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.name}</span>
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

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t border-white/10 bg-black/20 backdrop-blur-md"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-2 text-white/60">
                            <span>🤖</span>
                            <span className="text-sm">
                                Powered by AI • Fighting misinformation in real-time
                            </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-white/60">
                            <motion.a
                                whileHover={{ scale: 1.05, color: '#ffffff' }}
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Privacy
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.05, color: '#ffffff' }}
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Terms
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.05, color: '#ffffff' }}
                                href="#"
                                className="hover:text-white transition-colors"
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