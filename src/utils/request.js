import axios from 'axios';

const service = axios.create({
  baseURL: '/api', // 请求的API前缀
  timeout: 5000
});

// 请求拦截器
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // 在请求头中添加 Token
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
service.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'; // 如果返回401，跳转到登录页面
    }
    return Promise.reject(error);
  }
);

export default service;
