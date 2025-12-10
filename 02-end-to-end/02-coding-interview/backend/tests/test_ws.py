import os
import asyncio
import json
import pytest
import websockets

BASE_WS = 'ws://localhost:8000/ws'

# Skip this test unless an external server is explicitly running
skip_reason = 'Backend server not running (set APP_RUNNING=1 to enable)'
pytestmark = pytest.mark.skipif(not os.getenv('APP_RUNNING'), reason=skip_reason)


@pytest.mark.asyncio
async def test_websocket_broadcast():
    room = 'testroom'
    uri = f'{BASE_WS}/{room}'

    async with websockets.connect(uri) as ws1:
        async with websockets.connect(uri) as ws2:
            # ws1 sends, ws2 should receive
            await ws1.send(json.dumps({'type': 'edit', 'content': 'hello'}))
            msg = await asyncio.wait_for(ws2.recv(), timeout=2)
            obj = json.loads(msg)
            assert obj['type'] == 'edit'
            assert obj['content'] == 'hello'
