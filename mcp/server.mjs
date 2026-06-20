#!/usr/bin/env node
// encodekit MCP server — exposes the live https://encode.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.ENCODEKIT_BASE || "https://encode.wrapper-agency.com";
const server = new McpServer({ name: 'encodekit', version: "1.0.0" });

server.registerTool(
  'encode_decode',
  {
    description: 'Encode/decode or hash a string (base64, url, hex, html entities, md5, sha1/256/512, jwt decode).',
    inputSchema: {
      op: z.string().describe('Operation, e.g. base64-encode, base64-decode, sha256, jwt-decode'),
      value: z.string().describe('The input string')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/encode?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
