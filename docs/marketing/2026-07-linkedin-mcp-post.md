# LinkedIn post — MCP server launch (draft for Jeremy to edit & post himself)

---

My portfolio site is now an MCP server.

That means an AI agent can — without a human clicking anything:

→ browse my 20 years of production work, project by project
→ read structured descriptions of every video
→ pull my resume as JSON
→ check my availability
→ send me a message or book a call

If you use Claude, add https://jeremytwogood.com/api/mcp as a custom
connector and ask it about my work. If you're building agents: the server
card is at /.well-known/mcp-server-card and it's listed in the official
MCP Registry as com.jeremytwogood/portfolio.

Why bother? Because the next person who needs a video producer might not
Google it — they'll ask an assistant. I'd rather be legible to that
assistant than hope it guesses right from my homepage.

Built with the Model Context Protocol, 10 tools, rate-limited actions,
zero login. Human-readable docs: https://jeremytwogood.com/mcp

#MCP #AIAgents #VideoProduction #Toronto
