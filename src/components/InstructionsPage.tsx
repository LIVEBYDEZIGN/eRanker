import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Play, Settings, Clock, Target, BarChart2, CheckCircle, AlertTriangle, Mail, Book, HelpCircle, ChevronDown, ChevronRight, Lock, Eye, EyeOff } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  sectionId?: string;
  onComplete?: (sectionId: string) => void;
  isCompleted?: boolean;
}

function Section({ title, children, icon, sectionId, onComplete, isCompleted }: SectionProps) {
  return (
    <div className="mb-12" id={sectionId}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#ff5702]">{icon}</div>}
          <h2 className="text-2xl md:text-3xl font-bold text-[#ff5702]">{title}</h2>
        </div>
        {sectionId && onComplete && (
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isCompleted || false}
              onChange={() => onComplete(sectionId)}
              className="w-5 h-5 rounded border-2 border-[#ff5702] bg-transparent checked:bg-[#ff5702] cursor-pointer"
            />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Mark as complete</span>
          </label>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#ff5702]/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-[#161618] hover:bg-[#1a1a1c] transition-colors flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-[#ff5702]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#ff5702]" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-[#0f0f11] border-t border-[#ff5702]/10">
          {children}
        </div>
      )}
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  details?: string[];
}

function StepCard({ number, title, description, details }: StepCardProps) {
  return (
    <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
      <div className="flex items-start gap-4">
        <div className="bg-[#ff5702] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-3">{description}</p>
          {details && (
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string | string[];
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800">
      <button
        className="w-full py-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        {Array.isArray(answer) ? (
          <ul className="space-y-2">
            {answer.map((item, index) => (
              <li key={index} className="text-gray-400 flex items-start gap-2">
                <span className="text-[#ff5702] mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">{answer}</p>
        )}
      </div>
    </div>
  );
}

function PasswordProtection({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length >= 5) {
      onUnlock();
    } else {
      setError('Wrong password ');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-[#161618] p-8 rounded-xl border border-[#ff5702]/10">
          <div className="text-center mb-8">
            <div className="bg-[#ff5702] p-4 rounded-xl w-fit mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#ff5702] mb-2">
              Protected Content
            </h1>
            <p className="text-gray-400">
              Enter your password to access instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white pr-12"
                  placeholder="Enter password..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff5702] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Access Instructions
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstructionsPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Check if user has already unlocked the page in this browser
  useEffect(() => {
    const hasAccess = localStorage.getItem('eranker-instructions-access');
    if (hasAccess === 'true') {
      setIsUnlocked(true);
    }

    // Load completed sections from localStorage
    const saved = localStorage.getItem('eranker-completed-sections');
    if (saved) {
      setCompletedSections(JSON.parse(saved));
    }
  }, []);

  const handleUnlock = () => {
    // Save access to localStorage so user doesn't need to enter password again
    localStorage.setItem('eranker-instructions-access', 'true');
    setIsUnlocked(true);
  };

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => {
      const newCompleted = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];

      // Save to localStorage
      localStorage.setItem('eranker-completed-sections', JSON.stringify(newCompleted));
      return newCompleted;
    });
  };

  if (!isUnlocked) {
    return <PasswordProtection onUnlock={handleUnlock} />;
  }

  const faqData = [
    {
      question: "What are the system requirements for eRanker?",
      answer: "Minimum: 3GB CPU and 3GB RAM. Recommended: 5GB CPU and 5GB RAM. Remember: 1GB CPU + 1GB RAM = 1 Task, so 100GB CPU + 100GB RAM = 100 Tasks."
    },
    {
      question: "How do I initiate a ranking operation?",
      answer: [
        "Open eRanker and navigate to the ranking operation section",
        "Enter the listing ID and keyword",
        "Choose 'Run Now' to start immediately or 'Schedule Application' to set a specific time",
        "Click the 'Run' button to start the operation"
      ]
    },
    {
      question: "How does the scheduler feature work?",
      answer: "The scheduler allows you to automate ranking tasks by setting specific start times, intervals, and durations. It works similarly to the 'Run Now' option but starts and stops automatically based on the schedule. Ensure no more than 5 tasks run simultaneously to avoid system overload."
    },
    {
      question: "How do I properly close tasks to avoid system overuse?",
      answer: "Always close tasks properly by right-clicking on the task in the task bar and selecting 'Close' or 'End Task.' Avoid pressing the X button to close tasks."
    },
    {
      question: "How often should I schedule ranking checks?",
      answer: [
        "Initially, set ranking checks at a 2-hour interval",
        "Once the listing is ranked on the first page, adjust to daily checks",
        "For high-performing listings, consider a 1-hour interval if the product consistently ranks on the first page within less than an hour"
      ]
    },
    {
      question: "How can I optimize my listings for high competition keywords?",
      answer: [
        "Use long tail keywords",
        "Avoid repeating keywords in the product title",
        "Repeat keywords in listing tags",
        "Use all 10 product photos and include a product video",
        "Write a structured description",
        "Use daily sales to trigger the countdown timer under your listing"
      ]
    },
    {
      question: "How can I contact customer support?",
      answer: "You can contact customer support via email at info@eranker.net. Provide your account information, a detailed description of the issue, and any troubleshooting steps you have taken."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="bg-[#0F0F11] border-b border-[#ff5702]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <a 
              href="/" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#ff5702] p-3 rounded-xl">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#ff5702] mb-2">
                eRanker Instructions
              </h1>
              <p className="text-xl text-gray-400">
                Complete guide for installing and using eRanker effectively
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-[#ff5702]" />
              <h3 className="text-lg font-semibold text-white">Installation & Setup</h3>
            </div>
            <p className="text-gray-400 mb-4">Get started with eRanker installation and initial configuration.</p>
            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-xl border border-gray-800">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"
                title="Installation & Setup Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-[#ff5702]" />
              <h3 className="text-lg font-semibold text-white">Video Tutorial</h3>
            </div>
            <p className="text-gray-400 mb-4">Watch our comprehensive video guide on how to use eRanker.</p>
            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-xl border border-gray-800">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"
                title="Video Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Overview */}
        <Section
          title="Overview"
          icon={<BarChart2 className="w-8 h-8" />}
          sectionId="overview"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('overview')}
        >
          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <h3 className="text-xl font-semibold text-white mb-4">What is eRanker?</h3>
            <p className="text-gray-400 mb-4">
              eRanker is a unique software tool designed for Etsy sellers to rank their listings for any keyword, 
              regardless of competition level. It offers two payment options: a monthly subscription and a lifetime 
              access option. The software guarantees first-page rankings and addresses issues of low sales due to lack of exposure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702]" />
                <span className="text-gray-300">Scheduler for task automation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702]" />
                <span className="text-gray-300">Rank for high-competition keywords</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702]" />
                <span className="text-gray-300">Pause and restart tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702]" />
                <span className="text-gray-300">Personal installation for lifetime access</span>
              </div>
            </div>
          </div>
        </Section>

        {/* System Requirements */}
        <Section
          title="System Requirements"
          icon={<Settings className="w-8 h-8" />}
          sectionId="system-requirements"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('system-requirements')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
              <h3 className="text-lg font-semibold text-white mb-4">Minimum Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-[#ff5702] rounded-full"></span>
                  3GB CPU
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-[#ff5702] rounded-full"></span>
                  3GB RAM
                </li>
              </ul>
            </div>
            
            <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-[#ff5702] rounded-full"></span>
                  5GB CPU
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-[#ff5702] rounded-full"></span>
                  5GB RAM
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#ff5702]/10 border border-[#ff5702]/20 p-4 rounded-lg">
            <p className="text-[#ff5702] font-medium">
              <strong>Resource Formula:</strong> 1GB CPU + 1GB RAM = 1 Task | 100GB CPU + 100GB RAM = 100 Tasks
            </p>
          </div>
        </Section>

        {/* Getting Started */}
        <Section
          title="Getting Started"
          icon={<Target className="w-8 h-8" />}
          sectionId="getting-started"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('getting-started')}
        >
          <div className="space-y-6">
            <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
              <div className="flex items-start gap-4">
                <div className="bg-[#ff5702] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Run Now</h3>
                  <p className="text-gray-400 mb-3">Start the application instantly and control it directly</p>
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Enter the listing ID of your product
                    </li>
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Enter the keyword for ranking (all lowercase, no space before and after keyword)
                    </li>
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Click the 'Run' button to start the operation
                    </li>
                  </ul>
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src="/Screenshot 2025-09-18 at 00.11.41.jpg"
                      alt="Run Now Screenshot"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
              <div className="flex items-start gap-4">
                <div className="bg-[#ff5702] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Schedule Application</h3>
                  <p className="text-gray-400 mb-3">Schedule the application to run later with specific intervals</p>
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Set specific start times and durations
                    </li>
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Automate ranking tasks
                    </li>
                    <li className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#ff5702] mt-0.5 flex-shrink-0" />
                      Ensure no more than 5 tasks run simultaneously
                    </li>
                  </ul>
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src="/Screenshot 2025-09-18 at 00.26.06.jpg"
                      alt="Schedule Application Screenshot"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Scheduler Instructions */}
        <Section
          title="Effective Use of Scheduler"
          icon={<Clock className="w-8 h-8" />}
          sectionId="scheduler"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('scheduler')}
        >
          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <h3 className="text-xl font-semibold text-white mb-4">Long-term Task Scheduling</h3>
            <p className="text-gray-400 mb-6">
              Start your ranking campaign by creating a set of 3-5 tasks. Schedule each set to run daily with a 4-hour interval.
            </p>
            
            <div className="space-y-4">
              <div className="bg-[#ff5702]/10 border border-[#ff5702]/20 p-4 rounded-lg">
                <h4 className="text-[#ff5702] font-semibold mb-2">VERY IMPORTANT INSTRUCTIONS:</h4>
                <ol className="space-y-2 text-gray-300">
                  <li>1. Go to Schedule (schedule task) from Scheduler App</li>
                  <li>2. Select Schedule Type "Start Every Day"</li>
                  <li>3. Press "+" button to select when to launch the task</li>
                  <li>4. Press "More Settings" button on the right</li>
                  <li>5. Press "Infinite" from Maximum running time for single task</li>
                  <li>6. Write "4" if you want the task to run 4 hours each day</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <h3 className="text-xl font-semibold text-white mb-4">Scheduling Ranking Checks</h3>
            <p className="text-gray-400 mb-4">
              Once you see the Success notification stating that your listing ranked on the first page, 
              it's time to schedule it for daily checks. Use the SAME method for task scheduling process, 
              but lower the "Running time" value.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-[#ff5702]" />
                Initial ranking checks at a 2-hour interval
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-[#ff5702]" />
                Consider a 1-hour interval for high-performing listings
              </li>
            </ul>
          </div>
        </Section>

        {/* Best Practices */}
        <Section
          title="Best Practices"
          sectionId="best-practices"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('best-practices')}
        >
          <CollapsibleSection title="Optimizing Listings for High Competition Keywords" defaultOpen>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Use long tail keywords</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Avoid repeating keywords in the product title</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Repeat keywords in listing tags</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Use all 10 product photos and include a product video</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Write a structured description</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff5702] mt-0.5" />
                <span className="text-gray-300">Use daily sales to trigger the countdown timer</span>
              </li>
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Monitoring and Adjusting Strategies">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Monitoring Rankings:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Check the system status daily
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Create a spreadsheet to track listings, keywords, check dates, ranks, and notes
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Update the spreadsheet after each ranking check
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Adjusting Strategies:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Analyze trends in the spreadsheet
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Make adjustments based on external factors
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#ff5702] mt-1">•</span>
                    Monitor the impact of adjustments in subsequent ranking checks
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>
        </Section>

        {/* Troubleshooting */}
        <Section
          title="Troubleshooting"
          icon={<AlertTriangle className="w-8 h-8" />}
          sectionId="troubleshooting"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('troubleshooting')}
        >
          <div className="space-y-6">
            <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
              <h3 className="text-lg font-semibold text-white mb-4">Common Issues and Solutions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Improper Task Closure:</h4>
                  <p className="text-gray-400 mb-2"><strong>Issue:</strong> Closing tasks by pressing the X button.</p>
                  <p className="text-gray-300"><strong>Solution:</strong> Always close tasks properly using the taskbar options.</p>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Incorrect Scheduling of Tasks:</h4>
                  <p className="text-gray-400 mb-2"><strong>Issue:</strong> Not scheduling tasks properly.</p>
                  <p className="text-gray-300"><strong>Solution:</strong> Follow recommended scheduling intervals and ensure no more than 5 tasks run simultaneously.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section
          title="Frequently Asked Questions"
          icon={<HelpCircle className="w-8 h-8" />}
          sectionId="faq"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('faq')}
        >
          <div className="space-y-0">
            {faqData.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </Section>

        {/* Support */}
        <Section
          title="Contact Support"
          icon={<Mail className="w-8 h-8" />}
          sectionId="support"
          onComplete={handleSectionComplete}
          isCompleted={completedSections.includes('support')}
        >
          <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              If you need assistance with eRanker, our support team is here to help.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#ff5702]" />
              <span className="text-white font-medium">info@eranker.net</span>
            </div>
            <p className="text-sm text-gray-400">
              When contacting support, please provide your account information, a detailed description 
              of the issue, and any troubleshooting steps you have taken.
            </p>
          </div>
        </Section>

        {/* Disclaimer */}
        <div className="bg-[#ff5702]/10 border border-[#ff5702]/20 p-6 rounded-xl">
          <h3 className="text-[#ff5702] font-semibold mb-4">Important Disclaimer</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>Primary Function:</strong> eRanker's main purpose is to rank and maintain Etsy listings on the first page for specified keywords.
            </p>
            <p>
              <strong>No Sales Guarantee:</strong> While eRanker aims to improve the visibility of your listings, it does not guarantee sales. The overall sales performance is solely based on the quality of the individual listing and its conversion rate.
            </p>
            <p>
              <strong>Ranking Guarantee:</strong> eRanker guarantees first-page rankings for specified keywords when used correctly according to the provided instructions and best practices.
            </p>
            <p>
              <strong>No Harm Assurance:</strong> eRanker guarantees that it does not cause any harm to any type of shop. The software is designed to improve listing visibility without negatively impacting the user's shop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}