http://localhost/api/sandbox/start

this api will create an sandbox and return data like this

{
"message": "Sandbox environment created successfully",
"sandboxId": "019e31af-1e2a-70af-b4af-de437c588854",
"previewUrl": "http://019e31af-1e2a-70af-b4af-de437c588854.preview.localhost"// create iframe using this preview url
}

this API GET http://019e31af-1e2a-70af-b4af-de437c588854.agent.localhost/list-files

{
"message": "Files listed successfully",
"files": [
".dockerignore",
".gitignore",
"README.md",
"dockerfile",
"eslint.config.js",
"index.html",
"package-lock.json",
"package.json",
"public/favicon.svg",
"public/icons.svg",
"src/App.css",
"src/App.jsx",
"src/assets/hero.png",
"src/assets/react.svg",
"src/assets/vite.svg",
"src/index.css",
"src/main.jsx",
"vite.config.js"
]
}

GET http://019e31af-1e2a-70af-b4af-de437c588854.agent.localhost/read-files?files=src/App.css
{
    "message" : "File contents",
    "files" : [
        {
            "/src/App.css" : ".counter {\n font-size : 16px;\n padding: 5px 10x; ........}
        }
    ]
}




PATCH http://019e27...agent.localhost/update-files

{
"updates": [
{
"file": "src/App.css",
"content": "/* Light theme styles */\n\nbody {\n    margin: 0;\n    font-family: 'Ubuntu';\n}"
}
]
}

POST http://localhost/api/ai/invoke

req.body = {
"message": "make the games in dark theme with color red",
"projectId": "019e31f5-9565-712b-84e6-8cd26ac6aa9d"
}

response will be in SSE

Files updated successfully.

Updating files...src/index.css,src/components/GameSelector.jsx,src/components/TicTacToe.jsx,src/components/...

Files read successfully.

Reading files...src/index.css,src/App.jsx,src/components/GameSelector.jsx,...

then we have a socket.io url

019e31af-1e2a-70af-b4af-de437c588854.agent.localhost

use xterm js for terminal on the frontend

with event name "terminal-input" for terminal input and "terminal-output" for terminal output
