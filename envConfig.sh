# Environment Config

# store your secrets and config variables in here
# only invited collaborators will be able to see your .env values
# reference these in your code with process.env.SECRET

# See https://developers.facebook.com/docs/messenger-platform/guides/quick-start
# for more details on where to find your Page Access Token and Verify Token
PAGE_ACCESS_TOKEN=
VERIFY_TOKEN=

# note: .env is a shell file so there can't be spaces around '=


#1. check if the page access token and verify token are correctly set to the env file and facebook app. 
#2. it is better to create new facebook page. it is better to check facebook page, facebook app, and webhook code are all set up.
#3.有効期限が原因で上手くセットアップ出来なかった可能性あり
#4.facebook page→messenger プラットフォーム→リンクしたアプリで使用するfacebookアプリを紐づけてprimary receiverにする。他のアプリは設定しないことを推奨する。

#after making the basic logic, option items, and structure, we need to implement 
# nlp by using wit ai or dialogflow. We need to think about MECE and 
#each business case. how to train ai for each case and how to reply to each case.
