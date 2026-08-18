import React from 'react';
import { X, ExternalLink, Key, ShieldCheck, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

export default function InstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d1424]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-fb-blue/20 text-fb-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hướng Dẫn & Giải Đáp Facebook Graph API</h3>
              <p className="text-xs text-slate-400">Cách lấy Access Token và các lưu ý phân quyền Fanpage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Section 1: Access Token */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-fb-accent flex items-center space-x-1.5">
              <Key className="w-4 h-4" />
              <span>1. Cách lấy Facebook Access Token (EAAB / EAAG / EAA...)</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                Bật trình duyệt và truy cập trang Meta Graph API Explorer:{' '}
                <a
                  href="https://developers.facebook.com/tools/explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fb-blue hover:underline font-semibold inline-flex items-center space-x-1"
                >
                  <span>Meta Graph Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Tạo một <strong>User Access Token</strong> có tích chọn các quyền (Permissions):</li>
              <div className="flex flex-wrap gap-1.5 my-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">pages_manage_metadata</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">pages_read_engagement</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">pages_show_list</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">business_management</span>
              </div>
              <li>Bấm nút <strong>Generate Access Token</strong> và chấp nhận các quyền phân bổ.</li>
            </ul>
          </div>

          {/* Section 2: Share Modes Explanation */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <h4 className="font-bold text-sm text-cyan-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Giải thích 3 Chế độ Phân quyền (Graph API Endpoints)</span>
            </h4>
            <div className="space-y-2 bg-[#090e1a] p-3 rounded-xl border border-slate-800">
              <div>
                <p className="font-semibold text-white">🔹 Chế độ 1: Assigned Users (`/{'{page-id}'}/assigned_users`)</p>
                <p className="text-slate-400">
                  Dành cho New Page Experience & Business Manager. Gán quyền chi tiết theo từng nhiệm vụ (`MANAGE`, `CREATE_CONTENT`, `MODERATE`, `ADVERTISE`, `ANALYZE`).
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">🔹 Chế độ 2: BM Agency Share (`/{'{page-id}'}/agencies`)</p>
                <p className="text-slate-400">
                  Chia sẻ Fanpage cho tài khoản Doanh nghiệp (Business Manager ID). Phù hợp cho Agency / Partner quản lý nhiều Fanpage.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">🔹 Chế độ 3: Legacy Page Roles (`/{'{page-id}'}/roles`)</p>
                <p className="text-slate-400">
                  Chế độ gán vai trò truyền thống theo UID (`ADMINISTER`, `EDIT`, `MODERATE`, `CREATE_ADS`, `ANALYZE`).
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Common Meta API Errors */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <h4 className="font-bold text-sm text-amber-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>3. Khắc phục các lỗi thường gặp từ Meta Graph API</span>
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <p>
                <strong className="text-rose-400">Lỗi Code 100 ("User ID is not business scoped"):</strong> Thường xuất hiện ở Chế độ Assigned Users khi tài khoản chưa liên kết Business Manager. Cách khắc phục: Chuyển sang chế độ <strong>BM Agency Share</strong> hoặc <strong>Legacy Roles</strong>.
              </p>
              <p>
                <strong className="text-rose-400">Lỗi Code 200 ("Permissions error"):</strong> Token của bạn không đủ quyền quản trị cao nhất trên Page đó hoặc Token bị hỏng/hết hạn.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1424] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-fb-blue hover:bg-fb-hover text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>

      </div>
    </div>
  );
}
