import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Loader2, Copy, Check, Filter } from 'lucide-react';

export default function LogConsole({ logs }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'success' | 'error'
  const [copiedIdx, setCopiedIdx] = useState(null);

  const filteredLogs = logs.filter(log => {
    if (filter === 'success') return log.status === 'success';
    if (filter === 'error') return log.status === 'error';
    return true;
  });

  const handleCopyLog = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-fb-accent">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">5. Nhật Ký Chi Tiết (Console Log)</h2>
            <p className="text-xs text-slate-400">Theo dõi kết quả trả về từ Facebook API theo thời gian thực</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-[#0a1120] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thành công ({logs.filter(l => l.status === 'success').length})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lỗi ({logs.filter(l => l.status === 'error').length})
          </button>
        </div>
      </div>

      {/* Log Console Table */}
      <div className="border border-slate-800 rounded-xl bg-[#070b14] overflow-hidden">
        <div className="max-h-72 overflow-y-auto font-mono text-xs">
          {filteredLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0d1424] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Fanpage (ID)</th>
                  <th className="py-2.5 px-3">Tài khoản nhận</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Chi tiết / Phản hồi API</th>
                  <th className="py-2.5 px-3 text-right">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log, index) => {
                  return (
                    <tr
                      key={index}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        log.status === 'success'
                          ? 'bg-emerald-950/10'
                          : log.status === 'error'
                          ? 'bg-rose-950/15'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 shrink-0 whitespace-nowrap text-[11px]">
                        {log.time}
                      </td>
                      <td className="py-2 px-3 text-slate-200">
                        <span className="font-semibold block">{log.pageName || log.pageId}</span>
                        <span className="text-[10px] text-slate-400">{log.pageId}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                        {log.targetId}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {log.status === 'processing' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Đang xử lý</span>
                          </span>
                        )}
                        {log.status === 'success' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Thành công</span>
                          </span>
                        )}
                        {log.status === 'error' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Thất bại</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 max-w-xs sm:max-w-md truncate">
                        {log.status === 'success' ? (
                          <span className="text-emerald-400 text-[11px]">
                            Đã chia sẻ quyền ({log.mode || 'Assigned User'}) thành công.
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-rose-300 text-[11px] font-semibold leading-tight">{log.message}</p>
                            {log.suggestion && (
                              <p className="text-amber-300/90 text-[10px] italic">{log.suggestion}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleCopyLog(`Page ID: ${log.pageId} | Status: ${log.status} | Info: ${log.message}`, index)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Sao chép dòng log"
                        >
                          {copiedIdx === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Chưa có dữ liệu nhật ký. Bấm "Bắt đầu chia sẻ Fanpage" để bắt đầu quá trình.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
