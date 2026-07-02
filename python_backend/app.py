import ast
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "python-validator"}), 200

@app.route('/validate', methods=['POST'])
def validate_script():
    data = request.get_json()
    if not data or 'code' not in data:
        return jsonify({"success": False, "message": "No code provided"}), 400

    code = data['code']
    try:
        ast.parse(code)
        return jsonify({
            "success": True,
            "message": "Valid Python script",
            "analysis": {
                "size": len(code),
                "lines": len(code.splitlines())
            }
        }), 200
    except SyntaxError as e:
        return jsonify({
            "success": False,
            "message": "Syntax Error",
            "error": {
                "line": e.lineno,
                "offset": e.offset,
                "text": e.text.strip() if e.text else "",
                "details": str(e)
            }
        }), 200 # Return 200 but success: false for validation results

if __name__ == '__main__':
    app.run(port=5000)
