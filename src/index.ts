import type { Api } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

type ToolDefinition = Record<string, unknown>;

const OPENAI_RESPONSES_APIS: ReadonlySet<Api> = new Set(["openai-responses", "azure-openai-responses"]);
const ENABLE_ENV = "PI_OPENAI_WEB_SEARCH";
const WEB_SEARCH_SOURCES_INCLUDE = "web_search_call.action.sources";
const STATUS_KEY = "pi-openai-web-search";
const WIDGET_KEY = "pi-openai-web-search";

function parseEnableEnv(envVar: string): boolean {
	const envValue = process.env[envVar];
	if (!envValue) {
		return true;
	}

	const normalized = envValue.trim().toLowerCase();
	if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
		return false;
	}

	if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
		return true;
	}

	// Unknown values fall back to default-on behavior.
	return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isOpenAiResponsesApi(api: Api | undefined): api is "openai-responses" | "azure-openai-responses" {
	return api !== undefined && OPENAI_RESPONSES_APIS.has(api);
}

function isNativeOpenAiWebSearchType(value: unknown): value is "web_search" | "web_search_preview" {
	return value === "web_search" || value === "web_search_preview";
}

function sanitizeTools(tools: unknown[]): ToolDefinition[] {
	const sanitized: ToolDefinition[] = [];
	for (const tool of tools) {
		if (!isRecord(tool)) {
			continue;
		}

		const shouldStripFunctionVariant = tool["name"] === "web_search" && !isNativeOpenAiWebSearchType(tool["type"]);
		if (!shouldStripFunctionVariant) {
			sanitized.push(tool);
		}
	}

	return sanitized;
}

function includeWebSearchSources(payload: Record<string, unknown>): string[] {
	const payloadInclude = payload["include"];
	const include = Array.isArray(payloadInclude)
		? payloadInclude.filter((value): value is string => typeof value === "string")
		: [];
	return include.includes(WEB_SEARCH_SOURCES_INCLUDE) ? include : [...include, WEB_SEARCH_SOURCES_INCLUDE];
}

export function addOpenAiWebSearchToPayload(api: Api | undefined, payload: unknown): unknown {
	if (!isOpenAiResponsesApi(api)) {
		return payload;
	}

	if (!isOpenaiWebSearchEnabled()) {
		return payload;
	}

	if (!isRecord(payload)) {
		return payload;
	}

	const payloadTools = payload["tools"];
	const tools: unknown[] = Array.isArray(payloadTools) ? payloadTools : [];
	const sanitizedTools = sanitizeTools(tools);
	const hasNativeWebSearch = sanitizedTools.some((tool) => isNativeOpenAiWebSearchType(tool["type"]));

	if (!hasNativeWebSearch) {
		// Verified in openai/openai-node src/resources/responses/responses.ts (2026-05-07):
		// GA discriminator includes type: "web_search" (preview variants also exist).
		sanitizedTools.push({ type: "web_search" });
	}

	return {
		...payload,
		tools: sanitizedTools,
		include: includeWebSearchSources(payload),
	};
}

export function isOpenaiWebSearchEnabled(): boolean {
	return parseEnableEnv(ENABLE_ENV);
}

function clearUi(ctx: ExtensionContext): void {
	if (!ctx.hasUI) return;
	ctx.ui.setStatus(STATUS_KEY, undefined);
	ctx.ui.setWidget(WIDGET_KEY, undefined);
}

function syncUi(ctx: ExtensionContext): void {
	clearUi(ctx);
}

export const OPENAI_WEB_SEARCH_SECTION = `
## Web Search

The native web_search tool is available in this session.
Use web_search when the user asks for current or online information.
Prefer web_search over guessing when freshness matters.
`;

export default function openaiWebSearchExtension(pi: ExtensionAPI): void {
	pi.on("before_provider_request", (event, ctx) => {
		return addOpenAiWebSearchToPayload(ctx.model?.api, event.payload);
	});

	pi.on("session_start", async (_event, ctx) => {
		syncUi(ctx);
	});

	pi.on("model_select", async (_event, ctx) => {
		syncUi(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		clearUi(ctx);
	});

	pi.on("before_agent_start", async (event, ctx) => {
		if (!isOpenAiResponsesApi(ctx.model?.api)) {
			return undefined;
		}

		if (!isOpenaiWebSearchEnabled()) {
			return undefined;
		}

		return {
			systemPrompt: `${event.systemPrompt}\n${OPENAI_WEB_SEARCH_SECTION}`,
		};
	});
}
