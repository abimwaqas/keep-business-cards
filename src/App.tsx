import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Scan, 
  Library, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronRight,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Card } from './types';
import { extractCardData, ExtractedCardData } from './services/geminiService';

// --- Components ---

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout 
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  user: User;
  onLogout: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan Card', icon: Scan },
    { id: 'cards', label: 'My Cards', icon: Library },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Scan size={24} />
            </div>
            <h1 className="text-xl font-display font-bold text-zinc-900 tracking-tight">CardScan Pro</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                `}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
                <p className="text-xs text-zinc-500">{user.is_premium ? 'Premium Plan' : 'Free Plan'}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Dashboard = ({ cards, user, onScanClick }: { cards: Card[], user: User, onScanClick: () => void }) => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold text-zinc-900">Welcome back!</h2>
        <p className="text-zinc-500">You've scanned {user.scan_count} cards so far.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Total Cards</p>
          <p className="text-3xl font-display font-bold text-zinc-900">{cards.length}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Scans Remaining</p>
          <p className="text-3xl font-display font-bold text-zinc-900">
            {user.is_premium ? '∞' : Math.max(0, 5 - user.scan_count)}
          </p>
        </div>
        <div className="p-6 bg-indigo-600 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100 mb-1">Quick Action</p>
            <p className="text-xl font-display font-bold">Scan New Card</p>
          </div>
          <button 
            onClick={onScanClick}
            className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-50 transition-colors"
          >
            Start Scanning
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-zinc-900">Recent Scans</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        
        {cards.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Library size={32} />
            </div>
            <p className="text-zinc-500">No cards scanned yet. Start by scanning your first business card!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.slice(0, 6).map((card) => (
              <div key={card.id} className="p-4 bg-white rounded-2xl border border-zinc-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <CreditCard size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 truncate">{card.name || 'Unknown Name'}</h4>
                    <p className="text-xs text-zinc-500 truncate">{card.title || 'No Title'}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-1 truncate">{card.company || 'No Company'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const Scanner = ({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User; 
  onSave: (data: any) => void; 
  onCancel: () => void 
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'edit'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExtractedCardData & { notes: string }>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setStep('scanning');
      setIsProcessing(true);
      setError(null);

      try {
        const extracted = await extractCardData(base64);
        setFormData({ ...extracted, notes: '' });
        setStep('edit');
      } catch (err) {
        setError("Failed to extract data. Please try again or enter manually.");
        setStep('edit');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, image_url: image });
  };

  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-zinc-900 mb-2">Scan Business Card</h2>
          <p className="text-zinc-500">Upload a photo or use your camera to capture a business card.</p>
        </div>

        {!user.is_premium && user.scan_count >= 5 ? (
          <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Scan Limit Reached</h3>
            <p className="text-amber-700 mb-6">You've used all 5 free scans. Upgrade to premium for unlimited scanning.</p>
            <button className="btn-primary bg-amber-600 hover:bg-amber-700">Upgrade Now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <label className="relative group cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="p-12 border-2 border-dashed border-zinc-300 rounded-3xl group-hover:border-indigo-500 group-hover:bg-indigo-50/50 transition-all text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Library size={40} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Select from Library</h3>
                <p className="text-zinc-500">Choose a photo from your device's gallery</p>
              </div>
            </label>

            <div className="relative group cursor-pointer opacity-50 pointer-events-none">
              <div className="p-12 border-2 border-dashed border-zinc-300 rounded-3xl text-center">
                <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-400">
                  <Scan size={40} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Use Camera</h3>
                <p className="text-zinc-500">Take a fresh photo of the card (Coming Soon)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative w-64 h-40 bg-zinc-100 rounded-xl overflow-hidden mb-8 shadow-lg">
          {image && <img src={image} className="w-full h-full object-cover opacity-50" />}
          <motion.div 
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
          />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Analyzing Card...</h3>
        <p className="text-zinc-500">Our AI is extracting contact details for you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-bold text-zinc-900">Verify Information</h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-900">Cancel</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-[1.6/1] bg-zinc-100 rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
            {image && <img src={image} className="w-full h-full object-contain" />}
          </div>
          
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">AI Tips</h4>
            <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
              <li>Check if the name and email are correct.</li>
              <li>Add personal notes to remember the context.</li>
              <li>You can edit any field before saving.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="input-field" 
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Job Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="input-field" 
                placeholder="CEO"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company</label>
            <input 
              type="text" 
              value={formData.company} 
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="input-field" 
              placeholder="Acme Corp"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="input-field" 
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="input-field" 
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Website</label>
            <input 
              type="text" 
              value={formData.website} 
              onChange={e => setFormData({...formData, website: e.target.value})}
              className="input-field" 
              placeholder="www.example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="input-field min-h-[80px] resize-none" 
              placeholder="123 Business St, City, Country"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="input-field min-h-[100px] bg-amber-50/50 border-amber-200" 
              placeholder="Met at the Tech Conference 2024. Interested in our SaaS product."
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Subscription = ({ user, onSubscribe }: { user: User, onSubscribe: () => void }) => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-zinc-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-lg text-zinc-500">Unlock unlimited scans and professional features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Free Plan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900">$0</span>
              <span className="text-zinc-500">/forever</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-center gap-3 text-zinc-600">
              <div className="w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                <ChevronRight size={14} />
              </div>
              Up to 5 card scans
            </li>
            <li className="flex items-center gap-3 text-zinc-600">
              <div className="w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                <ChevronRight size={14} />
              </div>
              Basic AI extraction
            </li>
            <li className="flex items-center gap-3 text-zinc-600">
              <div className="w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                <ChevronRight size={14} />
              </div>
              Manual editing
            </li>
          </ul>

          <button disabled className="btn-secondary w-full py-3 opacity-50">
            {user.is_premium ? 'Downgrade' : 'Current Plan'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 bg-zinc-900 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Popular
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$5</span>
              <span className="text-zinc-400">/month</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                <ChevronRight size={14} />
              </div>
              Unlimited card scans
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                <ChevronRight size={14} />
              </div>
              Advanced Gemini AI extraction
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                <ChevronRight size={14} />
              </div>
              Priority support
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                <ChevronRight size={14} />
              </div>
              Cloud backup & sync
            </li>
          </ul>

          <button 
            onClick={onSubscribe}
            disabled={!!user.is_premium}
            className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${
              user.is_premium 
                ? 'bg-zinc-800 text-zinc-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {user.is_premium ? 'Active Subscription' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Auth = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            <Scan size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-zinc-900">CardScan Pro</h1>
          <p className="text-zinc-500 mt-2">The professional way to manage contacts.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field" 
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 text-lg mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-indigo-600 hover:text-indigo-700"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    if (!user) return;
    const res = await fetch(`/api/cards?userId=${user.id}`);
    const data = await res.json();
    setCards(data);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSaveCard = async (cardData: any) => {
    if (!user) return;
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cardData, user_id: user.id })
    });
    
    if (res.ok) {
      // Refresh user to get updated scan count
      const updatedUser = { ...user, scan_count: user.scan_count + 1 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      fetchCards();
      setActiveTab('dashboard');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to save card');
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.ok) {
      const updatedUser = { ...user, is_premium: 1 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Welcome to Pro! You now have unlimited scans.');
    }
  };

  if (loading) return null;

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 lg:ml-64 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  cards={cards} 
                  user={user} 
                  onScanClick={() => setActiveTab('scan')} 
                />
              )}
              {activeTab === 'scan' && (
                <Scanner 
                  user={user} 
                  onSave={handleSaveCard} 
                  onCancel={() => setActiveTab('dashboard')} 
                />
              )}
              {activeTab === 'cards' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-display font-bold text-zinc-900">My Cards</h2>
                    <p className="text-zinc-500">Manage all your scanned business cards.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.map(card => (
                      <div key={card.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-zinc-100 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100">
                            {card.image_url ? (
                              <img src={card.image_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <CreditCard size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-zinc-900 truncate">{card.name}</h3>
                            <p className="text-sm text-zinc-500 truncate">{card.title}</p>
                            <p className="text-sm text-indigo-600 font-medium truncate">{card.company}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {card.email && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600">
                              <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">@</div>
                              <span className="truncate">{card.email}</span>
                            </div>
                          )}
                          {card.phone && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600">
                              <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">#</div>
                              <span className="truncate">{card.phone}</span>
                            </div>
                          )}
                        </div>

                        {card.notes && (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-amber-900 line-clamp-3 italic">"{card.notes}"</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-sm font-medium transition-colors">
                            View Details
                          </button>
                          <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'subscription' && (
                <Subscription user={user} onSubscribe={handleSubscribe} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
