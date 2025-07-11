'use client';

// Fixed Cognito environment variables for Amplify deployment
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Download, User, Camera, Zap, Shield, Database, Settings, Smartphone } from 'lucide-react';
import Image from 'next/image';
import LoginModal from './components/auth/LoginModal';
import CreateForm from './create/components/CreateForm';
import { useAuth } from './contexts/AuthContext';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Background Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
      
      {/* Corner Gradient Effects */}
      <div className="absolute inset-0">
        {/* Top Left Corner */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-gentle-pulse-1"
          style={{
            background: 'radial-gradient(circle, rgba(125, 211, 252, 0.4) 0%, rgba(186, 230, 253, 0.2) 40%, transparent 70%)'
          }}
        ></div>
        
        {/* Top Right Corner */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-gentle-pulse-3"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, rgba(191, 219, 254, 0.2) 40%, transparent 70%)'
          }}
        ></div>
        
        {/* Bottom Left Corner */}
        <div 
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-gentle-pulse-4"
          style={{
            background: 'radial-gradient(circle, rgba(165, 180, 252, 0.4) 0%, rgba(199, 210, 254, 0.2) 40%, transparent 70%)'
          }}
        ></div>
        
        {/* Bottom Right Corner */}
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-gentle-pulse-2"
          style={{
            background: 'radial-gradient(circle, rgba(103, 232, 249, 0.4) 0%, rgba(165, 243, 252, 0.2) 40%, transparent 70%)'
          }}
        ></div>
      </div>
      
      {/* Animated Concentric Rounded Frames */}
      <div className="absolute inset-0 flex items-center justify-center">        
        {/* Layer 2 */}
        <div 
          className="absolute rounded-[5rem] border border-sky-100/35 bg-gradient-to-br from-sky-100/15 to-blue-100/15 animate-gentle-pulse-2"
          style={{
            width: '92vw',
            height: '92vh'
          }}
        ></div>
        
        {/* Layer 3 */}
        <div 
          className="absolute rounded-[4rem] border border-sky-200/40 bg-gradient-to-br from-sky-200/20 to-blue-200/20 animate-gentle-pulse-3"
          style={{
            width: '84vw',
            height: '84vh'
          }}
        ></div>
        
        {/* Layer 4 - Inner frame */}
        <div 
          className="absolute rounded-[3rem] border border-sky-300/45 bg-gradient-to-br from-sky-300/25 to-blue-300/25 animate-gentle-pulse-4"
          style={{
            width: '76vw',
            height: '76vh'
          }}
        ></div>
        
        {/* Central core */}
        <div 
          className="absolute rounded-[2rem] border border-sky-400/50 bg-gradient-to-br from-sky-400/30 to-blue-400/30 animate-gentle-pulse-5"
          style={{
            width: '98vw',
            height: '98vh',
            boxShadow: 'inset 0 0 200px 60px rgba(255, 255, 255, 0.85), 0 0 150px 40px rgba(255, 255, 255, 0.6), 0 0 300px 80px rgba(255, 255, 255, 0.3)'
          }}
        ></div>
      </div>
      
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes gentle-pulse-1 {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.02);
            opacity: 1;
          }
        }
        
        @keyframes gentle-pulse-2 {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: scale(0.98);
            opacity: 0.9;
          }
        }
        
        @keyframes gentle-pulse-3 {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.02);
            opacity: 0.8;
          }
        }
        
        @keyframes gentle-pulse-4 {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: scale(0.98);
            opacity: 0.7;
          }
        }
        
        @keyframes gentle-pulse-5 {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.4;
          }
          50% { 
            transform: scale(1.02);
            opacity: 0.6;
          }
        }
        
        .animate-gentle-pulse-1 {
          animation: gentle-pulse-1 10s ease-in-out infinite;
        }
        
        .animate-gentle-pulse-2 {
          animation: gentle-pulse-2 11s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        .animate-gentle-pulse-3 {
          animation: gentle-pulse-3 12s ease-in-out infinite;
          animation-delay: -4s;
        }
        
        .animate-gentle-pulse-4 {
          animation: gentle-pulse-4 13s ease-in-out infinite;
          animation-delay: -6s;
        }
        
        .animate-gentle-pulse-5 {
          animation: gentle-pulse-5 10s ease-in-out infinite;
          animation-delay: -8s;
        }
      `}</style>
    </div>
  );
};

const LandingPageHeader = ({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkBg, setIsDarkBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollPosition = currentScrollY + window.innerHeight / 2;
      
      // Determine if we're on dark background (how-it-works section)
      const howItWorksElement = document.getElementById('how-it-works');
      const isDark = !!(howItWorksElement && currentScrollY >= howItWorksElement.offsetTop - 100);
      setIsDarkBg(isDark);

      // Header visibility logic
      if (currentScrollY < 100) {
        // Always show header at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else {
        // Scrolling up - show header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      // Active section detection
      if (scrollPosition < window.innerHeight) {
        setActiveSection('hero');
        return;
      }

      const featuresElement = document.getElementById('features');
      const pricingElement = document.getElementById('pricing');

      if (howItWorksElement) {
        const elementTop = howItWorksElement.offsetTop;
        const elementBottom = elementTop + howItWorksElement.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          setActiveSection('how-it-works');
          return;
        }
      }

      if (featuresElement) {
        const elementTop = featuresElement.offsetTop;
        const elementBottom = elementTop + featuresElement.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          setActiveSection('features');
          return;
        }
      }

      if (pricingElement) {
        const elementTop = pricingElement.offsetTop;
        const elementBottom = elementTop + pricingElement.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          setActiveSection('pricing');
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`mx-6 mt-4 px-6 py-2 flex items-center justify-between backdrop-blur-sm transition-all duration-300 ${
        isDarkBg ? 'bg-white/80 rounded-full shadow-lg border border-white/20' : 'bg-transparent'
      }`}>
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 relative">
          <Image 
            src="/logo.png" 
            alt="Clonefluencer Logo" 
            width={32} 
            height={32}
            className="object-contain"
          />
        </div>
        <span className={`text-lg font-bold ${
          isDarkBg ? 'text-black' : 'text-gray-900'
        }`}>Clonefluencer</span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#how-it-works" className={`text-sm font-medium relative overflow-hidden transition-colors duration-300 group ${
          activeSection === 'how-it-works' 
            ? (isDarkBg ? 'text-black' : 'text-gray-900') 
            : (isDarkBg ? 'text-gray-600 hover:text-black' : 'text-gray-700 hover:text-gray-900')
        }`}>
          How it works
          <span className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out ${
            isDarkBg ? 'bg-black' : 'bg-gray-900'
          } ${
            activeSection === 'how-it-works' 
              ? 'left-0 w-full' 
              : 'left-1/2 w-0 group-hover:w-full group-hover:left-0'
          }`}></span>
        </a>
        <a href="#features" className={`text-sm font-medium relative overflow-hidden transition-colors duration-300 group ${
          activeSection === 'features' 
            ? (isDarkBg ? 'text-black' : 'text-gray-900') 
            : (isDarkBg ? 'text-gray-600 hover:text-black' : 'text-gray-700 hover:text-gray-900')
        }`}>
          Features
          <span className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out ${
            isDarkBg ? 'bg-black' : 'bg-gray-900'
          } ${
            activeSection === 'features' 
              ? 'left-0 w-full' 
              : 'left-1/2 w-0 group-hover:w-full group-hover:left-0'
          }`}></span>
        </a>
        <a href="#pricing" className={`text-sm font-medium relative overflow-hidden transition-colors duration-300 group ${
          activeSection === 'pricing' 
            ? (isDarkBg ? 'text-black' : 'text-gray-900') 
            : (isDarkBg ? 'text-gray-600 hover:text-black' : 'text-gray-700 hover:text-gray-900')
        }`}>
          Pricing
          <span className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out ${
            isDarkBg ? 'bg-black' : 'bg-gray-900'
          } ${
            activeSection === 'pricing' 
              ? 'left-0 w-full' 
              : 'left-1/2 w-0 group-hover:w-full group-hover:left-0'
          }`}></span>
        </a>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onLogin}
          className={`text-sm font-medium transition-colors ${
            isDarkBg ? 'text-gray-600 hover:text-black' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Log in
        </button>
        <button
          onClick={onSignup}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isDarkBg 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Sign up →
        </button>
      </div>
      </div>
    </header>
  );
};

const HeroSection = ({ onTryNow, onJudgeAccess }: { onTryNow: () => void; onJudgeAccess: () => void }) => {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 pt-32 min-h-screen scroll-snap-section">
      <div className="max-w-4xl mx-auto">
        {/* Motto */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Clonefluencers
        </h1>
          <p className="text-lg md:text-xl text-gray-600 italic">
            Because real influencers are expensive AF
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          A platform to creates virtual influencers for your content, campaigns, and product drops — no DMs, no diva demands, just drip on demand.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center space-y-4 mb-12">
          <button
            onClick={onTryNow}
            className="flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span>Try Clonefluencer</span>
          </button>
          
          <a 
            href="#demo" 
            className="text-gray-600 hover:text-gray-900 font-medium underline"
          >
            Watch Demo
          </a>
        </div>

        {/* Judge Access - Minimalistic */}
        <div className="max-w-sm mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">AWS Hackathon Judges</span>
              </div>
              <button 
                onClick={onJudgeAccess}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Access →
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">Credentials in README.md</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const steps = [
    {
      number: "01",
      title: "Create Your Model",
      description: "Design your perfect virtual influencer with our intuitive AI character builder. Choose appearance, style, personality, and brand alignment in minutes.",
      image: "/howitworks/model.png",
      features: ["AI Character Builder", "Custom Appearance", "Brand Alignment"]
    },
    {
      number: "02", 
      title: "Upload Your Product",
      description: "Add your products, fashion items, or content that you want to showcase. Our AI understands context and brand aesthetics automatically.",
      image: "/howitworks/product.png",
      features: ["Smart Upload", "Auto Context", "Brand Recognition"]
    },
    {
      number: "03",
      title: "Generate & Scale",
      description: "Create unlimited professional content, campaigns, and social media posts. No photoshoots, no scheduling conflicts, no expensive retainers.",
      image: "/howitworks/combined.png",
      features: ["Unlimited Content", "Social Media Ready", "No Photoshoots"]
    }
  ];

  return (
      <section id="how-it-works" className="relative z-10 min-h-screen scroll-snap-section pt-24 pb-20 px-6" style={{ backgroundColor: '#181b20' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How it works
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From concept to campaign in minutes. Create professional influencer content 
            without the traditional costs and complications.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
              {/* Content Side */}
              <div className="flex-1 space-y-6">
                {/* Step Number and Title */}
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border border-white/20">
                {step.number}
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-lg leading-relaxed">
                  {step.description}
                </p>

                {/* Feature List */}
                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <span className="text-slate-200 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Image Side */}
              <div className="flex-1 max-w-md mx-auto">
                <div className="relative group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-700">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Connecting Line (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-0.5 h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        ))}
      </div>
      
        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="space-y-4">
            <p className="text-slate-300 text-lg">
            Ready to revolutionize your content creation?
          </p>
            <button 
              onClick={onGetStarted}
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 inline-flex items-center space-x-3 border border-white/20 hover:border-white/40"
            >
              <span>Start Creating Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = ({ onJudgeAccess }: { onJudgeAccess: () => void }) => {
  const features = [
    {
      icon: User,
      title: "AI Persona Studio",
      description: "Create detailed character profiles with 5 organized sections including demographics, physical features, personality, and style preferences"
    },
    {
      icon: Sparkles,
      title: "AWS Bedrock Integration",
      description: "Multi-model AI pipeline using Claude 3 Sonnet, Amazon Titan, Nova Canvas, and Stable Diffusion XL for prompt enhancement and image generation"
    },
    {
      icon: Shield,
      title: "Enterprise Security & Authentication",
      description: "AWS Cognito integration with email verification, secure JWT tokens, and role-based access control for production-ready user management"
    },
    {
      icon: Database,
      title: "Scalable Cloud Storage",
      description: "AWS DynamoDB for metadata storage and S3 for image assets with automatic scaling, backup, and global distribution capabilities"
    },
    {
      icon: Zap,
      title: "High-Performance Generation",
      description: "Optimized AWS infrastructure delivering professional 1024x1024 images with sub-10 second generation times and auto-scaling"
    },
    {
      icon: Settings,
      title: "Responsible AI & Guardrails",
      description: "Built-in content moderation, ethical AI practices, and AWS compliance frameworks ensuring safe and responsible AI usage"
    },
    {
      icon: Camera,
      title: "Production-Ready API",
      description: "RESTful API architecture with health monitoring, error handling, and AWS Lambda deployment for serverless scalability"
    },
    {
      icon: ArrowRight,
      title: "Cost-Effective Innovation",
      description: "Pay-per-use AWS Bedrock pricing model reducing traditional content creation costs by 90% while maintaining professional quality"
    }
  ];

  return (
    <section id="features" className="relative z-10 pt-24 pb-20 px-6 bg-gray-50 min-h-screen scroll-snap-section">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, customize, and scale your virtual influencer content
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                {/* Icon and Title */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Judge Access Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2" />
              AWS Hackathon Judge Access
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Full Platform Access for Judges
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Complete access to all features including AWS Bedrock models, image generation, storage, and analytics. 
              Pre-configured accounts with unlimited credits for comprehensive evaluation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                             <button 
                 onClick={onJudgeAccess}
                 className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200 inline-flex items-center space-x-2"
               >
                <span>Access Judge Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500">
                Credentials available in README.md
              </div>
            </div>
            </div>
          </div>
          
        {/* Bottom CTA */}
            <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to create your AI influencer?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get started with our AI Persona Studio and generate professional content in minutes. No photoshoots, no scheduling conflicts, just pure creativity.
            </p>
            <button className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 inline-flex items-center space-x-2">
              <span>Try It Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "5 generations per month",
        "1 basic AI model",
        "Standard resolution (512x512)",
        "Community support",
        "Basic templates"
      ],
      buttonText: "Start Free",
      buttonStyle: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For content creators and small businesses",
      features: [
        "500 generations per month",
        "10+ premium AI models",
        "High resolution (1024x1024)",
        "Priority support",
        "Advanced templates",
        "Commercial license",
        "API access"
      ],
      buttonText: "Start Pro",
      buttonStyle: "bg-black text-white hover:bg-gray-800",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For agencies and large organizations",
      features: [
        "Unlimited generations",
        "Custom AI model training",
        "Ultra-high resolution",
        "Dedicated support",
        "White-label solution",
        "Custom integrations",
        "SLA guarantee",
        "Team management"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="relative z-10 pt-24 pb-12 px-6 bg-white min-h-screen scroll-snap-section flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Simple Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
              plan.popular ? 'border-black shadow-lg' : 'border-gray-200'
            }`}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-sm ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                onClick={onGetStarted}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
          </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            All plans include secure hosting and regular updates. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

const VerticalDotNavigation = () => {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        const element = section.id === 'hero' 
          ? document.documentElement 
          : document.getElementById(section.id);
        
        if (element) {
          const elementTop = section.id === 'hero' ? 0 : element.offsetTop;
          const elementBottom = elementTop + (section.id === 'hero' ? window.innerHeight : element.offsetHeight);
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80; // Account for fixed header height
        const elementPosition = element.offsetTop - headerOffset;
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-white/15 backdrop-blur-sm rounded-full p-2 border border-white/20">
        <div className="flex flex-col space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-2 h-2 rounded-full transition-all duration-300 relative group ${
                activeSection === index
                  ? 'bg-gray-900 scale-110'
                  : 'bg-gray-500 hover:bg-gray-700'
              }`}
              aria-label={`Navigate to ${section.label}`}
            >
              {/* Tooltip */}
              <span className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {section.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ onLogin, onSignup, onJudgeAccess }: { onLogin: () => void; onSignup: () => void; onJudgeAccess: () => void }) => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <LandingPageHeader onLogin={onLogin} onSignup={onSignup} />
      <VerticalDotNavigation />
      <main className="relative z-10">
        <HeroSection onTryNow={onLogin} onJudgeAccess={onJudgeAccess} />
        <HowItWorksSection onGetStarted={onSignup} />
        <FeaturesSection onJudgeAccess={onJudgeAccess} />
        <PricingSection onGetStarted={onSignup} />
      </main>
    </div>
  );
};

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, loading } = useAuth();

  const handleLogin = () => {
    setModalMode('login');
    setShowLoginModal(true);
  };

  const handleSignup = () => {
    setModalMode('signup');
    setShowLoginModal(true);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the AI Create interface
  if (isAuthenticated) {
  return (
      <div className="min-h-screen flex flex-col relative bg-gray-50">
      <CreateForm />
    </div>
    );
  }

  // If not authenticated, show the landing page
  return (
    <>
      <LandingPage onLogin={handleLogin} onSignup={handleSignup} onJudgeAccess={() => {
        setModalMode('login');
        setShowLoginModal(true);
      }} />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        initialMode={modalMode}
      />
    </>
  );
} 