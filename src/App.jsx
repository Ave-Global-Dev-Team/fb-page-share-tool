import React, { useState, useRef } from 'react';
import Header from './components/Header';
import TokenAnalyzer from './components/TokenAnalyzer';
import PageSelector from './components/PageSelector';
import ShareConfig from './components/ShareConfig';
import LiveProgress from './components/LiveProgress';
import LogConsole from './components/LogConsole';
import InstructionsModal from './components/InstructionsModal';
import { shareSinglePage, batchSharePages, getPages } from './api/fbApi';

export default function App() {
  // 1. Token & User State
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // 2. Fanpage List & Selection State
  const [pages, setPages] = useState([]);
  const [selectedPageIds, setSelectedPageIds] = useState([]);

  // 3. Share Configuration State
  const [targetId, setTargetId] = useState('');
  const [shareMode, setShareMode] = useState('assigned_users'); // 'assigned_users' | 'agencies' | 'roles'
  const [selectedTasks, setSelectedTasks] = useState(['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE']);
  const [selectedRole, setSelectedRole] = useState('ADMINISTER');
  const [businessId, setBusinessId] = useState('');
  const [delayMs, setDelayMs] = useState(1000);
  const [useBatch, setUseBatch] = useState(false);

  // 4. Execution & Logging State
  const [processStatus, setProcessStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [logs, setLogs] = useState([]);
  const [progressStats, setProgressStats] = useState({ total: 0, current: 0, success: 0, failed: 0 });
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Control Refs for async loop pause / cancellation
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);

  // Helper for timestamp string
  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
  };

  // Auto trigger fetching pages when Token is verified
  const handleFetchPages = async (activeToken) => {
    const res = await getPages(activeToken || token);
    if (res.success && res.pages) {
      setPages(res.pages);
      setSelectedPageIds(res.pages.map(p => p.id));
    }
  };

  // Main Processing Runner
  const startProcess = async (overridePagesToProcess = null) => {
    if (!token.trim()) return alert('Vui lòng nhập Facebook Access Token');
    if (!targetId.trim()) return alert('Vui lòng nhập ID tài khoản nhận (Target ID)');

    const targetPages = overridePagesToProcess || pages.filter(p => selectedPageIds.includes(p.id));
    if (targetPages.length === 0) return alert('Chưa chọn Fanpage nào để thực thi');

    setProcessStatus('running');
    isPausedRef.current = false;
    isStoppedRef.current = false;

    if (!overridePagesToProcess) {
      setLogs([]);
      setProgressStats({
        total: targetPages.length,
        current: 0,
        success: 0,
        failed: 0
      });
    }

    let successCount = overridePagesToProcess ? progressStats.success : 0;
    let failedCount = overridePagesToProcess ? progressStats.failed : 0;

    if (useBatch) {
      // BATCH EXECUTION MODE
      const BATCH_SIZE = 20;
      for (let i = 0; i < targetPages.length; i += BATCH_SIZE) {
        if (isStoppedRef.current) break;
        while (isPausedRef.current) {
          await new Promise(r => setTimeout(r, 500));
          if (isStoppedRef.current) break;
        }

        const chunk = targetPages.slice(i, i + BATCH_SIZE);
        
        // Add processing log placeholder
        chunk.forEach(p => {
          setLogs(prev => [
            {
              time: getTimestamp(),
              pageId: p.id,
              pageName: p.name,
              targetId: targetId.trim(),
              mode: shareMode,
              status: 'processing',
              message: 'Đang gửi batch request tới Meta API...'
            },
            ...prev
          ]);
        });

        const batchRes = await batchSharePages({
          accessToken: token.trim(),
          pages: chunk,
          targetId: targetId.trim(),
          shareMode,
          tasks: selectedTasks,
          role: selectedRole,
          businessId: businessId.trim() || undefined
        });

        if (batchRes.success && Array.isArray(batchRes.results)) {
          batchRes.results.forEach(res => {
            if (res.success) {
              successCount++;
            } else {
              failedCount++;
            }

            setLogs(prev => [
              {
                time: getTimestamp(),
                pageId: res.pageId,
                pageName: res.pageName,
                targetId: targetId.trim(),
                mode: shareMode,
                status: res.success ? 'success' : 'error',
                message: res.success ? 'Chia sẻ quyền thành công' : (res.error?.message || 'Lỗi Meta API'),
                suggestion: res.error?.suggestion || ''
              },
              ...prev.filter(l => l.pageId !== res.pageId)
            ]);
          });
        } else {
          chunk.forEach(p => {
            failedCount++;
            setLogs(prev => [
              {
                time: getTimestamp(),
                pageId: p.id,
                pageName: p.name,
                targetId: targetId.trim(),
                mode: shareMode,
                status: 'error',
                message: batchRes.error?.message || 'Lỗi Batch Request',
                suggestion: ''
              },
              ...prev.filter(l => l.pageId !== p.id)
            ]);
          });
        }

        const currentProcessed = Math.min(i + BATCH_SIZE, targetPages.length);
        setProgressStats(prev => ({
          ...prev,
          current: currentProcessed,
          success: successCount,
          failed: failedCount
        }));

        if (i + BATCH_SIZE < targetPages.length && delayMs > 0) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    } else {
      // SEQUENTIAL / SINGLE REQUEST MODE
      let currentIdx = 0;
      for (const page of targetPages) {
        if (isStoppedRef.current) break;

        while (isPausedRef.current) {
          await new Promise(r => setTimeout(r, 500));
          if (isStoppedRef.current) break;
        }

        currentIdx++;

        // Add processing state to log
        setLogs(prev => [
          {
            time: getTimestamp(),
            pageId: page.id,
            pageName: page.name,
            targetId: targetId.trim(),
            mode: shareMode,
            status: 'processing',
            message: 'Đang gửi request...'
          },
          ...prev
        ]);

        const res = await shareSinglePage({
          accessToken: token.trim(),
          pageId: page.id,
          targetId: targetId.trim(),
          shareMode,
          tasks: selectedTasks,
          role: selectedRole,
          businessId: businessId.trim() || undefined
        });

        if (res.success) {
          successCount++;
        } else {
          failedCount++;
        }

        setLogs(prev => [
          {
            time: getTimestamp(),
            pageId: page.id,
            pageName: page.name,
            targetId: targetId.trim(),
            mode: shareMode,
            status: res.success ? 'success' : 'error',
            message: res.success ? 'Thành công' : (res.error?.message || 'Lỗi không xác định'),
            suggestion: res.suggestion || ''
          },
          ...prev.filter(l => !(l.pageId === page.id && l.status === 'processing'))
        ]);

        setProgressStats({
          total: targetPages.length,
          current: currentIdx,
          success: successCount,
          failed: failedCount
        });

        // Delay between requests to avoid rate limit
        if (currentIdx < targetPages.length && delayMs > 0) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }

    setProcessStatus('completed');
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setProcessStatus('paused');
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setProcessStatus('running');
  };

  const handleStop = () => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    setProcessStatus('completed');
  };

  const handleRetryFailed = () => {
    const failedLogPageIds = logs.filter(l => l.status === 'error').map(l => l.pageId);
    const failedPagesList = pages.filter(p => failedLogPageIds.includes(p.id));
    if (failedPagesList.length === 0) return alert('Không có Page nào bị lỗi để thử lại');

    startProcess(failedPagesList);
  };

  const handleExportLogs = () => {
    if (logs.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,Thời gian,Page ID,Tên Page,Target ID,Chế độ,Trạng thái,Thông điệp\n';
    logs.forEach(l => {
      const line = `"${l.time}","${l.pageId}","${l.pageName.replace(/"/g, '""')}","${l.targetId}","${l.mode}","${l.status}","${(l.message || '').replace(/"/g, '""')}"`;
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fb_page_share_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header onOpenGuide={() => setIsGuideOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Step 1: Token Analyzer */}
        <TokenAnalyzer
          token={token}
          setToken={setToken}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          onFetchPages={handleFetchPages}
        />

        {/* Grid Step 2 & Step 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 2: Page Selector */}
          <PageSelector
            token={token}
            pages={pages}
            setPages={setPages}
            selectedPageIds={selectedPageIds}
            setSelectedPageIds={setSelectedPageIds}
          />

          {/* Step 3: Share Config */}
          <ShareConfig
            targetId={targetId}
            setTargetId={setTargetId}
            shareMode={shareMode}
            setShareMode={setShareMode}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            businessId={businessId}
            setBusinessId={setBusinessId}
            delayMs={delayMs}
            setDelayMs={setDelayMs}
            useBatch={useBatch}
            setUseBatch={setUseBatch}
          />
        </div>

        {/* Step 4: Execution & Live Progress */}
        <LiveProgress
          status={processStatus}
          progressStats={progressStats}
          onStart={() => startProcess()}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onRetryFailed={handleRetryFailed}
          onExportLogs={handleExportLogs}
          canStart={token.trim() && targetId.trim() && selectedPageIds.length > 0 && processStatus !== 'running'}
        />

        {/* Step 5: Realtime Log Console */}
        <LogConsole logs={logs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-[#070b14]">
        <p>FB Fanpage Permission Manager Tool &copy; 2026 - Powered by Facebook Graph API & Antigravity</p>
      </footer>

      {/* Guide Modal */}
      <InstructionsModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
