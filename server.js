import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const FB_GRAPH_URL = 'https://graph.facebook.com/v18.0';

// Helper function to extract Graph API errors clearly
function formatFbError(error) {
  if (error.response && error.response.data && error.response.data.error) {
    const err = error.response.data.error;
    let detailMsg = err.message || 'Lỗi không xác định từ Facebook API';
    if (err.error_user_title) {
      detailMsg += ` - ${err.error_user_title}: ${err.error_user_msg}`;
    }
    return {
      code: err.code || 400,
      subcode: err.error_subcode || null,
      type: err.type || 'OAuthException',
      message: detailMsg,
      fbTraceId: err.fbtrace_id
    };
  }
  return {
    code: 500,
    message: error.message || 'Không thể kết nối đến máy chủ Facebook Graph API'
  };
}

// 1. Check & Debug Access Token
app.get('/api/debug-token', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Thiếu Facebook Access Token' });
  }

  try {
    // Call /me to get user info and granted permissions
    const meRes = await axios.get(`${FB_GRAPH_URL}/me`, {
      params: {
        access_token: token,
        fields: 'id,name,picture{url},permissions'
      }
    });

    const userData = meRes.data;
    const permissions = userData.permissions?.data || [];
    const activePermissions = permissions
      .filter(p => p.status === 'granted')
      .map(p => p.permission);

    return res.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        avatar: userData.picture?.data?.url,
        permissions: activePermissions
      }
    });
  } catch (error) {
    const formattedError = formatFbError(error);
    return res.status(400).json({
      success: false,
      error: formattedError
    });
  }
});

// 2. Fetch All Pages Managed by Token
app.get('/api/get-pages', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Thiếu Facebook Access Token' });
  }

  try {
    let allPages = [];
    let nextUrl = `${FB_GRAPH_URL}/me/accounts?access_token=${encodeURIComponent(token)}&fields=id,name,category,access_token,tasks,picture{url}&limit=100`;

    // Fetch pages with pagination support
    let attempts = 0;
    while (nextUrl && attempts < 5) {
      attempts++;
      const response = await axios.get(nextUrl);
      const data = response.data;

      if (data.data && Array.isArray(data.data)) {
        allPages.push(...data.data.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Page',
          picture: p.picture?.data?.url,
          pageToken: p.access_token,
          tasks: p.tasks || []
        })));
      }

      nextUrl = data.paging?.next || null;
    }

    return res.json({
      success: true,
      total: allPages.length,
      pages: allPages
    });
  } catch (error) {
    const formattedError = formatFbError(error);
    return res.status(400).json({
      success: false,
      error: formattedError
    });
  }
});

// 3. Share Page Access (Single Request Endpoint)
app.post('/api/share-page', async (req, res) => {
  const {
    accessToken,
    pageId,
    targetId,
    shareMode = 'assigned_users', // 'assigned_users' | 'agencies' | 'roles'
    tasks = ['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE'],
    role = 'ADMINISTER',
    businessId
  } = req.body;

  if (!accessToken || !pageId || !targetId) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc: Access Token, Page ID, hoặc Target ID'
    });
  }

  const cleanPageId = pageId.trim();
  const cleanTargetId = targetId.trim();

  try {
    let fbEndpoint = '';
    let formData = new URLSearchParams();
    formData.append('access_token', accessToken);

    if (shareMode === 'assigned_users') {
      // New Page Experience / BM Asset User Assignment
      fbEndpoint = `${FB_GRAPH_URL}/${cleanPageId}/assigned_users`;
      formData.append('user', cleanTargetId);
      formData.append('tasks', JSON.stringify(tasks));
      if (businessId) {
        formData.append('business', businessId);
      }
    } else if (shareMode === 'agencies') {
      // Partner / Agency Business Manager Access
      fbEndpoint = `${FB_GRAPH_URL}/${cleanPageId}/agencies`;
      formData.append('business', cleanTargetId);
      formData.append('permitted_tasks', JSON.stringify(tasks));
    } else if (shareMode === 'roles') {
      // Classic Page Roles Assignment
      fbEndpoint = `${FB_GRAPH_URL}/${cleanPageId}/roles`;
      formData.append('user', cleanTargetId);
      formData.append('role', role);
    } else {
      return res.status(400).json({ success: false, message: 'Chế độ share (shareMode) không hợp lệ' });
    }

    const response = await axios.post(fbEndpoint, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return res.json({
      success: true,
      pageId: cleanPageId,
      targetId: cleanTargetId,
      result: response.data
    });
  } catch (error) {
    const formattedError = formatFbError(error);

    // Provide friendly suggestion for common errors
    let suggestion = '';
    if (formattedError.code === 100 || formattedError.message.includes('not business scoped')) {
      suggestion = 'Gợi ý: ID tài khoản cần phải là Business-Scoped ID hoặc thử chuyển sang chế độ Legacy Roles / BM Agency Share.';
    } else if (formattedError.code === 200 || formattedError.message.includes('permission')) {
      suggestion = 'Gợi ý: Token hiện tại không đủ quyền trên Page này (Cần quyền pages_manage_metadata hoặc MANAGE).';
    }

    return res.status(400).json({
      success: false,
      pageId: cleanPageId,
      targetId: cleanTargetId,
      error: formattedError,
      suggestion
    });
  }
});

// 4. Batch Share Endpoint
app.post('/api/batch-share', async (req, res) => {
  const {
    accessToken,
    pages, // Array of { id, name }
    targetId,
    shareMode = 'assigned_users',
    tasks = ['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE'],
    role = 'ADMINISTER',
    businessId
  } = req.body;

  if (!accessToken || !pages || !Array.isArray(pages) || pages.length === 0 || !targetId) {
    return res.status(400).json({ success: false, message: 'Danh sách Page hoặc tham số không hợp lệ' });
  }

  // Construct Meta Graph API Batch Payload
  const batchCalls = pages.map((page, index) => {
    let relativeUrl = '';
    let bodyParams = new URLSearchParams();

    if (shareMode === 'assigned_users') {
      relativeUrl = `${page.id}/assigned_users`;
      bodyParams.append('user', targetId);
      bodyParams.append('tasks', JSON.stringify(tasks));
      if (businessId) bodyParams.append('business', businessId);
    } else if (shareMode === 'agencies') {
      relativeUrl = `${page.id}/agencies`;
      bodyParams.append('business', targetId);
      bodyParams.append('permitted_tasks', JSON.stringify(tasks));
    } else {
      relativeUrl = `${page.id}/roles`;
      bodyParams.append('user', targetId);
      bodyParams.append('role', role);
    }

    return {
      method: 'POST',
      relative_url: relativeUrl,
      body: bodyParams.toString(),
      name: `req_${index}`
    };
  });

  try {
    const formData = new URLSearchParams();
    formData.append('access_token', accessToken);
    formData.append('batch', JSON.stringify(batchCalls));

    const response = await axios.post(FB_GRAPH_URL, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const batchResults = response.data.map((resItem, idx) => {
      const page = pages[idx];
      const statusCode = resItem.code;
      let bodyData = null;
      try {
        bodyData = JSON.parse(resItem.body);
      } catch (e) {
        bodyData = resItem.body;
      }

      const isSuccess = statusCode >= 200 && statusCode < 300 && (bodyData.success || bodyData === true || bodyData.id);

      return {
        pageId: page.id,
        pageName: page.name || page.id,
        success: isSuccess,
        statusCode,
        data: isSuccess ? bodyData : null,
        error: !isSuccess ? (bodyData?.error ? formatFbError({ response: { data: bodyData } }) : bodyData) : null
      };
    });

    return res.json({
      success: true,
      results: batchResults
    });
  } catch (error) {
    const formattedError = formatFbError(error);
    return res.status(500).json({
      success: false,
      error: formattedError
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Facebook Page Share Tool Proxy Server đang chạy tại http://localhost:${PORT}`);
});
