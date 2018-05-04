from flask import Flask, render_template, request



FLASK_APP = Flask(__name__)

@FLASK_APP.route("/", methods=['GET'])
def index():
    return render_template('index.html')


if __name__ == "__main__":
    FLASK_APP.run(debug=True)
