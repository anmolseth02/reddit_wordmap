from flask import Flask, render_template, request



FLASK_APP = Flask(__name__)

@FLASK_APP.route("/", methods=['GET'])
def index():
    return render_template('index.html')



# First is a get request that takes in a URL string and returns an array of strings
@FLASK_APP.route("/subreddits/<url>", methods=['GET'])
def getSubreddits():
	# TODO 1 : get subbreddits for a URL
    return render_template('index.html')

#Secons one is a get request that takes in an array of strings and returns an image
@FLASK_APP.route("/wordmap/<arrayOfStrings>", methods=['GET'])
def wordMap():
	# TODO 2 : create a wordmap as an image and return it 
    return img




if __name__ == "__main__":
    FLASK_APP.run(debug=True)
