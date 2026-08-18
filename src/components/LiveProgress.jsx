import React from 'react';
import { Play, Pause, RotateCcw, StopCircle, Download, CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react';

export default function LiveProgress({
  status, // 'idle' | 'running' | 'paused' | 'completed'
  progressStats, // { total, current, success, failed }
  onStart,
  onPause,
  onResume,
  onStop,
  onRetryFailed,
  onExportLogs,
  canStart
}) {
  const { total = 0, current = 0, success = 0, failed = 0 } = progressStats;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">4. Tiến Trình Thực Thi & Thao Tác</h2>
            <p className="text-xs text-slate-400">Điều khiển tiến trình xử lý chia sẻ quyền Fanpage</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {status === 'idle' || status === 'completed' ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BẮT ĐẦU CHIA SẺ FANPAGE</span>
            </button>
          ) : null}

          {status === 'running' && (
            <button
              onClick={onPause}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>TẠM DỪNG</span>
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={onResume}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TIẾP TỤC</span>
            </button>
          )}

          {(status === 'running' || status === 'paused') && (
            <button
              onClick={onStop}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              <span>DỪNG HẲN</span>
            </button>
          )}

          {failed > 0 && status !== 'running' && (
            <button
              onClick={onRetryFailed}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>THỬ LẠI {failed} PAGE LỖI</span>
            </button>
          )}

          <button
            onClick={onExportLogs}
            disabled={current === 0}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>XUẤT LOG (CSV)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Tiến trình xử lý: {current} / {total} Fanpage</span>
          <span className="text-fb-accent font-mono text-sm">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-fb-blue via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-[#0a1120] p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Tổng Fanpage đã chọn</span>
          <span className="text-xl font-extrabold text-white">{total}</span>
        </div>
        <div className="bg-[#0a1120] p-3 rounded-xl border border-emerald-500/20">
          <span className="text-[11px] text-emerald-400 block font-medium flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Thành công</span>
          </span>
          <span className="text-xl font-extrabold text-emerald-400 glow-green">{success}</span>
        </div>
        <div className="bg-[#0a1120] p-3 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-rose-400 block font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Thất bại / Lỗi</span>
          </span>
          <span className="text-xl font-extrabold text-rose-400">{failed}</span>
        </div>
        <div className="bg-[#0a1120] p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Còn lại</span>
          </span>
          <span className="text-xl font-extrabold text-slate-300">{total - current}</span>
        </div>
      </div>
    </div>
  );
}
