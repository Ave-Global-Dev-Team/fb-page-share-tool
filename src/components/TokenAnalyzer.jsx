import React, { useState } from 'react';
import { Key, CheckCircle2, XCircle, Loader2, UserCheck, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { debugToken } from '../api/fbApi';

export default function TokenAnalyzer({ token, setToken, userInfo, setUserInfo, onFetchPages }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCheckToken = async () => {
    if (!token.trim()) {
      setErrorMsg('Vui lòng nhập Facebook Access Token');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUserInfo(null);

    const result = await debugToken(token.trim());
    setLoading(false);

    if (result.success && result.user) {
      setUserInfo(result.user);
      // Automatically trigger fetching pages if token is valid
      if (onFetchPages) {
        onFetchPages(token.trim());
      }
    } else {
      setErrorMsg(result.error?.message || 'Token không hợp lệ hoặc không có quyền truy cập');
    }
  };

  const handleClear = () => {
    setToken('');
    setUserInfo(null);
    setErrorMsg(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-fb-blue/10 border border-fb-blue/20 text-fb-blue">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">1. Cấu hình Facebook Access Token</h2>
            <p className="text-xs text-slate-400">Nhập Token người dùng (User Access Token) có quyền quản trị Fanpage</p>
          </div>
        </div>

        {userInfo && (
          <span className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Token Hợp Lệ</span>
          </span>
        )}
      </div>

      {/* Input box & Check button */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Dán Facebook Access Token ở đây (EAAB..., EAAG..., EAA...)"
            rows={3}
            className="w-full bg-[#0a1120] text-slate-200 text-xs font-mono p-3 rounded-xl border border-slate-800 focus:border-fb-blue focus:ring-1 focus:ring-fb-blue outline-none transition-all resize-none shadow-inner"
          />
          {token && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700"
            >
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            * Khuyên dùng token từ tài khoản Admin/Business Manager có quyền <code className="text-fb-accent">pages_manage_metadata</code>.
          </p>

          <button
            onClick={handleCheckToken}
            disabled={loading || !token.trim()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fb-blue to-indigo-600 hover:from-fb-hover hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-fb-blue/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Kiểm tra & Tải Danh sách Page</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Không thể xác thực Token</p>
            <p className="text-rose-300/80 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* User Info Display Card */}
      {userInfo && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {userInfo.avatar ? (
              <img src={userInfo.avatar} alt={userInfo.name} className="w-10 h-10 rounded-full border border-fb-blue/40 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserCheck className="w-5 h-5 text-fb-blue" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{userInfo.name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  ID: {userInfo.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Xác thực thành công qua Facebook Graph API</p>
            </div>
          </div>

          {/* Granted permissions tags */}
          <div className="flex flex-wrap gap-1 max-w-md">
            {userInfo.permissions && userInfo.permissions.length > 0 ? (
              userInfo.permissions.slice(0, 6).map((perm, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-amber-400 italic">Chưa xác định danh sách quyền</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
