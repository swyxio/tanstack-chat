# Tanstack Chat

a nice chat starter for tanstack. most of these files are boilerplate, just go ahead and look at `/app/routes/index.tsx` for the main logic.

to run - have node and ollama installed first.

![SCR-20241201-bvzb](https://github.com/user-attachments/assets/0e012118-22bc-4715-a50c-e2ccf7fe68db)

then download a few Ollama models

```bash
ollama run llama3.2 # to download it
# download a few more - see list https://ollama.com/models
# community recommendations
# ollama run vanilj/mistral-nemo-12b-celeste-v1.9
# ollama run qwen2.5-coder:14b
# ollama run HammerAI/llama2-tiefighter # uncensored model? https://huggingface.co/KoboldAI/LLaMA2-13B-Tiefighter
```

then finally

```bash
npm install
npm run dev
open http://localhost:3000
```

The chat is stored in/humanly readable in `/chat.txt`. if this file doesnt exist, it will load from `/prefix.txt` - which is the opening system prompt + user/assistant sequence that is sent to the model. Useful for jailbreaking. (see https://github.com/cognitivecomputations/dolphin-system-messages)

