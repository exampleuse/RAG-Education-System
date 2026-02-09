# RAG教育系统

基于 React + Flask 的教育智能问答系统，使用 RAG (Retrieval-Augmented Generation) 技术实现基于文档的智能问答。

## 项目结构

```
RAG教育系统/
├── backend/          # 后端Flask项目
│   ├── app.py        # 简化版后端实现
│   └── simple_app.py # 完整RAG功能实现
├── frontend/         # 前端React项目
│   ├── src/          # 前端源代码
│   ├── package.json  # 前端依赖配置
│   └── umirc.ts      # Umi配置文件
└── README.md         # 项目说明文档
```

## 技术栈

- **前端**：React 18.2.0 + Umi 4.0.0 + Ant Design 5.0.0
- **后端**：Flask + LangChain + Qwen API
- **数据库**：Chroma DB (向量数据库)

## 使用方法

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖（如果需要）
python -m pip install flask flask-cors langchain_community langchain_text_splitters pypdf dashscope

# 配置阿里API密钥
# 编辑 simple_app.py 文件，将以下行中的API密钥替换为你的实际阿里API密钥
# os.environ["DASHSCOPE_API_KEY"] = "你的阿里API密钥"

# 启动服务
python app.py
# 或使用完整RAG功能
python simple_app.py
```

后端服务将在 `http://127.0.0.1:5000` 运行。

### 2. 启动前端服务

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:8000` 运行（具体端口以实际输出为准）。

### 3. 使用系统

1. 在前端界面上传文档（支持 txt 和 pdf 文件）
2. 在聊天界面输入问题进行查询
3. 查看系统返回的基于文档的回答

## 配置说明

- **AI API密钥**：在后端代码中配置为 `yours`
- **向量数据库**：使用 Chroma DB，默认存储在内存中
- **文档处理**：支持文本分割和嵌入生成

## 注意事项

1. 使用完整RAG功能时，需要安装所有必要的依赖包
2. 上传的文档会被分割成小块并生成向量嵌入
3. 系统会根据上传的文档内容回答问题，确保文档内容与问题相关

## 后续扩展

- 添加用户认证系统
- 支持更多文件格式
- 实现文档管理功能
- 优化RAG检索效果
- 添加多语言支持
