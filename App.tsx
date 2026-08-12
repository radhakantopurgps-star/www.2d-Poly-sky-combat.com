import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Play, Shield, Zap, Crosshair } from 'lucide-react';
import bannerImg from './assets/images/clean_sky_combat_banner_1786092340513.jpg';

const dict = {
  en: {
    title: '2D Poly Sky Combat',
    subtitle: 'Prepare for the ultimate aerial battle!',
    description: 'Navigate your advanced jet through treacherous mountains, dodge enemy fire, and defeat epic bosses in this fast-paced low-poly shooter.',
    playNow: 'Play Now',
    langLabel: 'বাংলা',
    features: [
      { title: 'Endless Gameplay', desc: 'Survive as long as you can', icon: 'Crosshair' },
      { title: 'Epic Boss Fights', desc: 'Face massive enemy ships', icon: 'Zap' },
      { title: 'Power-ups', desc: 'Collect shields and health', icon: 'Shield' }
    ]
  },
  bn: {
    title: '২ডি পলি স্কাই কমব্যাট',
    subtitle: 'চূড়ান্ত আকাশযুদ্ধের জন্য প্রস্তুত হোন!',
    description: 'বিপজ্জনক পাহাড়ের মধ্য দিয়ে আপনার আধুনিক জেট চালান, শত্রুর গুলি এড়িয়ে চলুন এবং এই দ্রুত গতির লো-পলি শ্যুটারে ভয়ংকর বসদের পরাজিত করুন।',
    playNow: 'এখনই খেলুন',
    langLabel: 'English',
    features: [
      { title: 'অন্তহীন গেমপ্লে', desc: 'যতক্ষণ সম্ভব টিকে থাকুন', icon: 'Crosshair' },
      { title: 'ভয়ংকর বস ফাইট', desc: 'বিশাল শত্রু জাহাজের মুখোমুখি হোন', icon: 'Zap' },
      { title: 'পাওয়ার-আপ', desc: 'শিল্ড এবং হেলথ সংগ্রহ করুন', icon: 'Shield' }
    ]
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.getAttribute("data-adsbygoogle-status") && !isPlaying) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e: any) {
        if (e.message && e.message.includes("already have ads")) {
          // ignore this error
        } else {
          console.error("AdSense error:", e);
        }
      }
    }
  }, [isPlaying, lang]);

  const t = dict[lang];

  const getIcon = (name: string) => {
    switch(name) {
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-cyan-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-pink-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-cyan-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d0e15] text-white flex justify-center items-center font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* 9:16 Aspect Ratio Container */}
      <div className="w-full h-[100dvh] sm:h-[95dvh] sm:aspect-[9/16] bg-[#0d0e15] relative sm:rounded-[2.5rem] sm:border-[8px] border-white/5 sm:shadow-[0_0_80px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col">
        
        {isPlaying ? (
          <iframe src="/game/index.html" className="w-full h-full border-none outline-none bg-[#0d0e15]" title="Game Frame" />
        ) : (
          <div className="w-full h-full overflow-y-auto overflow-x-hidden relative custom-scrollbar">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] bg-cyan-600/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-20%] w-[70%] h-[40%] bg-pink-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 px-5 py-5 flex justify-between items-center">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base font-bold tracking-wider text-cyan-400"
              >
                Poly Sky
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium backdrop-blur"
              >
                <Globe size={14} className="text-cyan-400" />
                {t.langLabel}
              </motion.button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-5 pb-10 flex flex-col items-center">
              
              <div className="w-full text-center space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <img 
                      src={bannerImg} 
                      alt="Game Banner" 
                      className="w-full aspect-[4/3] object-cover rounded-2xl shadow-[0_8px_30px_rgba(6,182,212,0.15)] border border-white/10 mb-6" 
                    />
                    <h2 className="text-cyan-400 font-bold tracking-[0.2em] text-[10px] uppercase">
                      {t.subtitle}
                    </h2>
                    <h1 className="text-4xl font-black tracking-tight leading-none px-2">
                      {t.title.split(' ').map((word, i) => (
                        <span key={i} className={i === 0 ? "text-pink-500" : ""}>
                          {word}{' '}
                        </span>
                      ))}
                    </h1>
                    <p className="text-sm text-slate-400 leading-relaxed px-2 pt-2">
                      {t.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-4"
                >
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group relative inline-flex items-center justify-center gap-2 w-full max-w-[240px] px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                  >
                    <Play fill="currentColor" size={20} />
                    <span>{t.playNow}</span>
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d0e15] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>

                {/* Features List */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={lang + 'features'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex flex-col w-full gap-4 pt-8 px-2"
                  >
                    {t.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur text-left hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4">
                          {getIcon(feature.icon)}
                        </div>
                        <h3 className="font-semibold text-base text-white mb-1.5">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* AdSense Unit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="w-full flex justify-center mt-6 overflow-hidden z-20 relative bg-white/5 rounded-xl border border-white/10 items-center min-h-[90px]"
                >
                  <ins ref={adRef} className="adsbygoogle"
                       style={{ display: 'inline-block', width: '100%', height: '90px' }}
                       data-ad-client="ca-pub-1642204131240968"
                       data-ad-slot="4547210085"></ins>
                  <span className="absolute text-white/20 text-[10px] -z-10 tracking-[0.2em] font-bold uppercase">Advertisement</span>
                </motion.div>

              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

