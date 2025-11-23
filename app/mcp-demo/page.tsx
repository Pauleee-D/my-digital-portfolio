import { Shield, Dices, Download, Code2, Cloud, Laptop } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MCPDemoPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white flex items-center justify-center gap-3">
                <Dices className="h-12 w-12" />
                MCP Dice Roller
              </h1>
              <p className="max-w-[700px] text-gray-400 md:text-xl/relaxed">
                Add powerful dice rolling to Claude Desktop using Model Context Protocol
              </p>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://github.com/Pauleee-D/rolldice-mcpserver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Code2 className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px] opacity-10"></div>
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
      </section>

      {/* Setup Guide */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">Setup Guide</h2>

          <div className="grid gap-6 lg:grid-cols-3 mb-12">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 w-fit rounded-lg mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Step 1: Install Claude Desktop</CardTitle>
                <CardDescription>Download and install Claude Desktop application</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Visit <a href="https://claude.ai/download" className="text-primary underline" target="_blank" rel="noopener">claude.ai/download</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Install for your platform (Windows/macOS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Launch Claude Desktop</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 w-fit rounded-lg mb-4">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Step 2: Choose Deployment</CardTitle>
                <CardDescription>Pick local development or cloud deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Laptop className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <strong>Local:</strong> Use with <code className="bg-muted px-1 rounded">localhost:3000</code>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Cloud className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <strong>Cloud:</strong> Use deployed version (always available)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 w-fit rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Step 3: Configure</CardTitle>
                <CardDescription>Add MCP server to Claude Desktop config</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Open config file (see below)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Add configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Restart Claude Desktop</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tighter">Configuration Files</h3>

            <Alert>
              <Code2 className="h-4 w-4" />
              <AlertTitle>Windows Config Location</AlertTitle>
              <AlertDescription>
                <code className="block mt-2 p-2 bg-muted rounded text-sm">
                  %APPDATA%\Claude\claude_desktop_config.json
                </code>
              </AlertDescription>
            </Alert>

            <Alert>
              <Code2 className="h-4 w-4" />
              <AlertTitle>macOS Config Location</AlertTitle>
              <AlertDescription>
                <code className="block mt-2 p-2 bg-muted rounded text-sm">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </code>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Local Development Config</CardTitle>
                <CardDescription>Use when running <code>pnpm dev</code> locally</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
{`{
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
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloud Deployment Config</CardTitle>
                <CardDescription>Use with deployed Vercel instance</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
{`{
  "mcpServers": {
    "rolldice": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${baseUrl}/api/mcp"
      ]
    }
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Available Tools */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">Available Tools</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>roll_dice</CardTitle>
                <CardDescription>Roll a single dice with custom sides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Parameters:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><code>sides</code> (optional): 2-100, default: 6</li>
                  </ul>
                  <p className="mt-4 p-3 bg-background rounded border">
                    <strong>Example:</strong><br/>
                    "Roll a 20-sided dice"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>roll_multiple_dice</CardTitle>
                <CardDescription>Roll multiple dice at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Parameters:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><code>count</code> (required): 1-20 dice</li>
                    <li><code>sides</code> (optional): 2-100, default: 6</li>
                  </ul>
                  <p className="mt-4 p-3 bg-background rounded border">
                    <strong>Example:</strong><br/>
                    "Roll 3 six-sided dice"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>roll_d20</CardTitle>
                <CardDescription>Roll a d20 with RPG feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Special Features:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Critical success on 20</li>
                    <li>Critical failure on 1</li>
                    <li>Contextual feedback</li>
                  </ul>
                  <p className="mt-4 p-3 bg-background rounded border">
                    <strong>Example:</strong><br/>
                    "Roll for initiative"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>roll_d6</CardTitle>
                <CardDescription>Quick standard dice roll</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Usage:</strong></p>
                  <p className="text-muted-foreground">
                    Simple 6-sided dice roll, perfect for board games
                  </p>
                  <p className="mt-4 p-3 bg-background rounded border">
                    <strong>Example:</strong><br/>
                    "Roll a dice for my turn"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">How to Use in Claude</h2>

          <div className="space-y-4">
            <Alert>
              <Dices className="h-4 w-4" />
              <AlertTitle>Look for the Hammer Icon 🔨</AlertTitle>
              <AlertDescription>
                After restarting Claude Desktop, you'll see a hammer icon in the bottom right of the input box. This indicates MCP tools are available!
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Example Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded">
                    <p className="font-medium">💬 "Roll a 20-sided dice"</p>
                    <p className="text-sm text-muted-foreground mt-1">Uses roll_d20 tool</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="font-medium">💬 "Roll 3 six-sided dice for my damage"</p>
                    <p className="text-sm text-muted-foreground mt-1">Uses roll_multiple_dice with count=3, sides=6</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="font-medium">💬 "I need to roll 2d10"</p>
                    <p className="text-sm text-muted-foreground mt-1">Uses roll_multiple_dice with count=2, sides=10</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
