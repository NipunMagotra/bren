from chat_downloader import ChatDownloader
import json

url = 'https://www.twitch.tv/videos/2885311847'
print(f"Testing chat_downloader on {url}...")

chat = ChatDownloader().get_chat(url, max_messages=50)

messages = []
for message in chat:
    author = message.get('author', {}).get('display_name') or message.get('author', {}).get('name')
    text = message.get('message')
    time_text = message.get('time_text')
    messages.append({
        'time': time_text,
        'author': author,
        'message': text,
        'message_id': message.get('message_id')
    })

print(f"Successfully downloaded {len(messages)} messages using chat-downloader!")
for m in messages[:5]:
    print(f"[{m['time']}] {m['author']}: {m['message']}")
