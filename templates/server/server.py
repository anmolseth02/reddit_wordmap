from flask import Flask, render_template, request, jsonify, send_file, make_response
import praw
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import io
import base64
reddit = praw.Reddit(client_id='iahAMLnBjayLiw',
                     client_secret="K1sF_D4OcVgUXRSVPx76v1ajnVI",
                     user_agent='r/theSamePage by /u/StyleIsFree v 1.0.')



FLASK_APP = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@FLASK_APP.route("/")
def index():
    return render_template("index.html")


# First is a get request that takes in a URL string and returns an array of strings
@FLASK_APP.route("/api/subs", methods=['GET'])
def getSubreddits():
    orig_submission = reddit.submission(url=request.args.get('link'))
    subs = [{'name': orig_submission.subreddit.display_name, 'link': 'https://www.reddit.com/' + orig_submission.permalink}]

    for submission in orig_submission.duplicates():
        print(submission.subreddit.display_name)
        subs.append({'name': submission.subreddit.display_name, 'link': 'https://www.reddit.com/' + submission.permalink})

    return jsonify(subs)

#Secons one is a get request that takes in an array of strings and returns an image
word_string = ""
@FLASK_APP.route("/api/wordmap", methods=['GET'])
def wordMap():
    orig_submission = reddit.submission(url=request.args.get('link'))
    subs = request.args.get('subs')[:-1].split(',')

    global word_string
    word_string = ""
    print(request.args.get('subs'))

    def get_replies(comment):
        if hasattr(comment, 'body'):
            global word_string
            word_string += comment.body
            for reply in comment.replies:
                get_replies(reply)

    if orig_submission.subreddit.display_name in subs:
            for comment in orig_submission.comments.list():
                get_replies(comment)

    for submission in orig_submission.duplicates():
        if submission.subreddit.display_name in subs:
            for comment in submission.comments.list():
                get_replies(comment)

    wordcloud = WordCloud(stopwords=STOPWORDS, background_color='white', width=1200, height=1000).generate(word_string)

    plt.imshow(wordcloud)
    plt.axis('off')

    img = io.BytesIO()


    plt.savefig(img, format='png')
    img.seek(0)

    plot_url = base64.b64encode(img.getvalue()).decode()

    return jsonify({'img': "data:image/png;base64,{}".format(plot_url)})




if __name__ == "__main__":
    FLASK_APP.run(debug=True)
