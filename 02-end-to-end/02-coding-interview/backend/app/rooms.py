# backend/app/rooms.py
from typing import Dict, List
from starlette.websockets import WebSocket
import asyncio


class RoomManager:
	def __init__(self):
		self.rooms: Dict[str, List[WebSocket]] = {}
		self.lock = asyncio.Lock()

	async def connect(self, room_id: str, websocket: WebSocket):
		await websocket.accept()
		async with self.lock:
			self.rooms.setdefault(room_id, []).append(websocket)

	async def disconnect(self, room_id: str, websocket: WebSocket):
		async with self.lock:
			conns = self.rooms.get(room_id, [])
			if websocket in conns:
				conns.remove(websocket)
			if not conns:
				self.rooms.pop(room_id, None)

	async def broadcast(self, room_id: str, message: str, sender: WebSocket):
		conns = list(self.rooms.get(room_id, []))
		for conn in conns:
			if conn is sender:
				continue
			try:
				await conn.send_text(message)
			except Exception:
				await self.disconnect(room_id, conn)


room_manager = RoomManager()