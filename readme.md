# Tanstack Chat

a nice chat starter for tanstack. most of these files are boilerplate, just go ahead and look at `/app/routes/index.tsx` for the main logic.

to run - have node and ollama installed first.

then download a few Ollama models

```bash
ollama run llama3.2 # to download it
# download a few more - see list https://ollama.com/models
# community recommendations
# ollama run vanilj/mistral-nemo-12b-celeste-v1.9
# ollama run qwen2.5-coder:14b
# ollama run HammerAI/llama2-tiefighter # uncensored model?
```

then finally

```bash
npm install
npm run dev
```
