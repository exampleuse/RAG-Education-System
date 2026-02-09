import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Upload, Input, Space, Divider, Spin, Alert } from 'antd';
import { UploadOutlined, SendOutlined, FileTextOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function IndexPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理文件上传
  const handleUpload = async (file: any) => {
    setUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setUploadStatus({ type: 'success', message: `文档上传成功，分割为 ${result.chunks_count} 个片段` });
        message.success('文档上传成功');
      } else {
        setUploadStatus({ type: 'error', message: result.message });
        message.error(`上传失败：${result.message}`);
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: '上传失败，请检查后端服务是否运行' });
      message.error('上传失败，请检查后端服务是否运行');
    } finally {
      setUploading(false);
    }
    
    return false; // 阻止自动上传
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const newUserMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // 添加助手回复
        const newAssistantMessage = { role: 'assistant' as const, content: result.answer };
        setMessages(prev => [...prev, newAssistantMessage]);
      } else {
        // 添加错误消息
        const errorMessage = { role: 'assistant' as const, content: `错误：${result.message}` };
        setMessages(prev => [...prev, errorMessage]);
        message.error(result.message);
      }
    } catch (error) {
      // 添加网络错误消息
      const errorMessage = { role: 'assistant' as const, content: '错误：无法连接到后端服务，请检查服务是否运行' };
      setMessages(prev => [...prev, errorMessage]);
      message.error('无法连接到后端服务，请检查服务是否运行');
    } finally {
      setLoading(false);
    }
  };

  // 处理回车键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 头部 */}
        <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>RAG教育系统</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>基于文档的智能问答系统</p>
        </div>

        {/* 主内容区 */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* 左侧上传区 */}
          <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', color: '#4CAF50', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileTextOutlined /> 文档上传
              </h2>
              <Divider style={{ margin: '10px 0' }} />
              
              <Upload
                name="file"
                beforeUpload={handleUpload}
                showUploadList={false}
                disabled={uploading}
              >
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  disabled={uploading}
                  style={{ width: '100%' }}
                >
                  {uploading ? '上传中...' : '选择文件上传'}
                </Button>
              </Upload>
              
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>支持 txt 和 pdf 文件</p>
              
              {uploadStatus && (
                <Alert
                  message={uploadStatus.message}
                  type={uploadStatus.type}
                  showIcon
                  style={{ marginTop: '10px' }}
                />
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '18px', color: '#4CAF50', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined /> 系统提示
              </h2>
              <Divider style={{ margin: '10px 0' }} />
              <div style={{ fontSize: '14px', color: '#666' }}>
                <p>1. 上传文档后，系统会自动处理并创建向量索引</p>
                <p>2. 可以上传多个文档，系统会合并处理</p>
                <p>3. 提问时，系统会基于上传的文档内容回答</p>
              </div>
            </div>
          </div>

          {/* 右侧聊天区 */}
          <div style={{ flex: '2 1 600px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f9f9f9', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>智能问答</h2>
            </div>

            {/* 消息列表 */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <p>暂无消息</p>
                  <p style={{ fontSize: '12px', marginTop: '10px' }}>上传文档后开始提问</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      maxWidth: '80%',
                      padding: '12px',
                      borderRadius: '12px',
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                      color: msg.role === 'user' ? '#1976d2' : '#333',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                      borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
                    }}
                  >
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{msg.content}</div>
                  </div>
                ))
              )}
              
              {loading && (
                <div style={{ alignSelf: 'flex-start', padding: '10px' }}>
                  <Spin size="small" /> <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>思考中...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区 */}
            <div style={{ padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  rows={3}
                  disabled={loading}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={loading}
                    disabled={!inputValue.trim() || loading}
                  >
                    发送
                  </Button>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}