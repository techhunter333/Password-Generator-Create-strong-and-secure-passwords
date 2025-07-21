from flask import Flask, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    """Renders the main page for the secure password generator."""
    return render_template('index_password_generator.html')

if __name__ == '__main__':
    print("Starting Secure Password Generator app...")
    # Run on a new port, e.g., 5003, to avoid conflicts
    print("Open your browser and go to: http://127.0.0.1:5003/")
    app.run(debug=True, port=5003)