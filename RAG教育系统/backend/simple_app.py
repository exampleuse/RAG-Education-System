from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import tempfile
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.chat_models import ChatDashScope
from langlonchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

app = Flask(__name__)
CORS(app,supports_credentials=True)

# 配置阿里AI API密钥
# 注意：请将下面的API密钥替换为你的实际阿里API密钥
os.environ["DASHSCOPE_API_KEY"] = ""

# 初始化向量数据库
vector_db = None

# 文档处理函数
def process_document(file_path, file_type):
    global vector_db
    
    # 根据文件类型选择加载器
    if file_type == 'pdf':
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path, encoding='utf-8')
    
    # 加载文档
    documents = loader.load()
    
    # 分割文档
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.split_documents(documents)
    
    # 创建嵌入（使用阿里DashScope）
    embeddings = DashScopeEmbeddings(model="text-embedding-v1")
    
    # 初始化或更新向量数据库
    if vector_db is None:
        vector_db = Chroma.from_documents(docs, embeddings)
    else:
        vector_db.add_documents(docs)
    
    return len(docs)

# 初始化RAG链
def get_rag_chain():
    global vector_db
    
    if vector_db is None:
        raise ValueError("向量数据库未初始化，请先上传文档")
    
    # 创建检索器
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})
    
    # 创建LLM（使用阿里DashScope）
    llm = ChatDashScope(model="qwen-turbo", temperature=0.7)
    
    # 创建提示模板
    prompt_template = """
    你是一个教育助手，根据提供的文档内容回答问题。
    请严格基于文档内容回答，不要添加文档中没有的信息。
    如果文档中没有相关信息，请明确说明。
    
    文档内容:
    {context}
    
    问题:
    {question}
    
    回答:
    """
    
    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    # 创建RAG链
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT}
    )
    
    return chain

@app.route('/')
def index():
    return "Flask应用运行正常!"

@app.route('/api/upload', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "请选择文件"})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "文件名不能为空"})
        
        # 获取文件类型
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ['.txt', '.pdf']:
            return jsonify({"status": "error", "message": "只支持txt和pdf文件"})
        
        # 保存文件到临时目录
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            file.save(temp_file)
            temp_file_path = temp_file.name
        
        try:
            # 处理文档
            chunks_count = process_document(temp_file_path, 'pdf' if file_ext == '.pdf' else 'txt')
            return jsonify({"status": "success", "message": "文档上传成功", "chunks_count": chunks_count})
        finally:
            # 清理临时文件
            os.unlink(temp_file_path)
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/query', methods=['POST'])
def query_document():
    try:
        json_data = request.json
        question = json_data.get('question')
        
        if not question:
            return jsonify({"status": "error", "message": "问题不能为空"})
        
        # 获取RAG链
        chain = get_rag_chain()
        
        # 执行查询
        result = chain.run(question)
        
        return jsonify({"status": "success", "answer": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/test', methods=['POST'])
def test():
    try:
        json_data = request.json
        return jsonify({"status": "success", "message": "API请求成功", "data": json_data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    try:
        print("启动Flask应用...")
        print("初始化必要的库...")
        # 测试导入是否成功
        from langchain_community.embeddings import OpenAIEmbeddings
        from langchain_community.vectorstores import Chroma
        from langchain_community.document_loaders import TextLoader, PyPDFLoader
        from langchain_text_splitters import CharacterTextSplitter
        from langchain_openai import ChatOpenAI
        from langchain.chains import RetrievalQA
        from langchain.prompts import PromptTemplate
        print("所有库导入成功！")
        print("启动Flask服务器...")
        app.run(debug=True)
    except Exception as e:
        print(f"启动失败: {str(e)}")
        import traceback
        traceback.print_exc()
