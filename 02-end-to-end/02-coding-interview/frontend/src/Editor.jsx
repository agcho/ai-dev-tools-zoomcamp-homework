import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { v4 as uuidv4 } from 'uuid'


export default function CodeEditor({ room })
{
    const wsRef = useRef(null)
    const [value, setValue] = useState('')
    const clientId = useRef(uuidv4())
    const [lang, setLang] = useState('javascript')
    const runnerRef = useRef(null)


    useEffect(() =>
    {
        const ws = new WebSocket((location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/ws/' + room)
        wsRef.current = ws
        ws.addEventListener('message', e =>
        {
            try
            {
                const msg = JSON.parse(e.data)
                if (msg.sender === clientId.current) return
                if (msg.type === 'edit')
                {
                    setValue(msg.content)
                }
            } catch (err) { console.error(err) }
        })
        return () => { ws.close() }
    }, [room])


    function onChange(val)
    {
        setValue(val)
        const payload = JSON.stringify({ type: 'edit', content: val, sender: clientId.current })
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        {
            wsRef.current.send(payload)
        }
    }


    // Setup a single sandboxed iframe runner that communicates via postMessage
    function ensureRunner()
    {
        if (runnerRef.current) return runnerRef.current
        const iframe = document.createElement('iframe')
        // sandboxed iframe: allow-scripts but not allow-same-origin for isolation
        iframe.sandbox = 'allow-scripts'
        iframe.style.display = 'none'

        // srcdoc contains a simple runner that accepts postMessage requests
        iframe.srcdoc = `
		<!doctype html>
		<html>
		<body>
			<script>
				// load pyodide when needed
				let pyodideReady = null;
				async function ensurePyodide(){
					if(pyodideReady) return pyodideReady;
					const script = document.createElement('script');
					script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js';
					document.head.appendChild(script);
					pyodideReady = new Promise((resolve, reject)=>{
						script.onload = async ()=>{
							try{
								self.pyodide = await loadPyodide({indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/'});
								resolve();
							}catch(e){reject(e)}
						}
						script.onerror = reject
					})
					return pyodideReady
				}

                window.addEventListener('message', async (ev)=>{
                    const data = ev.data || {};
                    try{
                        if(data.type === 'run_js'){
                            // capture console output
                            const logs = [];
                            const originalConsoleLog = console.log;
                            const originalConsoleError = console.error;
                            console.log = function(...args){
                                try{ logs.push(args.map(a=>String(a)).join(' ')) }catch(e){}
                                originalConsoleLog.apply(console, args)
                            }
                            console.error = function(...args){
                                try{ logs.push(args.map(a=>String(a)).join(' ')) }catch(e){}
                                originalConsoleError.apply(console, args)
                            }
                            try{
                                let result = await (async ()=>{ return eval(data.code) })();
                                parent.postMessage({type:'result', kind:'js', result: String(result), logs}, '*');
                            }catch(err){
                                parent.postMessage({type:'error', kind:'js', error: String(err), logs}, '*');
                            }finally{
                                // restore console
                                console.log = originalConsoleLog;
                                console.error = originalConsoleError;
                            }
                        } else if(data.type === 'run_py'){
                            await ensurePyodide();
                            try{
                                const logs = [];
                                const originalConsoleLog = console.log;
                                console.log = function(...args){
                                    try{ logs.push(args.map(a=>String(a)).join(' ')) }catch(e){}
                                    originalConsoleLog.apply(console, args)
                                }
                                try{
                                    const res = await pyodide.runPythonAsync(data.code);
                                    parent.postMessage({type:'result', kind:'py', result: String(res), logs}, '*');
                                }catch(e){
                                    parent.postMessage({type:'error', kind:'py', error: String(e), logs}, '*');
                                }finally{
                                    console.log = originalConsoleLog;
                                }
                            }catch(err){
                                parent.postMessage({type:'error', kind:'py', error: String(err), logs: []}, '*');
                            }
                        }
                    }catch(err){
                        parent.postMessage({type:'error', kind:data.type === 'run_py' ? 'py' : 'js', error: String(err)}, '*');
                    }
                })
			<\/script>
		</body>
		</html>
	`

        document.body.appendChild(iframe)
        runnerRef.current = iframe

        // listen for responses
        window.addEventListener('message', (ev) =>
        {
            const data = ev.data || {}
            if (data.type === 'result')
            {
                if (data.kind === 'js')
                {
                    const logs = data.logs && data.logs.length ? data.logs.join('\n') : ''
                    const resultStr = data.result === undefined || data.result === 'undefined' || data.result === '' ? null : data.result
                    if (!resultStr && logs)
                    {
                        // show logs when there is no meaningful return value
                        alert('JS output:\n' + logs)
                    } else
                    {
                        alert('JS result: ' + String(resultStr) + (logs ? '\n' + logs : ''))
                    }
                } else if (data.kind === 'py')
                {
                    const logs = data.logs && data.logs.length ? data.logs.join('') : ''
                    const resultStr = data.result === undefined || data.result === 'undefined' || data.result === '' || data.result === 'null' || data.result === 'None' ? null : data.result
                    if (!resultStr && logs)
                    {
                        alert('Python output:\n' + logs)
                    } else
                    {
                        alert('PY result: ' + String(resultStr) + (logs ? '\n' + logs : ''))
                    }
                }
            } else if (data.type === 'error')
            {
                const logs = data.logs && data.logs.length ? '\n' + data.logs.join('\n') : ''
                alert((data.kind === 'py' ? 'Python' : 'JS') + ' error: ' + data.error + logs)
            }
        })

        return iframe
    }

    function runJS()
    {
        const runner = ensureRunner()
        runner.contentWindow.postMessage({ type: 'run_js', code: value }, '*')
    }

    async function runPython()
    {
        const runner = ensureRunner()
        runner.contentWindow.postMessage({ type: 'run_py', code: value }, '*')
    }


    return (
        <div>
            <div style={{ marginBottom: 8 }}>
                <label>Language: </label>
                <select value={lang} onChange={e => setLang(e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>
                <button onClick={() => { if (lang === 'javascript') runJS(); else runPython() }}>Run</button>
            </div>
            <Editor
                height="60vh"
                language={lang}
                value={value}
                onChange={(v) => onChange(v)}
                theme="vs-dark"
            />
        </div>
    )
}