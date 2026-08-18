import React from 'react';
import { Share2, ShieldCheck, HelpCircle, Zap, ExternalLink } from 'lucide-react';

export default function Header({ onOpenGuide }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fb-blue via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-fb-blue/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
              <Share2 className="w-5 h-5 text-fb-accent" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-fb-accent bg-clip-text text-transparent">
                Meta Page Share Manager
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-fb-blue/20 text-fb-accent border border-fb-blue/30">
                v2.0 Token API
              </span>
            </div>
            <p className="text-xs text-slate-400">Tự động hóa chia sẻ quyền quản trị Fanpage Facebook hàng loạt</p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Graph API v18.0 / v26.0</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-fb-blue" />
            <span>Hướng dẫn & Lấy Token</span>
          </button>

          <a
            href="https://developers.facebook.com/tools/explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <span>Meta Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </header>
  );
}
