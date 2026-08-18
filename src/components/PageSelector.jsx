import React, { useState } from 'react';
import { Layers, Download, PlusCircle, Search, CheckSquare, Square, Filter, RefreshCw, Loader2, FileText } from 'lucide-react';
import { getPages } from '../api/fbApi';

export default function PageSelector({ token, pages, setPages, selectedPageIds, setSelectedPageIds }) {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'manual'
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchMsg, setFetchMsg] = useState('');

  // Auto fetch pages from Meta API using token
  const handleFetchPages = async (activeToken = token) => {
    if (!activeToken.trim()) {
      setFetchMsg('Vui lòng nhập Token trước khi tải Fanpage.');
      return;
    }
    setLoading(true);
    setFetchMsg('');

    const result = await getPages(activeToken.trim());
    setLoading(false);

    if (result.success && result.pages) {
      setPages(result.pages);
      // Select all by default
      setSelectedPageIds(result.pages.map(p => p.id));
      setFetchMsg(`Đã tải thành công ${result.pages.length} Fanpage từ Token.`);
    } else {
      setFetchMsg(result.error?.message || 'Không thể tải Fanpage. Hãy nhập danh sách ID thủ công.');
    }
  };

  // Process manually pasted Page IDs
  const handleParseManualPages = () => {
    if (!manualText.trim()) return;

    const lines = manualText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const parsedPages = [];
    lines.forEach((line, index) => {
      // Extract numeric ID if user pastes full URL or formatted string (e.g. 100064789123 or https://facebook.com/100064789123)
      let pageId = line;
      const match = line.match(/(?:facebook\.com\/(?:pages\/[^\/]+\/)?|id=)?(\d{8,})/i);
      if (match && match[1]) {
        pageId = match[1];
      }

      parsedPages.push({
        id: pageId,
        name: `Page ID: ${pageId}`,
        category: 'Nhập thủ công',
        picture: null,
        pageToken: null
      });
    });

    // Remove duplicates
    const uniqueMap = new Map();
    [...pages, ...parsedPages].forEach(p => uniqueMap.set(p.id, p));
    const updatedList = Array.from(uniqueMap.values());

    setPages(updatedList);
    setSelectedPageIds(updatedList.map(p => p.id));
    setManualText('');
    setActiveTab('auto');
  };

  const toggleSelectAll = () => {
    if (selectedPageIds.length === filteredPages.length) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(filteredPages.map(p => p.id));
    }
  };

  const togglePageSelect = (id) => {
    if (selectedPageIds.includes(id)) {
      setSelectedPageIds(selectedPageIds.filter(item => item !== id));
    } else {
      setSelectedPageIds([...selectedPageIds, id]);
    }
  };

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.includes(searchQuery)
  );

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">2. Danh sách Fanpage Cần Share ({pages.length})</h2>
            <p className="text-xs text-slate-400">Tải tự động từ Token hoặc dán thủ công danh sách Page ID</p>
          </div>
        </div>

        {/* Tab Mode Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'auto'
                ? 'bg-fb-blue text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quét Từ Token
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'manual'
                ? 'bg-fb-blue text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nhập Thủ Công ID
          </button>
        </div>
      </div>

      {/* AUTO TAB */}
      {activeTab === 'auto' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên Fanpage hoặc Page ID..."
                className="w-full bg-[#0a1120] text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:border-fb-blue outline-none"
              />
            </div>

            {/* Fetch & Selection Controls */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleFetchPages()}
                disabled={loading || !token.trim()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs border border-slate-700 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Quét Lại Page</span>
              </button>

              <button
                onClick={toggleSelectAll}
                disabled={filteredPages.length === 0}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all cursor-pointer"
              >
                {selectedPageIds.length === filteredPages.length && filteredPages.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-fb-accent" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{selectedPageIds.length === filteredPages.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}</span>
              </button>
            </div>
          </div>

          {fetchMsg && (
            <p className="text-xs text-cyan-400/90 italic bg-cyan-950/30 border border-cyan-900/40 p-2 rounded-lg">
              {fetchMsg}
            </p>
          )}

          {/* Page List Table / Grid Container */}
          <div className="max-h-60 overflow-y-auto pr-1 space-y-2 border border-slate-800/80 rounded-xl bg-[#090e1a] p-2">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => {
                const isSelected = selectedPageIds.includes(page.id);
                return (
                  <div
                    key={page.id}
                    onClick={() => togglePageSelect(page.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-fb-blue/10 border-fb-blue/40 text-white'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div
                        className="w-4 h-4 rounded text-fb-blue focus:ring-fb-blue bg-slate-800 border-slate-700"
                      />
                      {page.picture ? (
                        <img src={page.picture} alt={page.name} className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          FP
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold leading-tight">{page.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {page.id}</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
                      {page.category}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Chưa có Fanpage nào. Bấm nút "Quét Từ Token" hoặc sang tab "Nhập Thủ Công ID".</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Đã chọn <strong className="text-fb-accent">{selectedPageIds.length}</strong> / {pages.length} Fanpage</span>
            {pages.length > 0 && (
              <button
                onClick={() => setPages([])}
                className="text-rose-400 hover:underline"
              >
                Xóa toàn bộ danh sách
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MANUAL TAB */
        <div className="space-y-3">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={`Dán danh sách ID Fanpage hoặc đường dẫn Page (Mỗi dòng 1 ID/Link):\nVí dụ:\n100064789123456\n100089123456789\nhttps://facebook.com/100099988877766`}
            rows={6}
            className="w-full bg-[#0a1120] text-slate-200 text-xs font-mono p-3 rounded-xl border border-slate-800 focus:border-fb-blue outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleParseManualPages}
              disabled={!manualText.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Vào Danh Sách ({manualText.split('\n').filter(l => l.trim()).length} ID)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
