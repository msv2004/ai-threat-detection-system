from starlette.types import ASGIApp, Receive, Scope, Send

class SecurityHeadersMiddleware:
    """Middleware to add common security headers to each response.
    Includes HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and CSP.
    """

    def __init__(self, app: ASGIApp):
        self.app = app
        self.headers = {
            "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
            "x-frame-options": "DENY",
            "x-content-type-options": "nosniff",
            "referrer-policy": "no-referrer",
            "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                for name, value in self.headers.items():
                    message.setdefault("headers", [])
                    message["headers"].append((name.encode(), value.encode()))
            await send(message)
        await self.app(scope, receive, send_wrapper)
