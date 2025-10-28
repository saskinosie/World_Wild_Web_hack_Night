var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Bj5wZp/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-Bj5wZp/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/mcp-lite/dist/index.js
var JSON_RPC_VERSION = "2.0";
var SUPPORTED_MCP_PROTOCOL_VERSIONS = {
  V2025_03_26: "2025-03-26",
  V2025_06_18: "2025-06-18"
};
var SUPPORTED_MCP_PROTOCOL_VERSIONS_LIST = Object.values(SUPPORTED_MCP_PROTOCOL_VERSIONS);
var MCP_PROTOCOL_HEADER = "MCP-Protocol-Version";
var MCP_SESSION_ID_HEADER = "MCP-Session-Id";
var MCP_LAST_EVENT_ID_HEADER = "Last-Event-ID";
var SSE_ACCEPT_HEADER = "text/event-stream";
var METHODS = {
  INITIALIZE: "initialize",
  PING: "ping",
  TOOLS: {
    LIST: "tools/list",
    CALL: "tools/call"
  },
  PROMPTS: {
    LIST: "prompts/list",
    GET: "prompts/get"
  },
  RESOURCES: {
    LIST: "resources/list",
    TEMPLATES_LIST: "resources/templates/list",
    READ: "resources/read",
    SUBSCRIBE: "resources/subscribe",
    UNSUBSCRIBE: "resources/unsubscribe"
  },
  COMPLETION: {
    COMPLETE: "completion/complete"
  },
  ELICITATION: {
    CREATE: "elicitation/create"
  },
  SAMPLING: {
    CREATE: "sampling/createMessage"
  },
  NOTIFICATIONS: {
    CANCELLED: "notifications/cancelled",
    INITIALIZED: "notifications/initialized",
    PROGRESS: "notifications/progress",
    ROOTS: {
      LIST_CHANGED: "notifications/roots/list_changed"
    },
    TOOLS: {
      LIST_CHANGED: "notifications/tools/list_changed"
    },
    PROMPTS: {
      LIST_CHANGED: "notifications/prompts/list_changed"
    },
    RESOURCES: {
      LIST_CHANGED: "notifications/resources/list_changed"
    }
  },
  LOGGING: {
    SET_LEVEL: "logging/setLevel"
  }
};
var GLOBAL_NOTIFICATIONS = [
  METHODS.NOTIFICATIONS.TOOLS.LIST_CHANGED,
  METHODS.NOTIFICATIONS.PROMPTS.LIST_CHANGED,
  METHODS.NOTIFICATIONS.RESOURCES.LIST_CHANGED
];
var SSE_STREAM_ID = "_GET_stream";
var RpcError = class extends Error {
  code;
  data;
  cause;
  constructor(code, message, data, cause) {
    super(message);
    this.name = "RpcError";
    this.code = code;
    this.data = data;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  toJson() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
};
__name(RpcError, "RpcError");
function isObject(value) {
  return typeof value === "object" && value !== null;
}
__name(isObject, "isObject");
function objectWithKey(value, key) {
  return isObject(value) && key in value;
}
__name(objectWithKey, "objectWithKey");
function objectWithDefinedKey(value, key) {
  if (!isObject(value)) {
    return false;
  }
  const candidate = value;
  if (!(key in candidate)) {
    return false;
  }
  return candidate[key] !== void 0;
}
__name(objectWithDefinedKey, "objectWithDefinedKey");
function objectWithKeyAndValue(value, key, expectedValue) {
  return objectWithKey(value, key) && value[key] === expectedValue;
}
__name(objectWithKeyAndValue, "objectWithKeyAndValue");
function objectWithKeyOfType(value, key, typeGuard) {
  return objectWithKey(value, key) && typeGuard(value[key]);
}
__name(objectWithKeyOfType, "objectWithKeyOfType");
function isString(value) {
  return typeof value === "string";
}
__name(isString, "isString");
function isNumber(value) {
  return typeof value === "number";
}
__name(isNumber, "isNumber");
function errorToResponse(err, requestId) {
  if (requestId === void 0) {
    return null;
  }
  if (err instanceof RpcError) {
    return createJsonRpcError(requestId, err.toJson());
  }
  const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : err;
  return createJsonRpcError(requestId, new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal error", errorData).toJson());
}
__name(errorToResponse, "errorToResponse");
var JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};
function isJsonRpcNotification(obj) {
  if (!isObject(obj)) {
    return false;
  }
  const candidate = obj;
  if (candidate.jsonrpc !== "2.0") {
    return false;
  }
  if (!isString(candidate.method)) {
    return false;
  }
  if ("id" in candidate) {
    return false;
  }
  return true;
}
__name(isJsonRpcNotification, "isJsonRpcNotification");
function isJsonRpcRequest(obj) {
  if (!isObject(obj)) {
    return false;
  }
  const candidate = obj;
  if (candidate.jsonrpc !== "2.0") {
    return false;
  }
  if (!isString(candidate.method)) {
    return false;
  }
  if (!("id" in candidate)) {
    return false;
  }
  const id = candidate.id;
  if (!isString(id) && !isNumber(id) && id !== null) {
    return false;
  }
  return true;
}
__name(isJsonRpcRequest, "isJsonRpcRequest");
function isJsonRpcResponse(obj) {
  if (!isObject(obj)) {
    return false;
  }
  const candidate = obj;
  if (candidate.jsonrpc !== "2.0") {
    return false;
  }
  if (!("id" in candidate)) {
    return false;
  }
  const id = candidate.id;
  if (!isString(id) && !isNumber(id) && id !== null) {
    return false;
  }
  if (!("result" in candidate) && !("error" in candidate)) {
    return false;
  }
  return true;
}
__name(isJsonRpcResponse, "isJsonRpcResponse");
function createJsonRpcResponse(id, result) {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id,
    result
  };
}
__name(createJsonRpcResponse, "createJsonRpcResponse");
function createJsonRpcError(id, error) {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id,
    error
  };
}
__name(createJsonRpcError, "createJsonRpcError");
function isInitializeParams(obj) {
  if (!isObject(obj)) {
    return false;
  }
  const candidate = obj;
  if (!objectWithKeyOfType(candidate, "protocolVersion", isString)) {
    return false;
  }
  if (objectWithDefinedKey(candidate, "capabilities") && !objectWithKeyOfType(candidate, "capabilities", isObject)) {
    return false;
  }
  if (objectWithDefinedKey(candidate, "clientInfo")) {
    if (!objectWithKeyOfType(candidate, "clientInfo", isObject)) {
      return false;
    }
    const clientInfoObj = candidate.clientInfo;
    if (!isClientInfo(clientInfoObj)) {
      return false;
    }
  }
  return true;
}
__name(isInitializeParams, "isInitializeParams");
function isClientInfo(obj) {
  if (!objectWithKeyOfType(obj, "name", isString)) {
    return false;
  }
  if (!objectWithKeyOfType(obj, "version", isString)) {
    return false;
  }
  return true;
}
__name(isClientInfo, "isClientInfo");
function isStandardSchema(value) {
  return value !== null && (typeof value === "object" || typeof value === "function") && "~standard" in value && typeof value["~standard"] === "object" && value["~standard"].version === 1;
}
__name(isStandardSchema, "isStandardSchema");
function isGlobalNotification(notificationMethod) {
  for (const globalNotification of GLOBAL_NOTIFICATIONS) {
    if (notificationMethod === globalNotification) {
      return true;
    }
  }
  return false;
}
__name(isGlobalNotification, "isGlobalNotification");
function isSamplingResult(o) {
  return objectWithKeyOfType(o, "content", isSamplingContent);
}
__name(isSamplingResult, "isSamplingResult");
function isSamplingContent(o) {
  return isSamplingTextContent(o) || isSamplingImageContent(o) || isSamplingAudioContent(o);
}
__name(isSamplingContent, "isSamplingContent");
function isSamplingTextContent(o) {
  return objectWithKeyAndValue(o, "type", "text") && objectWithKeyOfType(o, "text", isString);
}
__name(isSamplingTextContent, "isSamplingTextContent");
function isSamplingImageContent(o) {
  return objectWithKeyAndValue(o, "type", "image") && objectWithKeyOfType(o, "data", isString);
}
__name(isSamplingImageContent, "isSamplingImageContent");
function isSamplingAudioContent(o) {
  return objectWithKeyAndValue(o, "type", "audio") && objectWithKeyOfType(o, "data", isString);
}
__name(isSamplingAudioContent, "isSamplingAudioContent");
function resolveSchema(schema, schemaAdapter) {
  if (!schema)
    return { resolvedSchema: { type: "object" } };
  if (isStandardSchema(schema)) {
    if (!schemaAdapter) {
      const vendor = schema["~standard"].vendor;
      throw new Error(`Cannot use Standard Schema (vendor: "${vendor}") without a schema adapter. Configure a schema adapter when creating McpServer.`);
    }
    const jsonSchema = schemaAdapter(schema);
    return { resolvedSchema: jsonSchema, validator: schema };
  }
  return { resolvedSchema: schema };
}
__name(resolveSchema, "resolveSchema");
function createValidationFunction(validator, input) {
  if (isStandardSchema(validator)) {
    const result = validator["~standard"].validate(input);
    if (result instanceof Promise) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Async validation not supported in this context");
    }
    if ("issues" in result && result.issues?.length) {
      const messages = result.issues.map((i) => i.message).join(", ");
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, `Validation failed: ${messages}`);
    }
    return result.value;
  }
  if (validator && typeof validator === "object" && "validate" in validator) {
    const validatorObj = validator;
    const result = validatorObj.validate(input);
    if (result?.ok && result.data !== void 0) {
      return result.data;
    }
    throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Validation failed");
  }
  throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Invalid validator");
}
__name(createValidationFunction, "createValidationFunction");
function extractArgumentsFromSchema(schema) {
  if (!schema || typeof schema !== "object") {
    return [];
  }
  const schemaObj = schema;
  if (schemaObj.type === "object" && schemaObj.properties) {
    const properties = schemaObj.properties;
    const required = schemaObj.required || [];
    return Object.entries(properties).map(([name, propSchema]) => {
      const prop = propSchema;
      return {
        name,
        description: prop.description,
        required: required.includes(name)
      };
    });
  }
  return [];
}
__name(extractArgumentsFromSchema, "extractArgumentsFromSchema");
function toElicitationRequestedSchema(schema, strict = false) {
  if (isStandardSchema(schema)) {
    throw new Error("Standard Schema inputs must be converted via resolveSchema first");
  }
  if (!schema || typeof schema !== "object") {
    if (strict) {
      throw new Error("Schema must be an object");
    }
    return { type: "object", properties: {} };
  }
  const schemaObj = schema;
  if (schemaObj.type !== "object") {
    if (strict) {
      throw new Error("Root schema must be of type 'object'");
    }
    return { type: "object", properties: {} };
  }
  if (!schemaObj.properties || typeof schemaObj.properties !== "object") {
    if (strict) {
      throw new Error("Object schema must have properties");
    }
    return { type: "object", properties: {} };
  }
  const properties = schemaObj.properties;
  const requiredArray = Array.isArray(schemaObj.required) ? schemaObj.required : [];
  const elicitationProperties = {};
  const validRequired = [];
  for (const [propName, propSchema] of Object.entries(properties)) {
    const projectedProp = projectPropertyToElicitation(propSchema, strict);
    if (projectedProp !== null) {
      elicitationProperties[propName] = projectedProp;
      if (requiredArray.includes(propName)) {
        validRequired.push(propName);
      }
    }
  }
  const result = {
    type: "object",
    properties: elicitationProperties
  };
  if (validRequired.length > 0) {
    result.required = validRequired;
  }
  return result;
}
__name(toElicitationRequestedSchema, "toElicitationRequestedSchema");
function projectPropertyToElicitation(propSchema, strict) {
  if (!propSchema || typeof propSchema !== "object") {
    if (strict) {
      throw new Error("Property schema must be an object");
    }
    return null;
  }
  const prop = propSchema;
  const propType = prop.type;
  if (propType === "string" || propType === "number" || propType === "integer" || propType === "boolean") {
    const result = { type: propType };
    if (typeof prop.description === "string") {
      result.description = prop.description;
    }
    if (prop.default !== void 0) {
      result.default = prop.default;
    }
    if (propType === "string") {
      if (typeof prop.minLength === "number") {
        result.minLength = prop.minLength;
      }
      if (typeof prop.maxLength === "number") {
        result.maxLength = prop.maxLength;
      }
      if (typeof prop.format === "string") {
        const supportedFormats = ["email", "uri", "date", "date-time"];
        if (supportedFormats.includes(prop.format)) {
          result.format = prop.format;
        } else if (strict) {
          throw new Error(`Unsupported string format: ${prop.format}`);
        }
      }
      if (Array.isArray(prop.enum)) {
        const enumValues = prop.enum;
        const enumNames = Array.isArray(prop.enumNames) ? prop.enumNames : void 0;
        if (enumValues.every((val) => typeof val === "string")) {
          result.enum = enumValues;
          if (enumNames && enumNames.length === enumValues.length) {
            result.enumNames = enumNames;
          }
        } else if (strict) {
          throw new Error("Enum values must be strings for elicitation");
        }
      }
    }
    if (propType === "number" || propType === "integer") {
      if (typeof prop.minimum === "number") {
        result.minimum = prop.minimum;
      }
      if (typeof prop.maximum === "number") {
        result.maximum = prop.maximum;
      }
    }
    return result;
  }
  if (strict) {
    throw new Error(`Unsupported property type: ${propType}`);
  }
  return null;
}
__name(projectPropertyToElicitation, "projectPropertyToElicitation");
function getProgressToken(message) {
  if (isObject(message.params)) {
    const params = message.params;
    const meta = params._meta;
    if (objectWithKey(meta, "progressToken")) {
      return meta.progressToken;
    }
  }
  return;
}
__name(getProgressToken, "getProgressToken");
function createContext(message, requestId, options = {}) {
  const progressToken = options.progressToken !== void 0 ? options.progressToken : getProgressToken(message);
  const context = {
    request: message,
    authInfo: options.authInfo,
    requestId,
    response: null,
    env: {},
    state: {},
    progressToken,
    validate: (validator, input) => createValidationFunction(validator, input),
    client: {
      supports: (feature) => {
        if (options.clientCapabilities) {
          return feature in options.clientCapabilities;
        }
        return false;
      }
    },
    elicit: async (params, elicitOptions) => {
      if (!context.client.supports("elicitation")) {
        throw new RpcError(JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND, "Elicitation not supported by client");
      }
      const { resolvedSchema } = resolveSchema(params.schema, options.schemaAdapter);
      const requestedSchema = toElicitationRequestedSchema(resolvedSchema, elicitOptions?.strict);
      const elicitRequest = {
        jsonrpc: "2.0",
        id: Math.random().toString(36).substring(7),
        method: METHODS.ELICITATION.CREATE,
        params: {
          message: params.message,
          requestedSchema
        }
      };
      if (!options.clientRequestSender) {
        throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Client request sender not configured");
      }
      const response = await options.clientRequestSender(context.session?.id, elicitRequest, {
        relatedRequestId: requestId,
        timeout_ms: elicitOptions?.timeout_ms
      });
      if (response.error) {
        throw new RpcError(response.error.code, response.error.message, response.error.data);
      }
      return response.result;
    },
    sample: async (params, sampleOptions) => {
      if (!context.client.supports("sampling")) {
        throw new RpcError(JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND, "Sampling not supported by client");
      }
      const samplingRequest = {
        jsonrpc: "2.0",
        id: Math.random().toString(36).substring(7),
        method: METHODS.SAMPLING.CREATE,
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: params.prompt
              }
            }
          ],
          modelPreferences: params.modelPreferences,
          systemPrompt: params.systemPrompt,
          maxTokens: params.maxTokens
        }
      };
      if (!options.clientRequestSender) {
        throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Client request sender not configured");
      }
      const response = await options.clientRequestSender(context.session?.id, samplingRequest, {
        relatedRequestId: requestId,
        timeout_ms: sampleOptions?.timeout_ms
      });
      if (response.error) {
        throw new RpcError(response.error.code, response.error.message, response.error.data);
      }
      if (!isSamplingResult(response.result)) {
        console.error("Unexpected sampling response format from client", JSON.stringify(response.result, null, 2));
        throw new RpcError(-32602, "Unexpected sampling response format from client");
      }
      return response.result;
    }
  };
  if (progressToken && options.progressSender) {
    context.progress = async (update) => {
      await options.progressSender?.(update);
    };
  }
  if (options.sessionId) {
    context.session = {
      id: options.sessionId,
      protocolVersion: options.sessionProtocolVersion || SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_03_26
    };
  }
  return context;
}
__name(createContext, "createContext");
function compileUriTemplate(template) {
  const isStatic = !template.includes("{");
  if (isStatic) {
    return {
      match: (uri) => uri === template ? {} : null,
      type: "resource"
    };
  }
  const queryMatch = template.match(/\{\?([^}]+)\}/);
  const queryParams = queryMatch?.[1] ? queryMatch[1].split(",").map((p) => p.trim()) : [];
  const pathTemplate = template.replace(/\{\?[^}]+\}/, "");
  let escapedTemplate = pathTemplate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  escapedTemplate = escapedTemplate.replace(/\\{([^}*]+)\\*\\}/g, "(?<$1>.*)").replace(/\\{([^}]+)\\}/g, "(?<$1>[^/?]+)");
  const regex = new RegExp(`^${escapedTemplate}$`);
  return {
    match: (uri) => {
      try {
        const [pathPart] = uri.split("?");
        const matchTarget = queryParams.length > 0 ? pathPart ?? uri : uri;
        const pathMatch = matchTarget.match(regex);
        if (!pathMatch)
          return null;
        const vars = { ...pathMatch.groups };
        if (queryParams.length > 0) {
          try {
            const url = new URL(uri);
            for (const param of queryParams) {
              const value = url.searchParams.get(param);
              if (value !== null) {
                vars[param] = value;
              }
            }
          } catch {
          }
        }
        return vars;
      } catch {
        return null;
      }
    },
    type: "resource_template"
  };
}
__name(compileUriTemplate, "compileUriTemplate");
function isSupportedVersion(version) {
  return SUPPORTED_MCP_PROTOCOL_VERSIONS_LIST.includes(version);
}
__name(isSupportedVersion, "isSupportedVersion");
async function runMiddlewares(middlewares, ctx, tail) {
  const dispatch = /* @__PURE__ */ __name(async (i) => {
    if (i < middlewares.length) {
      const middleware = middlewares[i];
      if (middleware) {
        await middleware(ctx, () => dispatch(i + 1));
      } else {
        await dispatch(i + 1);
      }
    } else {
      await tail();
    }
  }, "dispatch");
  await dispatch(0);
}
__name(runMiddlewares, "runMiddlewares");
var McpServer = class {
  methods = {};
  initialized = false;
  serverInfo;
  middlewares = [];
  capabilities = {};
  onErrorHandler;
  schemaAdapter;
  logger;
  tools = /* @__PURE__ */ new Map();
  prompts = /* @__PURE__ */ new Map();
  resources = /* @__PURE__ */ new Map();
  notificationSender;
  clientRequestSender;
  constructor(options) {
    this.serverInfo = {
      name: options.name,
      version: options.version
    };
    this.schemaAdapter = options.schemaAdapter;
    this.logger = options.logger || console;
    this.methods = {
      [METHODS.INITIALIZE]: this.handleInitialize.bind(this),
      [METHODS.PING]: this.handlePing.bind(this),
      [METHODS.TOOLS.LIST]: this.handleToolsList.bind(this),
      [METHODS.TOOLS.CALL]: this.handleToolsCall.bind(this),
      [METHODS.PROMPTS.LIST]: this.handlePromptsList.bind(this),
      [METHODS.PROMPTS.GET]: this.handlePromptsGet.bind(this),
      [METHODS.RESOURCES.LIST]: this.handleResourcesList.bind(this),
      [METHODS.RESOURCES.TEMPLATES_LIST]: this.handleResourceTemplatesList.bind(this),
      [METHODS.RESOURCES.READ]: this.handleResourcesRead.bind(this),
      [METHODS.RESOURCES.SUBSCRIBE]: this.handleNotImplemented.bind(this),
      [METHODS.NOTIFICATIONS.CANCELLED]: this.handleNotificationCancelled.bind(this),
      [METHODS.NOTIFICATIONS.INITIALIZED]: this.handleNotificationInitialized.bind(this),
      [METHODS.NOTIFICATIONS.PROGRESS]: this.handleNotificationProgress.bind(this),
      [METHODS.NOTIFICATIONS.ROOTS.LIST_CHANGED]: this.handleNotificationRootsListChanged.bind(this),
      [METHODS.LOGGING.SET_LEVEL]: this.handleLoggingSetLevel.bind(this),
      [METHODS.RESOURCES.UNSUBSCRIBE]: this.handleNotImplemented.bind(this),
      [METHODS.COMPLETION.COMPLETE]: this.handleNotImplemented.bind(this)
    };
  }
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  onError(handler) {
    this.onErrorHandler = handler;
    return this;
  }
  tool(name, def) {
    if (!this.capabilities.tools) {
      this.capabilities.tools = { listChanged: true };
    }
    const { resolvedSchema, validator } = resolveSchema(def.inputSchema, this.schemaAdapter);
    const outputSchemaResolved = resolveSchema(def.outputSchema, this.schemaAdapter);
    const metadata = {
      name,
      inputSchema: resolvedSchema
    };
    if (def.description) {
      metadata.description = def.description;
    }
    if (def.title) {
      metadata.title = def.title;
    }
    if (def._meta) {
      metadata._meta = def._meta;
    }
    if (outputSchemaResolved.resolvedSchema && def.outputSchema) {
      metadata.outputSchema = outputSchemaResolved.resolvedSchema;
    }
    const entry = {
      metadata,
      handler: def.handler,
      validator,
      outputValidator: outputSchemaResolved.validator
    };
    this.tools.set(name, entry);
    if (this.initialized) {
      this.notificationSender?.(void 0, {
        method: METHODS.NOTIFICATIONS.TOOLS.LIST_CHANGED
      });
    }
    return this;
  }
  resource(template, meta, validatorsOrHandler, handler) {
    if (!this.capabilities.resources) {
      this.capabilities.resources = { listChanged: true };
    }
    const actualHandler = handler || validatorsOrHandler;
    const validators = handler ? validatorsOrHandler : void 0;
    const isStatic = !template.includes("{");
    const type = isStatic ? "resource" : "resource_template";
    const matcher = isStatic ? void 0 : compileUriTemplate(template);
    const metadata = isStatic ? {
      uri: template,
      ...meta
    } : {
      uriTemplate: template,
      ...meta
    };
    const entry = {
      metadata,
      handler: actualHandler,
      validators,
      matcher,
      type
    };
    this.resources.set(template, entry);
    if (this.initialized) {
      this.notificationSender?.(void 0, {
        method: METHODS.NOTIFICATIONS.RESOURCES.LIST_CHANGED
      });
    }
    return this;
  }
  prompt(name, def) {
    if (!this.capabilities.prompts) {
      this.capabilities.prompts = { listChanged: true };
    }
    let validator;
    let argumentDefs;
    if (def.arguments) {
      if (Array.isArray(def.arguments)) {
        argumentDefs = def.arguments;
      } else {
        const { resolvedSchema, validator: schemaValidator } = resolveSchema(def.arguments, this.schemaAdapter);
        validator = schemaValidator;
        argumentDefs = extractArgumentsFromSchema(resolvedSchema);
      }
    } else if (def.inputSchema) {
      const { resolvedSchema, validator: schemaValidator } = resolveSchema(def.inputSchema, this.schemaAdapter);
      validator = schemaValidator;
      argumentDefs = extractArgumentsFromSchema(resolvedSchema);
    }
    const metadata = {
      name,
      title: def.title,
      description: def.description
    };
    if (argumentDefs && argumentDefs.length > 0) {
      metadata.arguments = argumentDefs;
    }
    if (def._meta) {
      metadata._meta = def._meta;
    }
    const entry = {
      metadata,
      handler: def.handler,
      validator
    };
    this.prompts.set(name, entry);
    if (this.initialized) {
      this.notificationSender?.(void 0, {
        method: METHODS.NOTIFICATIONS.PROMPTS.LIST_CHANGED
      });
    }
    return this;
  }
  group(prefixOrOptionsOrChild, child) {
    let prefix = "";
    let suffix = "";
    let childServer;
    if (typeof prefixOrOptionsOrChild === "string") {
      prefix = prefixOrOptionsOrChild;
      childServer = child;
    } else if (prefixOrOptionsOrChild instanceof McpServer) {
      childServer = prefixOrOptionsOrChild;
    } else {
      prefix = prefixOrOptionsOrChild.prefix || "";
      suffix = prefixOrOptionsOrChild.suffix || "";
      childServer = child;
    }
    this.mountChild(prefix, suffix, childServer);
    return this;
  }
  _exportRegistries() {
    return {
      tools: Array.from(this.tools.entries()).map(([name, entry]) => ({
        name,
        entry
      })),
      prompts: Array.from(this.prompts.entries()).map(([name, entry]) => ({
        name,
        entry
      })),
      resources: Array.from(this.resources.entries()).map(([template, entry]) => ({ template, entry }))
    };
  }
  _exportMiddlewares() {
    return [...this.middlewares];
  }
  wrapWithMiddlewares(mws, handler) {
    return async (params, ctx) => {
      let result;
      let handlerCalled = false;
      await runMiddlewares(mws, ctx, async () => {
        result = await handler(params, ctx);
        handlerCalled = true;
      });
      if (!handlerCalled) {
        this.logger.error("[mcp-lite] Handler was not executed. A middleware in the child server's middleware chain did not call next(). This is a server configuration issue.");
        throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal server error");
      }
      return result;
    };
  }
  wrapResourceHandler(mws, handler) {
    return async (uri, vars, ctx) => {
      let result;
      let handlerCalled = false;
      await runMiddlewares(mws, ctx, async () => {
        result = await handler(uri, vars, ctx);
        handlerCalled = true;
      });
      if (!handlerCalled) {
        this.logger.error("[mcp-lite] Resource handler was not executed. A middleware in the child server's middleware chain did not call next(). This is a server configuration issue.");
        throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal server error");
      }
      if (!result) {
        this.logger.error("[mcp-lite] Resource handler returned no result. This is a server implementation issue.");
        throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal server error");
      }
      return result;
    };
  }
  mountChild(prefix, suffix, child) {
    const buildScopedName = /* @__PURE__ */ __name((originalName) => {
      let scopedName = originalName;
      if (prefix)
        scopedName = `${prefix}/${scopedName}`;
      if (suffix)
        scopedName = `${scopedName}_${suffix}`;
      return scopedName;
    }, "buildScopedName");
    const regs = child._exportRegistries();
    const childMWs = child._exportMiddlewares();
    let addedTools = 0;
    let addedPrompts = 0;
    let addedResources = 0;
    for (const { name, entry } of regs.tools) {
      const qualifiedName = buildScopedName(name);
      if (!this.tools.has(qualifiedName)) {
        const wrappedHandler = childMWs.length > 0 ? this.wrapWithMiddlewares(childMWs, entry.handler) : entry.handler;
        const wrappedEntry = {
          metadata: { ...entry.metadata, name: qualifiedName },
          handler: wrappedHandler,
          validator: entry.validator,
          outputValidator: entry.outputValidator
        };
        this.tools.set(qualifiedName, wrappedEntry);
        addedTools++;
      } else {
        this.logger.warn(`[mcp-lite] Tool '${qualifiedName}' already exists, skipping duplicate from child server. This follows keep-first semantics where the first registered tool wins.`);
      }
    }
    for (const { name, entry } of regs.prompts) {
      const qualifiedName = buildScopedName(name);
      if (!this.prompts.has(qualifiedName)) {
        const wrappedHandler = childMWs.length > 0 ? this.wrapWithMiddlewares(childMWs, entry.handler) : entry.handler;
        const wrappedEntry = {
          metadata: { ...entry.metadata, name: qualifiedName },
          handler: wrappedHandler,
          validator: entry.validator
        };
        this.prompts.set(qualifiedName, wrappedEntry);
        addedPrompts++;
      } else {
        this.logger.warn(`[mcp-lite] Prompt '${qualifiedName}' already exists, skipping duplicate from child server. This follows keep-first semantics where the first registered prompt wins.`);
      }
    }
    for (const { template, entry } of regs.resources) {
      if (!this.resources.has(template)) {
        const wrappedHandler = childMWs.length > 0 ? this.wrapResourceHandler(childMWs, entry.handler) : entry.handler;
        const wrappedEntry = {
          ...entry,
          handler: wrappedHandler
        };
        this.resources.set(template, wrappedEntry);
        addedResources++;
      } else {
        this.logger.warn(`[mcp-lite] Resource '${template}' already exists, skipping duplicate from child server. This follows keep-first semantics where the first registered resource wins.`);
      }
    }
    if (addedTools > 0 && !this.capabilities.tools) {
      this.capabilities.tools = { listChanged: true };
    }
    if (addedPrompts > 0 && !this.capabilities.prompts) {
      this.capabilities.prompts = { listChanged: true };
    }
    if (addedResources > 0 && !this.capabilities.resources) {
      this.capabilities.resources = { listChanged: true };
    }
    if (this.initialized) {
      if (addedTools > 0) {
        this.notificationSender?.(void 0, {
          method: METHODS.NOTIFICATIONS.TOOLS.LIST_CHANGED
        });
      }
      if (addedPrompts > 0) {
        this.notificationSender?.(void 0, {
          method: METHODS.NOTIFICATIONS.PROMPTS.LIST_CHANGED
        });
      }
      if (addedResources > 0) {
        this.notificationSender?.(void 0, {
          method: METHODS.NOTIFICATIONS.RESOURCES.LIST_CHANGED
        });
      }
    }
  }
  _setNotificationSender(sender) {
    this.notificationSender = sender;
  }
  _setClientRequestSender(sender) {
    this.clientRequestSender = sender;
  }
  async _dispatch(message, contextOptions = {}) {
    const isNotification = isJsonRpcNotification(message);
    const requestId = isNotification ? void 0 : message.id;
    const progressToken = getProgressToken(message);
    const sessionId = contextOptions.sessionId;
    const progressSender = sessionId && this.notificationSender && progressToken ? (update) => this.notificationSender?.(sessionId, {
      method: METHODS.NOTIFICATIONS.PROGRESS,
      params: {
        progressToken,
        ...update
      }
    }, { relatedRequestId: requestId ?? void 0 }) : void 0;
    const ctx = createContext(message, requestId, {
      sessionId,
      sessionProtocolVersion: contextOptions.sessionProtocolVersion,
      progressToken,
      progressSender,
      authInfo: contextOptions.authInfo,
      clientCapabilities: contextOptions.clientCapabilities,
      schemaAdapter: this.schemaAdapter,
      clientRequestSender: this.clientRequestSender
    });
    const method = message.method;
    const handler = this.methods[method];
    const tail = /* @__PURE__ */ __name(async () => {
      if (!handler) {
        if (requestId === void 0) {
          return;
        }
        ctx.response = createJsonRpcError(requestId, new RpcError(JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND, "Method not found", method ? { method } : void 0).toJson());
        return;
      }
      const result = await handler(message.params, ctx);
      if (requestId !== void 0) {
        ctx.response = createJsonRpcResponse(requestId, result);
      }
    }, "tail");
    try {
      await runMiddlewares(this.middlewares, ctx, tail);
      if (requestId === void 0) {
        return null;
      }
      if (!ctx.response) {
        return createJsonRpcError(requestId, new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "No response generated").toJson());
      }
      return ctx.response;
    } catch (error) {
      if (requestId === void 0) {
        return null;
      }
      if (this.onErrorHandler) {
        try {
          const customError = await this.onErrorHandler(error, ctx);
          if (customError) {
            return createJsonRpcError(requestId, customError);
          }
        } catch (_handlerError) {
        }
      }
      return errorToResponse(error, requestId);
    }
  }
  async handleToolsList(_params, _ctx) {
    return {
      tools: Array.from(this.tools.values()).map((t) => t.metadata)
    };
  }
  async handleToolsCall(params, ctx) {
    if (!isObject(params)) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "tools/call requires an object with name and arguments");
    }
    const callParams = params;
    if (!isString(callParams.name)) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "tools/call requires a string 'name' field");
    }
    const toolName = callParams.name;
    const entry = this.tools.get(toolName);
    if (!entry) {
      throw new RpcError(JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND, "Method not found", { method: toolName });
    }
    let validatedArgs = callParams.arguments;
    if (entry.validator) {
      validatedArgs = ctx.validate(entry.validator, callParams.arguments);
    }
    const result = await entry.handler(validatedArgs, ctx);
    if (entry.outputValidator && "structuredContent" in result && !result.isError) {
      try {
        const validated = createValidationFunction(entry.outputValidator, result.structuredContent);
        result.structuredContent = validated;
      } catch (validationError) {
        throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, `Tool '${toolName}' returned invalid structured content: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
      }
    }
    return result;
  }
  async handlePromptsList(_params, _ctx) {
    return {
      prompts: Array.from(this.prompts.values()).map((p) => p.metadata)
    };
  }
  async handlePromptsGet(params, ctx) {
    if (!isObject(params)) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "prompts/get requires an object with name and arguments");
    }
    const getParams = params;
    if (!isString(getParams.name)) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "prompts/get requires a string 'name' field");
    }
    const promptName = getParams.name;
    const entry = this.prompts.get(promptName);
    if (!entry) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Invalid prompt name", { name: promptName });
    }
    let validatedArgs = getParams.arguments || {};
    if (entry.validator) {
      validatedArgs = ctx.validate(entry.validator, getParams.arguments);
    }
    const result = await entry.handler(validatedArgs, ctx);
    return result;
  }
  async handleResourcesList(_params, _ctx) {
    const resources = Array.from(this.resources.values()).filter((entry) => entry.type === "resource").map((entry) => entry.metadata);
    return { resources };
  }
  async handleResourceTemplatesList(_params, _ctx) {
    const resourceTemplates = Array.from(this.resources.values()).filter((entry) => entry.type === "resource_template").map((entry) => entry.metadata);
    return { resourceTemplates };
  }
  async handleResourcesRead(params, ctx) {
    if (typeof params !== "object" || params === null) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "resources/read requires an object with uri");
    }
    const readParams = params;
    if (typeof readParams.uri !== "string") {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "resources/read requires a string 'uri' field");
    }
    const uri = readParams.uri;
    let matchedEntry = null;
    let vars = {};
    const directEntry = this.resources.get(uri);
    if (directEntry?.type === "resource") {
      matchedEntry = directEntry;
    }
    if (!matchedEntry) {
      for (const entry of this.resources.values()) {
        if (entry.type === "resource_template" && entry.matcher) {
          const matchResult = entry.matcher.match(uri);
          if (matchResult !== null) {
            matchedEntry = entry;
            vars = matchResult;
            break;
          }
        }
      }
    }
    if (!matchedEntry) {
      throw new RpcError(JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND, "Method not found", { uri });
    }
    let validatedVars = vars;
    if (matchedEntry.validators) {
      validatedVars = {};
      for (const [key, validator] of Object.entries(matchedEntry.validators)) {
        if (key in vars) {
          try {
            validatedVars[key] = ctx.validate(validator, vars[key]);
          } catch (validationError) {
            throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, `Validation failed for parameter '${key}': ${validationError instanceof Error ? validationError.message : String(validationError)}`);
          }
        }
      }
      for (const [key, value] of Object.entries(vars)) {
        if (!(key in matchedEntry.validators)) {
          validatedVars[key] = value;
        }
      }
    }
    try {
      const url = { href: uri };
      const result = await matchedEntry.handler(url, validatedVars, ctx);
      return result;
    } catch (error) {
      if (error instanceof RpcError) {
        throw error;
      }
      throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal error", error instanceof Error ? { message: error.message } : error);
    }
  }
  async handleInitialize(params, _ctx) {
    if (!isInitializeParams(params)) {
      throw new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Invalid initialize parameters");
    }
    const initParams = params;
    const requested = initParams.protocolVersion;
    let negotiatedVersion;
    if (isSupportedVersion(requested)) {
      negotiatedVersion = requested;
    } else {
      negotiatedVersion = SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_03_26;
      this.logger?.warn?.(`Client requested unsupported protocol version ${requested}, negotiating to ${negotiatedVersion}`);
    }
    this.initialized = true;
    return {
      protocolVersion: negotiatedVersion,
      serverInfo: this.serverInfo,
      capabilities: this.capabilities
    };
  }
  async handlePing() {
    return {};
  }
  async handleNotificationCancelled(_params, _ctx) {
    return {};
  }
  async handleNotificationInitialized(_params, _ctx) {
    return {};
  }
  async handleNotificationProgress(_params, _ctx) {
    return {};
  }
  async handleNotificationRootsListChanged(_params, _ctx) {
    return {};
  }
  async handleLoggingSetLevel(_params, _ctx) {
    return {};
  }
  async handleNotImplemented(_params, ctx) {
    throw new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Not implemented", {
      method: ctx.request.method
    });
  }
};
__name(McpServer, "McpServer");
function createSSEStream(options) {
  const encoder = new TextEncoder();
  let controller;
  let closed = false;
  const end = /* @__PURE__ */ __name(() => {
    if (closed)
      return;
    closed = true;
    try {
      controller.close();
    } catch (_error) {
    }
    try {
      options?.onClose?.();
    } catch (_e) {
    }
  }, "end");
  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
    cancel() {
      end();
    }
  });
  const writer = {
    write(message, eventId) {
      if (closed)
        return;
      try {
        let sse = "";
        if (eventId)
          sse += `id: ${eventId}
`;
        sse += `data: ${JSON.stringify(message)}

`;
        controller.enqueue(encoder.encode(sse));
      } catch (_error) {
        end();
      }
    },
    end
  };
  return { stream, writer };
}
__name(createSSEStream, "createSSEStream");
function respondToInvalidJsonRpc() {
  const errorResponse = createJsonRpcError(null, new RpcError(JSON_RPC_ERROR_CODES.INVALID_REQUEST, "Invalid JSON-RPC 2.0 message format").toJson());
  return new Response(JSON.stringify(errorResponse), {
    status: 400,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(respondToInvalidJsonRpc, "respondToInvalidJsonRpc");
function respondToProtocolMismatch(responseId, protocolHeader, expected) {
  const expectedVersion = expected || SUPPORTED_MCP_PROTOCOL_VERSIONS_LIST;
  const errorResponse = createJsonRpcError(responseId, new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Protocol version mismatch", {
    expectedVersion,
    receivedVersion: protocolHeader
  }).toJson());
  return new Response(JSON.stringify(errorResponse), {
    status: 400,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(respondToProtocolMismatch, "respondToProtocolMismatch");
function respondToMissingProtocolHeader(responseId) {
  const errorResponse = createJsonRpcError(responseId, new RpcError(JSON_RPC_ERROR_CODES.INVALID_PARAMS, "Missing required MCP-Protocol-Version header", {
    requiredHeader: "MCP-Protocol-Version"
  }).toJson());
  return new Response(JSON.stringify(errorResponse), {
    status: 400,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(respondToMissingProtocolHeader, "respondToMissingProtocolHeader");
function respondToMissingSessionId() {
  return new Response("Bad Request: Missing required session ID", {
    status: 400,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
__name(respondToMissingSessionId, "respondToMissingSessionId");
function parseJsonRpc(body) {
  try {
    const parsed = JSON.parse(body);
    return parsed;
  } catch (_error) {
    throw new RpcError(JSON_RPC_ERROR_CODES.PARSE_ERROR, "Invalid JSON");
  }
}
__name(parseJsonRpc, "parseJsonRpc");
var StreamableHttpTransport = class {
  server;
  sessionAdapter;
  clientRequestAdapter;
  allowedOrigins;
  allowedHosts;
  sessionStreams = /* @__PURE__ */ new Map();
  requestStreams = /* @__PURE__ */ new Map();
  constructor(options = {}) {
    this.sessionAdapter = options.sessionAdapter;
    this.clientRequestAdapter = options.clientRequestAdapter;
    this.allowedOrigins = options.allowedOrigins;
    this.allowedHosts = options.allowedHosts;
  }
  getRequestWriter(sessionId, requestId) {
    return this.requestStreams.get(`${sessionId}:${requestId}`);
  }
  getSessionWriter(sessionId) {
    return this.sessionStreams.get(sessionId);
  }
  cleanupSession(sessionId) {
    const sessionWriter = this.sessionStreams.get(sessionId);
    if (sessionWriter) {
      sessionWriter.end();
    }
    this.sessionStreams.delete(sessionId);
    for (const [key, writer] of this.requestStreams) {
      if (key.startsWith(`${sessionId}:`)) {
        writer.end();
        this.requestStreams.delete(key);
      }
    }
  }
  async getClientCapabilities(sessionId) {
    if (!sessionId) {
      return;
    }
    if (!this.sessionAdapter) {
      return {};
    }
    try {
      const sessionData = await this.sessionAdapter.get(sessionId);
      return sessionData?.meta?.clientCapabilities;
    } catch {
      return;
    }
  }
  async getSessionProtocolVersion(sessionId) {
    if (!sessionId || !this.sessionAdapter) {
      return;
    }
    try {
      const sessionData = await this.sessionAdapter.get(sessionId);
      return sessionData?.meta?.protocolVersion;
    } catch {
      return;
    }
  }
  async sendClientRequest(sessionId, request, options) {
    if (!this.clientRequestAdapter) {
      throw new Error("Client request adapter not configured");
    }
    if (request.id === null || request.id === void 0) {
      throw new Error("Client request must have a valid id");
    }
    const { promise } = this.clientRequestAdapter.createPending(sessionId, request.id, { timeout_ms: options?.timeout_ms });
    const jsonRpcRequest = {
      jsonrpc: JSON_RPC_VERSION,
      id: request.id,
      method: request.method,
      params: request.params
    };
    let delivered = false;
    if (sessionId && options?.relatedRequestId !== void 0) {
      const requestWriter = this.getRequestWriter(sessionId, options.relatedRequestId);
      if (requestWriter) {
        requestWriter.write(jsonRpcRequest);
        delivered = true;
      }
    }
    if (!delivered && sessionId) {
      const sessionWriter = this.getSessionWriter(sessionId);
      if (sessionWriter) {
        sessionWriter.write(jsonRpcRequest);
        delivered = true;
      }
    }
    if (!delivered) {
      this.clientRequestAdapter.rejectPending(sessionId, request.id, new Error("No active streams to deliver client request"));
      throw new Error("No active streams to deliver client request");
    }
    return promise;
  }
  bind(server2) {
    this.server = server2;
    if (this.clientRequestAdapter) {
      server2._setClientRequestSender(this.sendClientRequest.bind(this));
    }
    server2._setNotificationSender(async (sessionId, notification, options) => {
      const jsonRpcNotification = {
        jsonrpc: JSON_RPC_VERSION,
        method: notification.method,
        params: notification.params
      };
      if (this.sessionAdapter) {
        const relatedRequestId = options?.relatedRequestId;
        if (sessionId) {
          let eventId;
          if (this.sessionAdapter) {
            eventId = await this.sessionAdapter.appendEvent(sessionId, SSE_STREAM_ID, jsonRpcNotification);
          }
          if (relatedRequestId !== void 0) {
            const requestWriter = this.getRequestWriter(sessionId, relatedRequestId);
            if (requestWriter) {
              requestWriter.write(jsonRpcNotification);
              return;
            }
          }
          const sessionWriter = this.getSessionWriter(sessionId);
          if (sessionWriter) {
            sessionWriter.write(jsonRpcNotification, eventId);
          }
        }
        const shouldBroadcastToAllSessions = !sessionId || isGlobalNotification(notification.method);
        if (shouldBroadcastToAllSessions) {
          for (const [sid, writer] of this.sessionStreams) {
            if (sid !== sessionId) {
              writer.write(jsonRpcNotification);
            }
          }
        }
      } else {
        if (options?.relatedRequestId && sessionId) {
          const requestWriter = this.getRequestWriter(sessionId, options.relatedRequestId);
          if (requestWriter) {
            requestWriter.write(jsonRpcNotification);
          }
        }
        const shouldBroadcastToAllRequests = !sessionId || isGlobalNotification(notification.method);
        if (shouldBroadcastToAllRequests) {
          for (const [requestKey, writer] of this.requestStreams) {
            if (!sessionId || !requestKey.startsWith(`${sessionId}:`)) {
              writer.write(jsonRpcNotification);
            }
          }
        }
      }
    });
    return this.handleRequest.bind(this);
  }
  async handleRequest(request, options) {
    if (!this.server) {
      throw new Error("Transport not bound to a server");
    }
    if (this.allowedHosts) {
      const host = request.headers.get("Host");
      if (host && !this.allowedHosts.includes(host)) {
        return new Response("Forbidden", { status: 403 });
      }
    }
    if (this.allowedOrigins) {
      const origin = request.headers.get("Origin");
      if (origin && !this.allowedOrigins.includes(origin)) {
        return new Response("Forbidden", { status: 403 });
      }
    }
    switch (request.method) {
      case "POST":
        return this.handlePost(request, { authInfo: options?.authInfo });
      case "GET":
        return this.handleGet(request);
      case "DELETE":
        return this.handleDelete(request);
      default: {
        const errorResponse = createJsonRpcError(null, new RpcError(JSON_RPC_ERROR_CODES.INVALID_REQUEST, "Method not supported").toJson());
        return new Response(JSON.stringify(errorResponse), {
          status: 405,
          headers: {
            Allow: "POST, GET, DELETE"
          }
        });
      }
    }
  }
  validateProtocolHeader(sessionVersion, protocolHeader, jsonRpcMessage, isNotification) {
    const responseId = isNotification ? null : jsonRpcMessage.id;
    if (sessionVersion === SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_06_18) {
      if (!protocolHeader) {
        return respondToMissingProtocolHeader(responseId);
      }
      if (protocolHeader !== sessionVersion) {
        return respondToProtocolMismatch(responseId, protocolHeader, sessionVersion);
      }
      return null;
    }
    if (sessionVersion === SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_03_26) {
      if (protocolHeader && protocolHeader !== sessionVersion) {
        return respondToProtocolMismatch(responseId, protocolHeader, sessionVersion);
      }
      return null;
    }
    if (protocolHeader && !SUPPORTED_MCP_PROTOCOL_VERSIONS_LIST.includes(protocolHeader)) {
      return respondToProtocolMismatch(responseId, protocolHeader, SUPPORTED_MCP_PROTOCOL_VERSIONS_LIST);
    }
    return null;
  }
  async handlePost(request, options) {
    try {
      const sessionId = request.headers.get(MCP_SESSION_ID_HEADER);
      const body = await request.text();
      const jsonRpcMessage = parseJsonRpc(body);
      if (Array.isArray(jsonRpcMessage)) {
        let sessionVersion;
        if (this.sessionAdapter && sessionId) {
          const session = await this.sessionAdapter.get(sessionId);
          sessionVersion = session?.meta?.protocolVersion;
        }
        if (sessionVersion === SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_03_26) {
          return this.handleBatchRequest(jsonRpcMessage, sessionId, options);
        }
        const errorResponse = createJsonRpcError(null, new RpcError(JSON_RPC_ERROR_CODES.INVALID_REQUEST, "Batch requests are not supported in protocol version 2025-06-18").toJson());
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (isJsonRpcResponse(jsonRpcMessage)) {
        if (this.sessionAdapter && !sessionId) {
          return respondToMissingSessionId();
        }
        if (this.clientRequestAdapter && jsonRpcMessage.id !== null && jsonRpcMessage.id !== void 0) {
          this.clientRequestAdapter.resolvePending(sessionId || void 0, jsonRpcMessage.id, jsonRpcMessage);
        }
        return new Response(null, { status: 202 });
      }
      if (!isJsonRpcNotification(jsonRpcMessage) && !isJsonRpcRequest(jsonRpcMessage)) {
        return respondToInvalidJsonRpc();
      }
      const isNotification = isJsonRpcNotification(jsonRpcMessage);
      const isInitializeRequest = jsonRpcMessage.method === "initialize";
      const acceptHeader = request.headers.get("Accept");
      const protocolHeader = request.headers.get(MCP_PROTOCOL_HEADER);
      if (!isInitializeRequest) {
        let sessionVersion;
        if (this.sessionAdapter && sessionId) {
          const session = await this.sessionAdapter.get(sessionId);
          sessionVersion = session?.meta?.protocolVersion;
        }
        const validationError = this.validateProtocolHeader(sessionVersion, protocolHeader, jsonRpcMessage, isNotification);
        if (validationError) {
          return validationError;
        }
      }
      if (this.sessionAdapter && !sessionId && !isInitializeRequest) {
        return respondToMissingSessionId();
      }
      if (!isInitializeRequest && !isNotification && acceptHeader?.includes(SSE_ACCEPT_HEADER)) {
        return this.handlePostSse({
          request,
          jsonRpcRequest: jsonRpcMessage,
          sessionId,
          isNotification,
          authInfo: options?.authInfo
        });
      }
      const response = await this.server?._dispatch(jsonRpcMessage, {
        sessionId: sessionId || void 0,
        sessionProtocolVersion: await this.getSessionProtocolVersion(sessionId),
        authInfo: options?.authInfo,
        clientCapabilities: await this.getClientCapabilities(sessionId)
      });
      if (isInitializeRequest && response) {
        if (this.sessionAdapter) {
          const sessionId2 = this.sessionAdapter.generateSessionId();
          const initParams = jsonRpcMessage.params;
          const negotiatedVersion = response.result?.protocolVersion || SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_06_18;
          const sessionMeta = {
            protocolVersion: negotiatedVersion,
            clientInfo: initParams.clientInfo,
            clientCapabilities: initParams.capabilities
          };
          await this.sessionAdapter.create(sessionId2, sessionMeta);
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              [MCP_SESSION_ID_HEADER]: sessionId2
            }
          });
        }
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      if (response === null) {
        return new Response(null, { status: 202 });
      } else {
        const headers = {
          "Content-Type": "application/json"
        };
        if (this.sessionAdapter && !isInitializeRequest) {
          const sessionId2 = request.headers.get(MCP_SESSION_ID_HEADER);
          if (sessionId2) {
            headers[MCP_SESSION_ID_HEADER] = sessionId2;
          }
        }
        return new Response(JSON.stringify(response), {
          status: 200,
          headers
        });
      }
    } catch (error) {
      const errorResponse = createJsonRpcError(null, new RpcError(JSON_RPC_ERROR_CODES.PARSE_ERROR, "Parse error", error instanceof Error ? error.message : "Unknown parsing error").toJson());
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  }
  async handleBatchRequest(batch, sessionId, options) {
    const responses = [];
    const sessionProtocolVersion = await this.getSessionProtocolVersion(sessionId);
    const clientCapabilities = await this.getClientCapabilities(sessionId);
    for (const message of batch) {
      if (!isJsonRpcRequest(message) && !isJsonRpcNotification(message)) {
        responses.push(createJsonRpcError(null, new RpcError(JSON_RPC_ERROR_CODES.INVALID_REQUEST, "Invalid JSON-RPC 2.0 message in batch").toJson()));
        continue;
      }
      try {
        const response = await this.server?._dispatch(message, {
          sessionId: sessionId || void 0,
          sessionProtocolVersion,
          authInfo: options?.authInfo,
          clientCapabilities
        });
        if (response !== null && response !== void 0) {
          responses.push(response);
        }
      } catch (error) {
        const errorResponse = createJsonRpcError(message.id || null, new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal error processing batch item", error instanceof Error ? error.message : "Unknown error").toJson());
        responses.push(errorResponse);
      }
    }
    return new Response(JSON.stringify(responses), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...this.sessionAdapter && sessionId ? { [MCP_SESSION_ID_HEADER]: sessionId } : {}
      }
    });
  }
  async handlePostSse(args) {
    const { jsonRpcRequest, sessionId, isNotification, authInfo } = args;
    if (isNotification) {
      return new Response("Bad Request: POST SSE requires a request with 'id' (notifications not supported)", {
        status: 400
      });
    }
    const requestId = jsonRpcRequest.id;
    if (requestId === null || requestId === void 0) {
      return new Response("Bad Request: POST SSE requires a request with 'id'", {
        status: 400
      });
    }
    const effectiveSessionId = sessionId || crypto.randomUUID();
    const { stream, writer } = createSSEStream({
      onClose: () => {
        this.requestStreams.delete(`${effectiveSessionId}:${requestId}`);
      }
    });
    this.requestStreams.set(`${effectiveSessionId}:${requestId}`, writer);
    Promise.resolve(this.server?._dispatch(jsonRpcRequest, {
      sessionId: effectiveSessionId,
      sessionProtocolVersion: await this.getSessionProtocolVersion(effectiveSessionId),
      authInfo,
      clientCapabilities: await this.getClientCapabilities(effectiveSessionId)
    })).then(async (rpcResponse) => {
      if (rpcResponse !== null) {
        writer.write(rpcResponse);
      }
    }).catch((err) => {
      try {
        const responseId = jsonRpcRequest.id;
        if (responseId !== null && responseId !== void 0) {
          const errorResponse = createJsonRpcError(responseId, new RpcError(JSON_RPC_ERROR_CODES.INTERNAL_ERROR, "Internal error", err instanceof Error ? { message: err.message } : err).toJson());
          writer.write(errorResponse);
        }
      } catch (_) {
      }
    }).finally(() => {
      writer.end();
      this.requestStreams.delete(`${effectiveSessionId}:${requestId}`);
    });
    const headers = {
      "Content-Type": SSE_ACCEPT_HEADER,
      Connection: "keep-alive"
    };
    if (this.sessionAdapter && sessionId) {
      headers[MCP_SESSION_ID_HEADER] = sessionId;
    }
    return new Response(stream, {
      status: 200,
      headers
    });
  }
  async handleGet(request) {
    const accept = request.headers.get("Accept");
    if (!accept || !accept.includes(SSE_ACCEPT_HEADER)) {
      return new Response("Bad Request: Accept header must be text/event-stream", {
        status: 400
      });
    }
    const protocolHeader = request.headers.get(MCP_PROTOCOL_HEADER);
    if (protocolHeader && protocolHeader !== SUPPORTED_MCP_PROTOCOL_VERSIONS.V2025_06_18) {
      return new Response("Bad Request: Protocol version mismatch", {
        status: 400
      });
    }
    if (!this.sessionAdapter) {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const sessionId = request.headers.get(MCP_SESSION_ID_HEADER);
    if (!sessionId || !await this.sessionAdapter?.has(sessionId)) {
      return new Response("Bad Request: Invalid or missing session ID", {
        status: 400
      });
    }
    if (this.sessionStreams.has(sessionId)) {
      return new Response("Conflict: Stream already exists for session", {
        status: 409
      });
    }
    const { stream, writer } = createSSEStream({
      onClose: () => this.sessionStreams.delete(sessionId)
    });
    this.sessionStreams.set(sessionId, writer);
    const lastEventId = request.headers.get(MCP_LAST_EVENT_ID_HEADER);
    let attemptedReplay = false;
    if (lastEventId) {
      attemptedReplay = true;
      try {
        await this.sessionAdapter.replay(sessionId, lastEventId, (eid, msg) => {
          writer.write(msg, eid);
        });
      } catch (_error) {
        writer.end();
        return new Response("Internal Server Error: Replay failed", {
          status: 500
        });
      }
    }
    if (!attemptedReplay) {
      const pingNotification = {
        jsonrpc: JSON_RPC_VERSION,
        method: "ping",
        params: {}
      };
      writer.write(pingNotification);
    }
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": SSE_ACCEPT_HEADER,
        Connection: "keep-alive",
        [MCP_SESSION_ID_HEADER]: sessionId
      }
    });
  }
  async handleDelete(request) {
    const sessionId = request.headers.get(MCP_SESSION_ID_HEADER);
    if (!this.sessionAdapter) {
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (!sessionId) {
      return new Response("Bad Request: Missing session ID", {
        status: 400
      });
    }
    this.cleanupSession(sessionId);
    await this.sessionAdapter.delete(sessionId);
    return new Response(null, { status: 200 });
  }
};
__name(StreamableHttpTransport, "StreamableHttpTransport");

// src/index.ts
var server = new McpServer({
  name: "cook-engineering-manual-wrapper",
  version: "1.0.0"
});
server.tool("search_engineering_manual", {
  description: `Search the Cook Engineering Handbook for technical specifications,
formulas, charts, and guidelines. Use this for questions about fans, motors,
ductwork, HVAC systems, wind zones, seismic zones, etc.

Examples:
- "What is the friction loss for round elbows?"
- "Is Missouri a high wind zone?"
- "What are the motor efficiency requirements?"

This tool will automatically handle visual content like maps, charts, and diagrams.`,
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The technical question or search query"
      }
    },
    required: ["query"]
  },
  handler: async (args, ctx) => {
    const env = ctx.env;
    const pythonServerUrl = env.PYTHON_MCP_URL || "http://localhost:5001";
    try {
      const response = await fetch(`${pythonServerUrl}/call-tool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "search_engineering_manual",
          arguments: { query: args.query }
        })
      });
      if (!response.ok) {
        throw new Error(`Python server returned ${response.status}: ${await response.text()}`);
      }
      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: result.text || "No response from server"
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error calling Python MCP server: ${errorMessage}

Make sure the Python HTTP wrapper is running at ${pythonServerUrl}`
          }
        ],
        isError: true
      };
    }
  }
});
server.tool("get_page_direct", {
  description: `Retrieve a specific page from the Cook Engineering Handbook by page number.
Use this when you know the exact page you need or when search results reference a specific page.`,
  inputSchema: {
    type: "object",
    properties: {
      page_number: {
        type: "number",
        description: "Page number (1-150)"
      }
    },
    required: ["page_number"]
  },
  handler: async (args, ctx) => {
    const env = ctx.env;
    const pythonServerUrl = env.PYTHON_MCP_URL || "http://localhost:5001";
    try {
      const response = await fetch(`${pythonServerUrl}/call-tool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "get_page_direct",
          arguments: { page_number: args.page_number }
        })
      });
      if (!response.ok) {
        throw new Error(`Python server returned ${response.status}: ${await response.text()}`);
      }
      const result = await response.json();
      const content = [
        {
          type: "text",
          text: result.text || "No content found"
        }
      ];
      if (result.images && Array.isArray(result.images)) {
        for (const img of result.images) {
          content.push({
            type: "image",
            data: img.data,
            mimeType: img.mimeType
          });
        }
      }
      return { content };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error calling Python MCP server: ${errorMessage}

Make sure the Python HTTP wrapper is running at ${pythonServerUrl}`
          }
        ],
        isError: true
      };
    }
  }
});
server.tool("health_check", {
  description: "Check if the Python MCP server is accessible and responding",
  inputSchema: {
    type: "object",
    properties: {}
  },
  handler: async (_args, ctx) => {
    const env = ctx.env;
    const pythonServerUrl = env.PYTHON_MCP_URL || "http://localhost:5001";
    try {
      const response = await fetch(`${pythonServerUrl}/health`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `\u2705 Python MCP server is healthy!

Status: ${JSON.stringify(data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `\u274C Python MCP server is NOT accessible at ${pythonServerUrl}

Error: ${errorMessage}

Make sure:
1. The Python HTTP wrapper is running (python http_wrapper.py)
2. The URL is correct
3. For deployed version, use ngrok to expose your local server`
          }
        ],
        isError: true
      };
    }
  }
});
var transport = new StreamableHttpTransport();
var mcpHandler = transport.bind(server);
var src_default = {
  async fetch(request, env) {
    return mcpHandler(request, { authInfo: { env } });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Bj5wZp/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Bj5wZp/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
