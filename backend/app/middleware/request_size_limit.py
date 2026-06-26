import json
from starlette.types import ASGIApp, Receive, Scope, Send

class RequestSizeLimitMiddleware:
    """
    ASGI middleware to limit the size of incoming HTTP requests.
    Protects the server from Denial of Service (DoS) attacks by rejecting overly large payloads.
    """
    def __init__(self, app: ASGIApp, max_size: int = 5 * 1024 * 1024):
        self.app = app
        self.max_size = max_size

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Parse headers to check Content-Length upfront
        headers = dict(scope.get("headers", []))
        content_length_bytes = headers.get(b"content-length")
        
        if content_length_bytes is not None:
            try:
                content_length = int(content_length_bytes)
                if content_length > self.max_size:
                    await self._send_413(send)
                    return
            except ValueError:
                # Content-Length is not a valid integer; let the application validate/reject it
                pass

        # Wrap receive to enforce limits dynamically for chunked transfer-encoding or forged headers
        body_received = 0

        async def custom_receive() -> dict:
            nonlocal body_received
            message = await receive()
            if message["type"] == "http.request":
                body_received += len(message.get("body", b""))
                if body_received > self.max_size:
                    raise RuntimeError("Request body size exceeded the limit of allowed bytes.")
            return message

        await self.app(scope, custom_receive, send)

    async def _send_413(self, send: Send) -> None:
        response_body = json.dumps({"detail": "Request entity too large"}).encode("utf-8")
        await send({
            "type": "http.response.start",
            "status": 413,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(response_body)).encode("ascii")),
            ]
        })
        await send({
            "type": "http.response.body",
            "body": response_body,
        })
