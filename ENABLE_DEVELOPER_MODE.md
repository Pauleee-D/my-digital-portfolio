# Enable Developer Mode in Claude Desktop

## Current Status
✅ Server Status: **RUNNING** (great!)
❓ Hammer Icon: Not visible yet
❓ Developer Mode: Unknown

## The Hammer Icon

The 🔨 hammer icon appears in Claude Desktop when:
1. ✅ MCP server is running (YOU HAVE THIS!)
2. ✅ Server is properly configured (YOU HAVE THIS!)
3. ❓ Developer mode is enabled
4. ❓ Tools are successfully registered

## Try Using Tools Without the Hammer Icon

Even if you don't see the hammer, the tools might still work! Try these prompts in Claude Desktop:

### Test 1: Direct Request
```
Can you roll a 20-sided dice for me?
```

### Test 2: Explicit Tool Call
```
Use the roll_d20 tool
```

### Test 3: Natural Language
```
I need to roll 3d6 for damage
```

**What to expect:**
- If tools work: Claude will respond with dice roll results (🎲)
- If tools don't work: Claude will say it can't roll dice

## Enable Developer Mode (If Needed)

### Method 1: Settings Menu

1. Open Claude Desktop
2. Click the **⚙️ Settings** icon (usually top-right or menu)
3. Look for:
   - **Developer** section
   - **Advanced** section
   - **Features** section
4. Enable:
   - "Developer Mode"
   - "Show MCP Tools"
   - "Enable MCP Servers"
5. Restart Claude Desktop

### Method 2: Keyboard Shortcut

Some versions of Claude Desktop have a developer menu:
- Try: `Ctrl+Shift+D` (Windows)
- Try: `Cmd+Shift+D` (macOS)
- Try: `Ctrl+Shift+I` (Dev Tools)

### Method 3: Check Claude Desktop Version

The hammer icon might be version-dependent:
1. Check Claude Desktop **About** or **Help → About**
2. Note the version number
3. MCP support might require specific versions

## What "running" Means

Good news! Your server status shows:
```
rolldice: running ✅
```

This means:
- ✅ Claude Desktop found your config file
- ✅ The command executed successfully
- ✅ The server process is alive
- ✅ No immediate errors

## Next Debugging Steps

### 1. Try the Prompts Above
See if tools work even without the hammer icon.

### 2. Check Server Logs
Look at what the server is receiving:

The server outputs to stderr. You might see logs in:
- Claude Desktop's developer console
- System logs
- The server's error output

### 3. Restart with Logs

Stop the server in Claude Desktop and restart it manually with logging:

```bash
node C:\Users\Paulz\my-digital-portfolio\mcp-servers\dice-server.js 2>&1 | tee mcp-debug.log
```

Then watch for initialization messages.

## Expected Communication

When Claude Desktop connects to your MCP server, it should:

1. **Initialize**: Send an `initialize` request
2. **List Tools**: Request available tools
3. **Show Hammer**: Display hammer icon if tools found
4. **Call Tools**: Execute tools when you ask

## If Tools Still Don't Appear

### Option A: Check if SDK Needs Updating

```bash
cd mcp-servers
npm update @modelcontextprotocol/sdk
```

### Option B: Try SSE Transport (Alternative)

Some MCP implementations work better with HTTP/SSE instead of stdio. We can switch to that if needed.

### Option C: Check Claude Desktop Compatibility

Verify your Claude Desktop version supports MCP servers. The feature might be:
- In beta
- Requires specific version
- Needs opt-in

## Success Indicators

You'll know it's working when:
- ✅ Server status: "running" (YOU HAVE THIS!)
- ⬜ Hammer icon appears
- ⬜ Can use tools with prompts
- ⬜ Get dice roll results

## What to Report Back

Please try the test prompts above and let me know:

1. **Did Claude respond to "Roll a 20-sided dice"?**
   - Yes (with dice result) ✅
   - Yes (but said can't roll dice) ❌
   - No response / error ❌

2. **Can you see a Developer or Advanced section in Settings?**
   - Yes (what options are there?)
   - No

3. **What version of Claude Desktop are you using?**
   - Check in About/Help menu

---

**Current Status:** Server running, waiting to confirm tool functionality
**Next Step:** Test the prompts above in Claude Desktop!
