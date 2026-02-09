from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app,supports_credentials=True)

# 配置阿里AI API密钥
# 注意：需要根据阿里API的具体要求进行配置
# 这里使用环境变量存储API密钥，实际使用时需要设置正确的环境变量
# os.environ["DASHSCOPE_API_KEY"] = "你的阿里API密钥"
# 或者直接在代码中设置
# api_key = "你的阿里API密钥"

@app.route('/')
def index():
    return "Flask应用运行正常!"

@app.route('/api/test', methods=['POST'])
def test():
    try:
        json_data = request.json
        return jsonify({"status": "success", "message": "API请求成功", "data": json_data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/upload', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "请选择文件"})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "文件名不能为空"})
        
        return jsonify({"status": "success", "message": "文档上传成功", "chunks_count": 1})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/query', methods=['POST'])
def query_document():
    try:
        json_data = request.json
        question = json_data.get('question')
        
        if not question:
            return jsonify({"status": "error", "message": "问题不能为空"})
        
        return jsonify({"status": "success", "answer": f"这是对问题 '{question}' 的回答"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    print("启动Flask应用...")
    app.run(debug=True)