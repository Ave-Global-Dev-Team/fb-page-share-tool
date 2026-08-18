import React from 'react';
import { UserPlus, Settings, Sliders, ShieldCheck, Briefcase, User, Clock, AlertTriangle } from 'lucide-react';

export default function ShareConfig({
  targetId,
  setTargetId,
  shareMode,
  setShareMode,
  selectedTasks,
  setSelectedTasks,
  selectedRole,
  setSelectedRole,
  businessId,
  setBusinessId,
  delayMs,
  setDelayMs,
  useBatch,
  setUseBatch
}) {

  const ALL_TASKS = [
    { key: 'MANAGE', label: 'Quản trị viên (Full Control / Manage)', desc: 'Quyền cao nhất, quản lý toàn bộ Page & phân quyền người dùng' },
    { key: 'CREATE_CONTENT', label: 'Tạo nội dung (Create Content)', desc: 'Đăng bài, tạo tin, video, trả lời bình luận' },
    { key: 'MODERATE', label: 'Quản lý tin nhắn & bình luận (Moderate)', desc: 'Phản hồi tin nhắn Inbox, xóa comment spam' },
    { key: 'ADVERTISE', label: 'Tạo quảng cáo (Advertise)', desc: 'Tạo chiến dịch Ads, gắn pixel, thúc đẩy bài viết' },
    { key: 'ANALYZE', label: 'Xem thông tin trang (Analyze)', desc: 'Xem số liệu báo cáo, chỉ số reach và doanh thu' }
  ];

  const PRESETS = [
    {
      name: '👑 Quản Trị Viên (Full Control)',
      tasks: ['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE'],
      role: 'ADMINISTER'
    },
    {
      name: '✍️ Biên Tập Viên (Editor)',
      tasks: ['CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE'],
      role: 'EDIT'
    },
    {
      name: '💬 Quản Lý Tin Nhắn (Moderator)',
      tasks: ['MODERATE', 'ADVERTISE', 'ANALYZE'],
      role: 'MODERATE'
    },
    {
      name: '📢 Nhà Quảng Cáo (Advertiser)',
      tasks: ['ADVERTISE', 'ANALYZE'],
      role: 'CREATE_ADS'
    }
  ];

  const handleApplyPreset = (preset) => {
    setSelectedTasks(preset.tasks);
    setSelectedRole(preset.role);
  };

  const toggleTask = (taskKey) => {
    if (selectedTasks.includes(taskKey)) {
      setSelectedTasks(selectedTasks.filter(t => t !== taskKey));
    } else {
      setSelectedTasks([...selectedTasks, taskKey]);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">3. Thiết Lập Tài Khoản Nhận & Cấp Độ Quyền</h2>
          <p className="text-xs text-slate-400">Nhập ID tài khoản muốn nhận quyền và tùy chỉnh nhiệm vụ cấp phép</p>
        </div>
      </div>

      {/* Target User / BM ID Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tài Khoản / Business Manager Nhận Quyền <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Ví dụ User ID: 1000123456789 hoặc BM ID: 9876543210"
              className="w-full bg-[#0a1120] text-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:border-fb-blue outline-none font-mono"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            * Nhập User ID Facebook của nick nhận (hoặc Business Manager ID nếu share cho BM đối tác).
          </p>
        </div>

        {/* Share Mode Radio Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Phương Thức Phân Quyền Graph API
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#0a1120] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setShareMode('assigned_users')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                shareMode === 'assigned_users'
                  ? 'bg-fb-blue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Assigned User
            </button>
            <button
              onClick={() => setShareMode('agencies')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                shareMode === 'agencies'
                  ? 'bg-fb-blue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BM Agency Share
            </button>
            <button
              onClick={() => setShareMode('roles')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                shareMode === 'roles'
                  ? 'bg-fb-blue text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Legacy Roles
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {shareMode === 'assigned_users' && 'Dùng cho New Page Experience & Business Manager User assignment.'}
            {shareMode === 'agencies' && 'Chia sẻ toàn bộ Page sang Business Manager (BM) của Đối tác.'}
            {shareMode === 'roles' && 'Chế độ gán vai trò truyền thống (ADMINISTER, EDIT, MODERATE).'}
          </p>
        </div>
      </div>

      {/* Preset Permission Selection Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Chọn Nhanh Mức Quyền Phổ Biến:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-fb-blue/50 text-slate-200 text-xs font-medium transition-all text-left"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task Checkboxes (For assigned_users or agencies) */}
      {shareMode !== 'roles' ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Tùy Chỉnh Các Task Cần Phân Quyền (Tasks):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#090e1a] p-3 rounded-xl border border-slate-800">
            {ALL_TASKS.map((item) => {
              const checked = selectedTasks.includes(item.key);
              return (
                <label
                  key={item.key}
                  className={`flex items-start space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                    checked
                      ? 'bg-fb-blue/10 border-fb-blue/40 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTask(item.key)}
                    className="w-4 h-4 mt-0.5 rounded text-fb-blue focus:ring-fb-blue bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold block leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        /* Legacy Role Selector */
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Chọn Vai Trò (Legacy Role):
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-[#0a1120] text-slate-200 text-xs p-2.5 rounded-xl border border-slate-800 focus:border-fb-blue outline-none"
          >
            <option value="ADMINISTER">ADMINISTER - Quản trị viên cao nhất</option>
            <option value="EDIT">EDIT - Biên tập viên</option>
            <option value="MODERATE">MODERATE - Quản lý bình luận & nhắn tin</option>
            <option value="CREATE_ADS">CREATE_ADS - Tạo quảng cáo</option>
            <option value="ANALYZE">ANALYZE - Xem phân tích</option>
          </select>
        </div>
      )}

      {/* Delay & Performance Settings */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-fb-accent" />
              <span>Thời Gian Delay Giữa Các Page:</span>
            </span>
            <span className="text-fb-accent font-mono">{delayMs} ms ({delayMs / 1000} giây)</span>
          </div>
          <input
            type="range"
            min={200}
            max={5000}
            step={100}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fb-blue"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            * Cài đặt delay vừa phải (1000ms - 2000ms) để tránh bị giới hạn tần suất (Rate limit) từ Facebook.
          </p>
        </div>

        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-white block">Sử Dụng Graph API Batching</span>
            <span className="text-[10px] text-slate-400">Gộp tối đa 20 Page trong 1 request HTTP duy nhất</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useBatch}
              onChange={(e) => setUseBatch(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-fb-blue"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
