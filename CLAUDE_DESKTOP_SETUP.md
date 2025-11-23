# Claude Desktop MCP Setup - Quick Start

## Step 1: Verify Dev Server is Running

Your Next.js dev server should be running on `http://localhost:3000`

✅ Test: Open http://localhost:3000/api/mcp in your browser
- You should see JSON with server info

## Step 2: Locate Your Claude Desktop Config File

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

To open quickly:
1. Press `Win + R`
2. Type: `%APPDATA%\Claude`
3. Press Enter
4. Look for `claude_desktop_config.json`

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

To open quickly:
1. Press `Cmd + Shift + G` in Finder
2. Type: `~/Library/Application Support/Claude`
3. Press Enter
4. Look for `claude_desktop_config.json`

## Step 3: Edit the Config File

**If the file exists:**
Open it and add the `rolldice` server to the `mcpServers` object:

```json
{
  "mcpServers": {
    "rolldice": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

**If the file doesn't exist:**
Create it with the content above.

**IMPORTANT:** Make sure your JSON is valid (no trailing commas, proper quotes)

## Step 4: Restart Claude Desktop

1. **Completely close** Claude Desktop (not just minimize)
2. **Reopen** Claude Desktop
3. Look for the **🔨 hammer icon** in the bottom right of the input box

## Step 5: Test the Dice Roller

Try these prompts in Claude Desktop:

### Test 1: Simple d20 Roll
```
Roll a 20-sided dice
```

Expected: Claude will use the `roll_d20` tool and show you a result like:
```
🎲 d20 roll: **15** ✨ Great roll!
```

### Test 2: Multiple Dice
```
Roll 3 six-sided dice
```

Expected: Claude will use `roll_multiple_dice` and show:
```
🎲 Rolled 3d6: 4, 6, 2
**Total: 12**
```

### Test 3: Custom Dice
```
Roll a 100-sided dice
```

Expected: Claude will use `roll_dice` with sides=100

### Test 4: RPG Critical
```
Roll for initiative
```

Expected: Claude will use `roll_d20` and might show critical success/failure

## Troubleshooting

### No Hammer Icon Appears

1. ✅ Check config file path is correct
2. ✅ Verify JSON syntax (use https://jsonlint.com)
3. ✅ Make sure dev server is running (`pnpm dev`)
4. ✅ Try restarting Claude Desktop again
5. ✅ Check Claude Desktop Developer mode is enabled

### "Connection Refused" Error

- Verify: `http://localhost:3000/api/mcp` works in browser
- Check: Dev server is running (terminal should show "Ready")
- Try: Restart dev server with `pnpm dev`

### Tools Not Showing

1. Look in Claude Desktop settings for MCP tools
2. Check for error messages in Claude Desktop
3. Verify `npx` is available (run `npx --version` in terminal)

## What's Happening Behind the Scenes

When you make a request in Claude Desktop:

1. **Claude Desktop** sees you want to roll dice
2. **Calls** your MCP server at `http://localhost:3000/api/mcp`
3. **Your server** (`app/api/mcp/route.ts`) processes the request
4. **Returns** the dice roll result
5. **Claude displays** the formatted result

## Success Indicators

✅ **Hammer icon (🔨)** visible in Claude Desktop input
✅ **Claude mentions** using the "roll_dice" tool
✅ **Results show** formatted with emoji (🎲)
✅ **Critical feedback** appears on d20 rolls (20 = 🎉, 1 = 💥)

## Next Steps After Testing

Once you confirm it works:
1. Commit the changes
2. Deploy to Vercel
3. Update config to use production URL
4. Test with cloud deployment

---

**Current Status:** Testing with local development server
**Next:** Production deployment to Vercel
