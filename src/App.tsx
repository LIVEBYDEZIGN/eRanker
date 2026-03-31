import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, TrendingUp, Search, Award, Zap, Quote, Check, Mail, Settings, BarChart, Target, Users, Rocket, Brain, ChevronDown, BarChart2, Menu, MessageSquare, Calendar, Clock } from 'lucide-react';
import { SignupModal } from './components/SignupModal';
import { ImageModal } from './components/ImageModal';
import { HubspotCalendar } from './components/HubspotCalendar';
import { CalendarModal } from './components/CalendarModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { InstructionsPage } from './components/InstructionsPage';
import { Calculator } from './components/Calculator';
import { successStories } from './config/successStories';

function TestimonialCard({ name, role, text, rating }) {
  return (
    <div className="flex-none w-[400px] p-4">
      <div className="bg-[#161618] p-6 rounded-2xl border border-[#ff5702]/10 h-full">
        <div className="flex items-start mb-4">
          <Quote className="w-8 h-8 text-[#ff5702] flex-shrink-0" />
          <div className="flex ml-2">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#ff5702] fill-current" />
            ))}
          </div>
        </div>
        <p className="text-gray-300 mb-4">{text}</p>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card relative p-6 rounded-xl bg-[#161618] border border-[#ff5702]/10 hover:border-transparent transition-all text-center">
      <div className="relative z-10">
        <div className="mb-4 mx-auto w-fit p-3 rounded-lg bg-gradient-to-br from-[#ff5702]/10 to-[#ff5702]/5">
          {React.cloneElement(icon, { className: "w-6 h-6 text-[#ff5702]" })}
        </div>
        <h3 className="text-2xl font-semibold mb-2 text-white">
          {title}
        </h3>
        <p className="text-base text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="p-8 rounded-2xl bg-[#161618] border border-[#ff5702]/10">
      <div className="text-4xl font-bold text-[#ff5702] mb-2">
        {number}
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800">
      <button
        className="w-full py-6 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400">{answer}</p>
      </div>
    </div>
  );
}

function FloatingMenu() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openCalendarModal = () => {
    // Track Schedule event with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Schedule');
    }
    
    setIsCalendarModalOpen(true);

    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCalendar = () => {
    // Track Schedule event with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Schedule');
    }

    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className="block md:hidden">
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/30 backdrop-blur-lg' : 'bg-transparent'
        }`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#ff5702]" />
              <span className="font-bold text-white">eRanker</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div className={`${
            isMobileMenuOpen ? 'max-h-64' : 'max-h-0'
          } overflow-hidden transition-all duration-300 bg-black/30 backdrop-blur-lg`}>
            <div className="px-4 py-2 space-y-2">
              <a
                href="#social-proof"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </a>
              <a
                href="#faq"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <a
                href="/calculator"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculator
              </a>
              <button 
                onClick={() => {
                  // openCalendarModal();
                  setIsMobileMenuOpen(false);
                }}
                className="hidden block py-2 text-gray-300 hover:text-white transition-colors w-full text-left"
              >
                Book a Call
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#ff5702] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                RANK MY PRODUCT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:block">
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] lg:w-[70%] z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/30 backdrop-blur-lg' : 'bg-transparent'
        } rounded-full border border-white/10`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-[#ff5702]" />
              <span className="font-bold text-white">eRanker</span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#social-proof" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
              <a href="/calculator" className="text-gray-300 hover:text-white transition-colors">Calculator</a>
              {/* <button
                onClick={openCalendarModal}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Book a Call
              </button> */}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-[#ff5702] text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
              RANK MY PRODUCT <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
    </>
  );
}

function SocialProofGrid() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Filter stories by type
  const iphoneStories = successStories.filter(story => story.type === 'iphone');
  const horizontalStories = successStories.filter(story => story.type === 'horizontal');

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* iPhone Screenshots - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {iphoneStories.slice(0, 3).map((story) => (
            <div 
              key={story.id}
              className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30 cursor-pointer"
              onClick={() => setSelectedImage(story)}
            >
              <div className="relative pb-[187.41%]"> {/* 683:1280 aspect ratio */}
                <img
                  src={story.imageUrl}
                  alt={story.altText}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{story.description || story.altText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* iPhone Screenshots - Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {iphoneStories.slice(3, 6).map((story) => (
            <div 
              key={story.id}
              className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30 cursor-pointer"
              onClick={() => setSelectedImage(story)}
            >
              <div className="relative pb-[187.41%]"> {/* 683:1280 aspect ratio */}
                <img
                  src={story.imageUrl}
                  alt={story.altText}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{story.description || story.altText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Images - Rows 3-6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {horizontalStories.map((story) => (
            <div 
              key={story.id}
              className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30 cursor-pointer"
              onClick={() => setSelectedImage(story)}
            >
              <div className="relative pb-[75%]">
                <img
                  src={story.imageUrl}
                  alt={story.altText}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{story.description || story.altText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Placeholder slots for remaining spaces */}
          {Array.from({ length: Math.max(0, 30 - successStories.length) }).map((_, index) => (
            <div 
              key={`placeholder-${index}`}
              className="relative rounded-xl border border-[#ff5702]/10 border-dashed"
            >
              <div className="relative pb-[75%] bg-[#161618]">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.imageUrl || ''}
        altText={selectedImage?.altText || ''}
        description={selectedImage?.description}
      />
    </>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Check if we're on the instructions page based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/instructions') {
      setCurrentPage('instructions');
    } else if (path === '/calculator') {
      setCurrentPage('calculator');
    } else {
      setCurrentPage('home');
    }
  }, []);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/instructions') {
        setCurrentPage('instructions');
      } else if (path === '/calculator') {
        setCurrentPage('calculator');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to instructions page
  const navigateToInstructions = () => {
    window.history.pushState({}, '', '/instructions');
    setCurrentPage('instructions');
  };

  // Navigate to home page
  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPage('home');
  };

  if (currentPage === 'instructions') {
    return <InstructionsPage />;
  }

  if (currentPage === 'calculator') {
    return <Calculator />;
  }

  const scrollToCalendar = () => {
    // Track Schedule event with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Schedule');
    }
  };

  const faqItems = [
    {
      question: "What is eRanker and what can I do with it?",
      answer: "eRanker is a tool that helps your Etsy products appear on the first page of search results for any keyword you choose, bringing more buyers to your listings = More sales!"
    },
    {
      question: "How long until I see results?",
      answer: "Most sellers see significant results within 3-4 weeks of ranking their products to the 1st page. However, results can vary based on your niche, competition, and how consistently you apply recommendations."
    },
    {
      question: "Is this hard to learn? Do I need to be tech-savvy?",
      answer: "If you can use Facebook, you can use eRanker. We'll provide onboarding calls and video guides that walk you through everything step-by-step. No coding or technical skills needed."
    },
    {
      question: "What if it doesn't work for my shop?",
      answer: "It works for 99% of our customers and it will work for you as well. We also provide live support calls to make sure you succeed."
    },
    {
      question: "Can I get banned from Etsy for using this?",
      answer: "No, eRanker is designed to follow Etsy's policy. We've helped hundreds of sellers rank with zero issues."
    },
    {
      question: "What support do I get if I need help?",
      answer: "You get:\n• Live support calls & custom strategies for your shop\n• Step-by-step video guides for everything\n• A community of sellers sharing what works"
    },
    {
      question: "How many products can I rank?",
      answer: "There's no limit. You can use eRanker on as many products and keywords as you want. Many sellers start with their best-selling items and expand from there."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <FloatingMenu />
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Hero Section */}
      <div id="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ff5702]/5 pointer-events-none" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="graph-line"></div>
          <div className="graph-line"></div>
          <div className="graph-line"></div>
          <div className="graph-line"></div>
          <div className="chart-dot"></div>
          <div className="chart-dot"></div>
          <div className="chart-dot"></div>
          <div className="chart-dot"></div>
          <div className="trend-line"></div>
          <div className="trend-line"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 pb-8 md:pb-16 relative">
          <div className="text-center">
            <h1 
              className="text-4xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 gradient-text flex flex-col"
              data-text="RANK ON THE 1ST PAGE IN 7 DAYS"
            >
              <span>ETSY SELLER</span>
              <span>WE'LL RANK YOUR LISTING ON PAGE 1 IN 7 DAYS</span>
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl text-white font-semibold mb-8 md:mb-12 px-0">
              Rank Higher → Get More Visits → Make More Sales!
            </p>
            
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mb-8">
              <div className="relative pb-[56.25%] h-0 rounded-none sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/hQH0_Cu-4PI"
                  title="Product Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff5702] text-white px-8 py-2 md:px-10 md:py-6 rounded-full text-base md:text-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto whitespace-nowrap"
            >
              RANK MY PRODUCT <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" className="py-0 sm:py-2 md:py-1 bg-[#0F0F11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            <StatCard number="3.3X" label="Average Growth" />
            <StatCard number="99.5%" label="Success Rate" />
            <StatCard number="7437+" label="Products Ranked" />
            <StatCard number="210+" label="Clients Served" />
          </div>
        </div>
      </div>

      {/* Client Results Section */}
      <div id="client-results" className="py-5 md:py-10 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-1 md:mb-1">
            <h2 className="text-3xl md:text-2xl font-bold mb-6 text-white">
              THE RESULTS OUR CLIENTS ACHIEVED AFTER USING ERANKER
            </h2>
          </div>
          
          {/* Client Results Images Grid */}
          <div className="max-w-6xl mx-auto">
            {/* Mobile: Stack vertically, Desktop: 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Image 1 - Mobile: 1st, Desktop: Top Left */}
              <div className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30">
                <img
                  src="/1.png"
                  alt="Client analytics dashboard showing revenue growth - $338,171.37"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Image 2 - Mobile: 2nd, Desktop: Top Right */}
              <div className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30">
                <img
                  src="/2.png"
                  alt="Client analytics dashboard showing revenue growth - $619,315.93"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Image 3 - Mobile: 3rd, Desktop: Bottom Left */}
              <div className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30">
                <img
                  src="/3.png"
                  alt="Client analytics dashboard showing revenue growth - $587,495.69"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Image 4 - Mobile: 4th, Desktop: Bottom Right */}
              <div className="relative group overflow-hidden rounded-xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30">
                <img
                  src="/4.png"
                  alt="Client analytics dashboard showing revenue growth - $287,495.69"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="features" className="py-12 md:py-16 bg-[#0F0F11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-[#ff5702]">
              How It Works
            </h2>
            <p className="text-xl md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
             
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <FeatureCard
              icon={<Search />}
              title="Keyword Analysis"
              description="Target & Rank Only Keywords That Actually Make Money"
            />
            <FeatureCard
              icon={<Target />}
              title="No SEO Optimisation"
              description="Rank Without Tweaking Tags or Titles"
            />
            <FeatureCard
              icon={<Clock />} 
              title="Automated Scheduling"
              description="Schedule Listings Months Ahead and Get Notified When They Ranked."
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Guaranteed Results"
              description="First-Page Rankings in as Little as 7 Days"
            />
          </div>
        </div>
      </div>

      {/* Fiverr Social Proof Section */}
      <div id="fiverr-proof" className="py-8 md:py-12 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative group overflow-hidden rounded-2xl border border-[#ff5702]/10 transition-all duration-300 hover:border-[#ff5702]/30">
              <img
                src="/fiverr.jpg"
                alt="Fiverr profile showing 5/5 stars from 187 reviews - Ion V. Level 1 Etsy Seller"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="text-center mt-8">
              <a
                href="https://www.fiverr.com/ionvrabii"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#1dbf73] hover:bg-[#19a463] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View All 187 Reviews on Fiverr
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section 1 */}
      {/* ========== CALENDAR SECTION 1 - CURRENTLY HIDDEN ========== */}
      {/* TO MAKE VISIBLE: Remove 'hidden' class from the div below */}
      <div id="calendar" className="hidden py-0 md:py-1 bg-[#0A0A0B]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#ff5702]">
            SCHEDULE YOUR FREE DEMO CALL
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            — to discuss your ranking strategy —
          </p>
        </div>
        <HubspotCalendar />
      </div>
      {/* ========== END CALENDAR SECTION 1 ========== */}

      {/* Social Proof Section */}
      <div id="social-proof" className="py-11 md:py-8 bg-[#0A0A0B]">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#ff5702]">
            Recent Results From People Just Like You
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            190+ Happy Clients Served Worldwide
          </p>
        </div>
        <SocialProofGrid />
      </div>

      {/* ========== CALENDAR SECTION 2 - CURRENTLY HIDDEN ========== */}
      {/* TO MAKE VISIBLE: Remove 'hidden' class from the div below */}
      <div className="hidden py-8 md:py-15 bg-[#0F0F11]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#ff5702]">
            Ready to Rank On Top?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Let us help you become a top Etsy seller
          </p>
        </div>
        <HubspotCalendar />
      </div>
      {/* ========== END CALENDAR SECTION 2 ========== */}

      {/* FAQ Section */}
      <div id="faq" className="py-1 md:py-1 bg-[#0A0A0B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 md:mb-5">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#ff5702]">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-0">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-5 md:py-5 bg-[#0F0F11]">
        <div className="max-w-4xl mx-auto px-2 sm:px-2 lg:px-8 text-center">
          <div className="mb-8">
            <img
              src="/Untitled-1.png"
              alt="eRanker Logo"
              className="w-16 h-16 md:w-20 md:h-20 mx-auto"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-[#ff5702]">
            THE TOOL THAT TOP 0.1% SELLERS USE TO WIN THE ETSY GAME
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5702] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
          >
            RANK MY PRODUCT <Zap className="w-5 h-5" />
          </button>
          <p className="text-lg md:text-xl text-gray-400 mt-6 md:mt-8">
            Take Your Etsy Ranking To The Next Level
          </p>
        </div>
      </div>

      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;