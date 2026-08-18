import axios from 'axios';

const API_BASE = '/api';

export async function debugToken(token) {
  try {
    const res = await axios.get(`${API_BASE}/debug-token`, {
      params: { token }
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // Fallback direct Meta Graph API call
    try {
      const fbRes = await axios.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: token,
          fields: 'id,name,picture{url},permissions'
        }
      });
      const permissions = (fbRes.data.permissions?.data || [])
        .filter(p => p.status === 'granted')
        .map(p => p.permission);

      return {
        success: true,
        user: {
          id: fbRes.data.id,
          name: fbRes.data.name,
          avatar: fbRes.data.picture?.data?.url,
          permissions
        }
      };
    } catch (directErr) {
      return {
        success: false,
        error: { message: directErr.message || 'Token không hợp lệ hoặc đã hết hạn.' }
      };
    }
  }
}

export async function getPages(token) {
  try {
    const res = await axios.get(`${API_BASE}/get-pages`, {
      params: { token }
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // Direct Graph API fallback
    try {
      const fbRes = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
        params: {
          access_token: token,
          fields: 'id,name,category,access_token,tasks,picture{url}',
          limit: 100
        }
      });
      const pages = (fbRes.data.data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Page',
        picture: p.picture?.data?.url,
        pageToken: p.access_token,
        tasks: p.tasks || []
      }));
      return { success: true, total: pages.length, pages };
    } catch (directErr) {
      return {
        success: false,
        error: { message: directErr.message || 'Không thể tải danh sách Fanpage từ Token.' }
      };
    }
  }
}

export async function shareSinglePage(params) {
  try {
    const res = await axios.post(`${API_BASE}/share-page`, params);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: { message: error.message || 'Lỗi mạng khi kết nối tới máy chủ API.' }
    };
  }
}

export async function batchSharePages(params) {
  try {
    const res = await axios.post(`${API_BASE}/batch-share`, params);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: { message: error.message || 'Lỗi gửi yêu cầu batch.' }
    };
  }
}
