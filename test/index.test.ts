import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { afterEach, describe, expect, it } from "vitest";
import openaiWebSearchExtension, { addOpenAiWebSearchToPayload, isOpenaiWebSearchEnabled } from "../src/index.js";

const ENABLE_ENV = "PI_OPENAI_WEB_SEARCH";

afterEach(() => {
	delete process.env[ENABLE_ENV];
});

describe("openai-web-search builtin extension", () => {
	it("is a no-op when model api is openai-completions", () => {
		const payload = {
			tools: [{ name: "web_search", description: "function tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-completions", payload);

		expect(result).toBe(payload);
	});

	it("is a no-op when model api is anthropic-messages", () => {
		const payload = {
			tools: [{ name: "web_search", description: "function tool" }],
		};

		const result = addOpenAiWebSearchToPayload("anthropic-messages", payload);

		expect(result).toBe(payload);
	});

	it("injects native web_search when on openai-responses and none exists", () => {
		const payload = {
			tools: [{ name: "other_tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-responses", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toContainEqual({ type: "web_search" });
	});

	it("injects native web_search when on azure-openai-responses and none exists", () => {
		const payload = {
			tools: [{ name: "other_tool" }],
		};

		const result = addOpenAiWebSearchToPayload("azure-openai-responses", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toContainEqual({ type: "web_search" });
	});

	it("preserves caller-supplied web_search_preview and does not duplicate", () => {
		const payload = {
			tools: [{ type: "web_search_preview" }, { name: "other_tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-responses", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		const webSearchTools = result.tools.filter(
			(tool) => tool.type === "web_search" || tool.type === "web_search_preview",
		);
		expect(webSearchTools).toHaveLength(1);
		expect(webSearchTools[0]).toEqual({ type: "web_search_preview" });
	});

	it("strips function-tool web_search and replaces it with native on openai-responses", () => {
		const payload = {
			tools: [{ name: "web_search", description: "pi-websearch function" }, { name: "other_tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-responses", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).not.toContainEqual({ name: "web_search", description: "pi-websearch function" });
		expect(result.tools).toContainEqual({ type: "web_search" });
	});

	it("does not strip function-tool web_search when api is not Responses", () => {
		const payload = {
			tools: [{ name: "web_search", description: "pi-websearch function" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-completions", payload);

		expect(result).toBe(payload);
	});

	it("returns original payload reference when explicitly disabled", () => {
		process.env[ENABLE_ENV] = "0";
		const payload = {
			tools: [{ name: "web_search", description: "function tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-responses", payload);

		expect(result).toBe(payload);
	});

	it("still behaves as default-on when enable env is unset", () => {
		const payload = {
			tools: [{ name: "other_tool" }],
		};

		const result = addOpenAiWebSearchToPayload("openai-responses", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toContainEqual({ type: "web_search" });
	});
});

describe("isOpenaiWebSearchEnabled", () => {
	it("returns true when env is unset", () => {
		expect(isOpenaiWebSearchEnabled()).toBe(true);
	});

	it.each(["1", "true", "yes", "on", "TRUE", "YES", "  on  "])("returns true for truthy value %s", (value) => {
		process.env[ENABLE_ENV] = value;
		expect(isOpenaiWebSearchEnabled()).toBe(true);
	});

	it.each(["0", "false", "no", "off", "OFF", "  no  "])("returns false for falsy value %s", (value) => {
		process.env[ENABLE_ENV] = value;
		expect(isOpenaiWebSearchEnabled()).toBe(false);
	});

	it.each(["garbage", "enable", "enabled"])("returns true for unknown value %s", (value) => {
		process.env[ENABLE_ENV] = value;
		expect(isOpenaiWebSearchEnabled()).toBe(true);
	});
});

describe("openai-web-search before_agent_start", () => {
	it("does not append system prompt when explicitly disabled", async () => {
		process.env[ENABLE_ENV] = "off";

		type BeforeAgentStartHandler = (
			event: { systemPrompt: string },
			ctx: { model?: { api?: string } },
		) => Promise<{ systemPrompt: string } | undefined>;

		let beforeAgentStartHandler: BeforeAgentStartHandler | undefined;
		const pi = {
			on(eventName: string, handler: unknown) {
				if (eventName === "before_agent_start") {
					beforeAgentStartHandler = handler as BeforeAgentStartHandler;
				}
			},
		} satisfies Pick<ExtensionAPI, "on">;

		openaiWebSearchExtension(pi as ExtensionAPI);
		expect(beforeAgentStartHandler).toBeDefined();

		const result = await beforeAgentStartHandler?.(
			{ systemPrompt: "system" },
			{ model: { api: "openai-responses" } },
		);

		expect(result).toBeUndefined();
	});
});
