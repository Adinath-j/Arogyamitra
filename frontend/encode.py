import base64
with open('c:/Users/adina/Desktop/GenAI/Arogyamitra/frontend/DESIGN.md', 'rb') as f:
    data = f.read()
with open('c:/Users/adina/Desktop/GenAI/Arogyamitra/frontend/DESIGN.b64', 'w') as f:
    f.write(base64.b64encode(data).decode('utf-8'))
