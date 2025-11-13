import { motion } from 'framer-motion'

function AboutUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const teamMembers = [
    {
      name: "AI Research Team",
      role: "Machine Learning Engineers",
      icon: "🤖",
      description: "Developing cutting-edge AI models for misinformation detection"
    },
    {
      name: "Community Team",
      role: "Community Managers",
      icon: "👥",
      description: "Building trust and engagement within our user community"
    },
    {
      name: "Security Team",
      role: "Cybersecurity Experts",
      icon: "🔒",
      description: "Ensuring platform security and data protection"
    },
    {
      name: "Product Team",
      role: "Product Designers",
      icon: "🎨",
      description: "Creating intuitive and accessible user experiences"
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card content-box p-12 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6">
              <span className="text-6xl">👥</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              About{' '}
              <span className="text-info">
                FactSaura
              </span>
            </h1>
            <p className="text-secondary text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              We're a team of passionate technologists, researchers, and community builders dedicated to fighting misinformation through transparent AI and community trust.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Our Mission
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">Fighting Misinformation</h3>
              <p className="text-secondary text-lg leading-relaxed mb-6">
                In an era where information spreads faster than ever, we believe everyone deserves access to accurate, verified information. FactSaura combines advanced AI technology with community wisdom to create a transparent, trustworthy platform for information verification.
              </p>
              <p className="text-secondary text-lg leading-relaxed">
                Our AI doesn't just give you answers - it shows you how it thinks, provides confidence scores, and invites community discussion to build collective trust in the information we consume.
              </p>
            </div>
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="text-8xl mb-4"
              >
                🎯
              </motion.div>
              <div className="glass-card crisis-safe p-6">
                <h4 className="text-xl font-bold text-primary mb-2">Our Goal</h4>
                <p className="text-secondary">
                  Create a world where misinformation is detected and countered in real-time, protecting communities from harmful false information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Our Team
          </h2>
          <p className="text-secondary text-lg">
            Meet the dedicated professionals behind FactSaura
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card crisis-medium p-6 h-full text-center">
                <div className="text-4xl mb-4">{member.icon}</div>
                <h3 className="text-primary font-bold text-lg mb-2">{member.name}</h3>
                <p className="text-info font-medium text-sm mb-3">{member.role}</p>
                <p className="text-secondary text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-primary mb-3">Transparency</h3>
              <p className="text-secondary leading-relaxed">
                We believe in open AI that shows its reasoning, not black boxes that hide their decision-making process.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-primary mb-3">Community</h3>
              <p className="text-secondary leading-relaxed">
                Technology alone isn't enough. We combine AI insights with human wisdom and community verification.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-primary mb-3">Speed</h3>
              <p className="text-secondary leading-relaxed">
                Misinformation spreads fast. Our real-time detection and alert systems help communities respond quickly.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card crisis-info p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Join Our Mission
          </h2>
          <p className="text-secondary text-lg mb-6 max-w-2xl mx-auto">
            Whether you're a researcher, developer, fact-checker, or someone who cares about information integrity, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button px-6 py-3 rounded-lg font-medium"
            >
              📧 Contact Us
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button-outlined px-6 py-3 rounded-lg font-medium"
            >
              🚀 Contribute
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AboutUs