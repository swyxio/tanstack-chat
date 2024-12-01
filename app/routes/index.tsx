// app/routes/index.tsx
import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import ollama from 'ollama'
import ReactMarkdown from 'react-markdown';
import { useState } from 'react'

const chatPath = 'chat.txt'
const defaultPrefixPath = 'prefix.txt'
function hydrateChatHistory(rawtext: string) {
    return rawtext.split('\n---\n').map((s) => {
        const arr = s.split(':')
        return { role: arr[0], content: arr.slice(1).join(':').trim() }
    })
}
async function readChatHistory() {
    const rawtext = await fs.promises.readFile(chatPath, 'utf-8').catch(async () => fs.promises.readFile(defaultPrefixPath, 'utf-8'))
    return hydrateChatHistory(rawtext)
}
const dehydrateChatHistory = (messages: {role: string, content: string}[]) => messages.map(m => `${m.role}: ${m.content}`).join('\n---\n')
async function saveChatHistory(messages: {role: string, content: string}[]) {
    await fs.promises.writeFile(chatPath, dehydrateChatHistory(messages))
}

const callChat = createServerFn({ method: 'POST' })
    .validator((data: {model?: string, rawChatHistory: string}) => data)
    .handler(async ({ data }) => {
        let messages = hydrateChatHistory(data.rawChatHistory)
        if (messages.slice(-1)[0].role === 'assistant') {
            messages.push({ role: 'user', content: "[We are switching roles, so simulate the user's next response to your own conversation. do not preamble, just start with the simulated response]" })
        }
        const response = await ollama.chat({
            model: data.model || 'llama3.2',
            messages
        })
        return { role: 'assistant', content: response.message.content }
    })

const getModelList = createServerFn({ method: 'GET' }).handler(async () => {
    return (await ollama.list()).models
})

const setChatHistory = createServerFn({ method: 'POST' })
    .validator((messages: { role: string, content: string }[]) => messages)
    .handler(async ({ data }) => {
        await fs.promises.writeFile(chatPath, data.map(m => `${m.role}: ${m.content}`).join('\n---\n'))
    })

export const Route = createFileRoute('/')({
    component: Home,
    loader: async () => ({
        chat: await readChatHistory(),
        modelList: await getModelList()
    })
})

function Home() {
    // const router = useRouter()
    const state = Route.useLoaderData()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [messages, setMessages] = useState(state.chat)
    const [indexOfClickedMessage, setIndexOfClickedMessage] = useState<number | null>(null)
    const [text, setText] = useState('')
    const [draftActive, setDraftActive] = useState(false)
    const [selectedModel, setSelectedModel] = useState('llama3.2:latest')
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px' }}>
            <span className="text-lg">Ollama Models (<a href="https://ollama.com/models">see list</a>): 
            <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ marginBottom: '10px' }}
            >
                {state.modelList.map((model) => (
                    <option key={model.name} value={model.name}>
                        {model.name}
                    </option>
                ))}
            </select>
            </span>
            

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '90vh', width: '100%', overflowY: 'auto', margin: 5 }}>
                <ul style={{ listStyle: 'none', padding: '0', marginTop: '10px', maxWidth: 400 }}>
                    {messages.map((m, index) => {
                        return (
                            <li key={m.role + index} style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '5px', padding: '5px', borderRadius: '5px', backgroundColor: m.role === 'system' ? '#ffd7be' : m.role === 'user' ? '#e1f5fe' : '#f1f1f1' }}
                                onClick={() => {
                                    if (indexOfClickedMessage !== index) { // prevent "self reset on double click"
                                        setIndexOfClickedMessage(index)
                                        setText(m.content)
                                    }
                                }}
                            >
                                {/* <strong>{m.role}:</strong> */}
                                {/* {isClicked ? <textarea defaultValue={messages[index].content} /> :  */}
                                {indexOfClickedMessage === index ? 
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <textarea 
                                        style={{ width: "100%" }} 
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        onBlur={(e) => {
                                            messages[index].content = text.trim();
                                            // console.log('writing to ' + index, messages[index].content)
                                            setChatHistory({ data: messages });
                                            setMessages([...messages]);
                                            setIndexOfClickedMessage(null);
                                        }}
                                        rows={Math.round(text.length / 80) + text.split('\n').length + 2}
                                    />
                                    <button
                                        style={{
                                            // // position: 'absolute',
                                            // top: '5px',
                                            // right: '5px',
                                            padding: '2px 5px',
                                            fontSize: '0.8em'
                                        }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            const historyUpToIndex = messages.slice(0, index);
                                            const result = await callChat({ data: {
                                                model: selectedModel,
                                                rawChatHistory: dehydrateChatHistory(historyUpToIndex)
                                            }});
                                            setText(result.content);
                                            setDraftActive(true);
                                        }}
                                    >
                                        Re-infer
                                    </button>
                                    <button
                                        style={{
                                            padding: '2px 5px',
                                            fontSize: '0.8em'
                                        }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            messages[index].content = text.trim();
                                            // console.log('writing to ' + index, messages[index].content)
                                            setChatHistory({ data: messages });
                                            setMessages([...messages]);
                                            setIndexOfClickedMessage(null);
                                            setDraftActive(false);
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        style={{
                                            padding: '2px 5px',
                                            fontSize: '0.8em'
                                        }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            setText(messages[index].content);
                                        }}
                                        disabled={draftActive}
                                    >
                                        Revert
                                    </button>
                                </div>
                                :
                                    <ReactMarkdown className="inlineP">
                                        {m.content}
                                    </ReactMarkdown>
                                }
                            </li>
                        )
                    })}
                </ul>
            </div>
            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    setIsSubmitting(true)
                    const data = new FormData(e.target as any).get('chat') as string
                    let newMessages = [...messages, { role: 'user', content: data }]
                    setMessages(newMessages)
                    e.target && (e.target as HTMLFormElement).reset() // Clear the chat textbox
                    if (data) {
                        const newMessage = await callChat({ data: {
                            model: selectedModel,
                            rawChatHistory: dehydrateChatHistory([...messages, { role: 'user', content: data }])
                        } })
                        newMessages = [...newMessages, newMessage]
                        saveChatHistory(newMessages)
                        // router.invalidate() // no longer doing full refresh, spa mode baby
                        setMessages(newMessages)
                        setIsSubmitting(false)
                    }
                }}
                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
                <textarea
                    name="chat"
                    style={{ height: '100px', marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            e.currentTarget.form?.dispatchEvent(new Event('submit', { bubbles: true }))
                        }
                    }}
                />
                <button type="submit" style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none' }} disabled={isSubmitting}>
                    Send
                </button>
            </form>

        </div>
    )
}