var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var { Readable } = import_stream.default;
var wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
var Blob = class {
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset2 = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset2);
      offset2 += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable.from(read(wm.get(this).parts));
  }
  slice(start2 = 0, end2 = this.size, type = "") {
    const { size } = this;
    let relativeStart = start2 < 0 ? Math.max(size + start2, 0) : Math.min(start2, size);
    let relativeEnd = end2 < 0 ? Math.max(size + end2, 0) : Math.min(end2, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var fetchBlob = Blob;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (err) => {
        const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2].error = error3;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new fetchBlob([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw err;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
    throw err;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values2] of Object.entries(raw)) {
        result.push(...values2.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values2 = this.getAll(name);
    if (values2.length === 0) {
      return null;
    }
    let value = values2.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values2 = this.getAll(key);
      if (key === "host") {
        result[key] = values2[0];
      } else {
        result[key] = values2.length > 1 ? values2 : values2[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response2 = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status || 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response2(clone(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response2(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response2.prototype, {
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash3 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash3.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request2 = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal !== null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request2(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request2.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch2(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request2(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response2(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch2(new Request2(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response2(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response2(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response2(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response2(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response2(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
Object.defineProperties(globalThis, {
  fetch: {
    enumerable: true,
    value: fetch2
  },
  Response: {
    enumerable: true,
    value: Response2
  },
  Request: {
    enumerable: true,
    value: Request2
  },
  Headers: {
    enumerable: true,
    value: Headers
  }
});

// node_modules/@sveltejs/kit/dist/ssr.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start2 = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn2) {
    set(fn2(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start2(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash3 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash3 = hash3 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash3 = hash3 * 33 ^ value[--i];
  }
  return (hash3 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2.path)},
						query: new URLSearchParams(${s$1(page2.query.toString())}),
						params: ${s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  if (loaded.error) {
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    const status = loaded.status;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
function resolve(base, path) {
  const baseparts = path[0] === "/" ? [] : base.slice(1).split("/");
  const pathparts = path[0] === "/" ? path.slice(1).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  return `/${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page: page2,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        if (options2.read && url.startsWith(options2.paths.assets)) {
          url = url.replace(options2.paths.assets, "");
        }
        if (url.startsWith("//")) {
          throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
        }
        let response;
        if (/^[a-zA-Z]+:/.test(url)) {
          const request2 = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, request2);
        } else {
          const [path, search] = url.split("?");
          const resolved = resolve(request.path, path);
          const filename = resolved.slice(1);
          const filename_html = `${filename}/index.html`;
          const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
          if (asset) {
            if (options2.read) {
              response = new Response(options2.read(asset.file), {
                headers: {
                  "content-type": asset.type
                }
              });
            } else {
              response = await fetch(`http://${page2.host}/${asset.file}`, opts);
            }
          }
          if (!response) {
            const headers = { ...opts.headers };
            if (opts.credentials !== "omit") {
              uses_credentials = true;
              headers.cookie = request.headers.cookie;
              if (!headers.authorization) {
                headers.authorization = request.headers.authorization;
              }
            }
            if (opts.body && typeof opts.body !== "string") {
              throw new Error("Request body must be a string");
            }
            const rendered = await respond({
              host: request.host,
              method: opts.method || "GET",
              headers,
              path: resolved,
              rawBody: opts.body,
              query: new URLSearchParams(search)
            }, options2, {
              fetched: url,
              initiator: route
            });
            if (rendered) {
              if (state.prerender) {
                state.prerender.dependencies.set(resolved, rendered);
              }
              response = new Response(rendered.body, {
                status: rendered.status,
                headers: rendered.headers
              });
            }
          }
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page: page2,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page: page2,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e) {
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    if (response) {
      if (typeof response !== "object") {
        return error(`Invalid response from route ${request.path}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      if (type === "application/octet-stream" && !(body instanceof Uint8Array)) {
        return error(`Invalid response from route ${request.path}: body must be an instance of Uint8Array if content type is application/octet-stream`);
      }
      if (body instanceof Uint8Array && type !== "application/octet-stream") {
        return error(`Invalid response from route ${request.path}: Uint8Array body must be accompanied by content-type: application/octet-stream header`);
      }
      let normalized_body;
      if (typeof body === "object" && (!type || type === "application/json")) {
        headers = { ...headers, "content-type": "application/json" };
        normalized_body = JSON.stringify(body);
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield key;
      }
    }
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value;
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  if (typeof raw === "string") {
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// node_modules/svelte/internal/index.mjs
function noop2() {
}
var identity = (x) => x;
function run(fn2) {
  return fn2();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
function compute_slots(slots) {
  const result = {};
  for (const key in slots) {
    result[key] = true;
  }
  return result;
}
var tasks = new Set();
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
var active_docs = new Set();
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn2) {
  get_current_component().$$.on_mount.push(fn2);
}
function afterUpdate(fn2) {
  get_current_component().$$.after_update.push(fn2);
}
function onDestroy(fn2) {
  get_current_component().$$.on_destroy.push(fn2);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn2) => {
        fn2.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
var resolved_promise = Promise.resolve();
var seen_callbacks = new Set();
var outroing = new Set();
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, classes_to_add) {
  const attributes = Object.assign({}, ...args);
  if (classes_to_add) {
    if (attributes.class == null) {
      attributes.class = classes_to_add;
    } else {
      attributes.class += " " + classes_to_add;
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function escape_attribute_value(value) {
  return typeof value === "string" ? escape2(value) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn2) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn2(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn2) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn2(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
  return classes ? ` class="${classes}"` : "";
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
      this[attr] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop2;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index2 = callbacks.indexOf(callback);
        if (index2 !== -1)
          callbacks.splice(index2, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}

// node_modules/svelte/store/index.mjs
var subscriber_queue2 = [];
function writable2(value, start2 = noop2) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue2.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn2) {
    set(fn2(value));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start2(set) || noop2;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}

// node_modules/svelte/transition/index.mjs
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}

// .svelte-kit/output/server/app.js
var css$3 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\texport let props_3 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}>\\n\\t\\t\\t\\t\\t{#if components[3]}\\n\\t\\t\\t\\t\\t\\t<svelte:component this={components[3]} {...(props_3 || {})}/>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</svelte:component>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AA2DC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  let { props_3 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title || "untitled page";
      }
    });
    mounted = true;
    return unsubscribe;
  });
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  if ($$props.props_3 === void 0 && $$bindings.props_3 && props_3 !== void 0)
    $$bindings.props_3(props_3);
  $$result.css.add(css$3);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {
        default: () => `${components[3] ? `${validate_component(components[3] || missing_component, "svelte:component").$$render($$result, Object.assign(props_3 || {}), {}, {})}` : ``}`
      })}` : ``}`
    })}` : ``}`
  })}

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1j55zn5"}">${navigated ? `${escape2(title)}` : ``}</div>` : ``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-43b86f10.js",
      css: ["/./_app/assets/start-a8cd1609.css", "/./_app/assets/vendor-28c0263c.css"],
      js: ["/./_app/start-43b86f10.js", "/./_app/chunks/vendor-33ee9987.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: false,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 3404, "type": "image/png" }, { "file": "images/pexels-bence-kondor-2259917.jpg", "size": 4274589, "type": "image/jpeg" }, { "file": "images/pexels-mike-145685.jpg", "size": 4919359, "type": "image/jpeg" }, { "file": "images/pexels-quang-nguyen-vinh-2132250.jpg", "size": 3872693, "type": "image/jpeg" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/permablitz\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/permablitz/__layout.svelte", "src/routes/permablitz/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/permablitz\/calendar\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/permablitz/__layout.svelte", "src/routes/permablitz/calendar.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/permablitz\/projects\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/permablitz/__layout.svelte", "src/routes/permablitz/projects.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/permablitz\/values\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/permablitz/__layout.svelte", "src/routes/permablitz/values.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/calendar\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/calendar.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/projects\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/projects.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/values\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/values.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout$1;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/permablitz/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/permablitz/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/permablitz/calendar.svelte": () => Promise.resolve().then(function() {
    return calendar$1;
  }),
  "src/routes/permablitz/projects.svelte": () => Promise.resolve().then(function() {
    return projects$1;
  }),
  "src/routes/permablitz/values.svelte": () => Promise.resolve().then(function() {
    return values$1;
  }),
  "src/routes/calendar.svelte": () => Promise.resolve().then(function() {
    return calendar;
  }),
  "src/routes/projects.svelte": () => Promise.resolve().then(function() {
    return projects;
  }),
  "src/routes/values.svelte": () => Promise.resolve().then(function() {
    return values;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-450bffb5.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/__layout.svelte-450bffb5.js", "/./_app/chunks/vendor-33ee9987.js", "/./_app/chunks/stores-514ab653.js"], "styles": null }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-88acbb44.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/error.svelte-88acbb44.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-9085a1e2.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/index.svelte-9085a1e2.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/permablitz/__layout.svelte": { "entry": "/./_app/pages/permablitz/__layout.svelte-10163c8c.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/permablitz/__layout.svelte-10163c8c.js", "/./_app/chunks/vendor-33ee9987.js", "/./_app/chunks/stores-514ab653.js"], "styles": null }, "src/routes/permablitz/index.svelte": { "entry": "/./_app/pages/permablitz/index.svelte-61b9c68d.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/permablitz/index.svelte-61b9c68d.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/permablitz/calendar.svelte": { "entry": "/./_app/pages/permablitz/calendar.svelte-0bedf851.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/permablitz/calendar.svelte-0bedf851.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/permablitz/projects.svelte": { "entry": "/./_app/pages/permablitz/projects.svelte-f74e8419.js", "css": ["/./_app/assets/pages/permablitz/projects.svelte-adb63117.css", "/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/permablitz/projects.svelte-f74e8419.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/permablitz/values.svelte": { "entry": "/./_app/pages/permablitz/values.svelte-2656db2a.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/permablitz/values.svelte-2656db2a.js", "/./_app/chunks/vendor-33ee9987.js", "/./_app/chunks/_values-8206b1b7.js"], "styles": null }, "src/routes/calendar.svelte": { "entry": "/./_app/pages/calendar.svelte-1a222fb9.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/calendar.svelte-1a222fb9.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/projects.svelte": { "entry": "/./_app/pages/projects.svelte-246c0698.js", "css": ["/./_app/assets/pages/permablitz/projects.svelte-adb63117.css", "/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/projects.svelte-246c0698.js", "/./_app/chunks/vendor-33ee9987.js"], "styles": null }, "src/routes/values.svelte": { "entry": "/./_app/pages/values.svelte-59d4a65d.js", "css": ["/./_app/assets/vendor-28c0263c.css"], "js": ["/./_app/pages/values.svelte-59d4a65d.js", "/./_app/chunks/vendor-33ee9987.js", "/./_app/chunks/_values-8206b1b7.js"], "styles": null } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
function getOriginalBodyPadding() {
  const style = window ? window.getComputedStyle(document.body, null) : {};
  return parseInt(style && style.getPropertyValue("padding-right") || 0, 10);
}
function getScrollbarWidth() {
  let scrollDiv = document.createElement("div");
  scrollDiv.style.position = "absolute";
  scrollDiv.style.top = "-9999px";
  scrollDiv.style.width = "50px";
  scrollDiv.style.height = "50px";
  scrollDiv.style.overflow = "scroll";
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}
function setScrollbarWidth(padding) {
  document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
}
function isBodyOverflowing() {
  return window ? document.body.clientWidth < window.innerWidth : false;
}
function isObject(value) {
  const type = typeof value;
  return value != null && (type == "object" || type == "function");
}
function conditionallyUpdateScrollbar() {
  const scrollbarWidth = getScrollbarWidth();
  const fixedContent = document.querySelectorAll(".fixed-top, .fixed-bottom, .is-fixed, .sticky-top")[0];
  const bodyPadding = fixedContent ? parseInt(fixedContent.style.paddingRight || 0, 10) : 0;
  if (isBodyOverflowing()) {
    setScrollbarWidth(bodyPadding + scrollbarWidth);
  }
}
function getColumnSizeClass(isXs, colWidth, colSize) {
  if (colSize === true || colSize === "") {
    return isXs ? "col" : `col-${colWidth}`;
  } else if (colSize === "auto") {
    return isXs ? "col-auto" : `col-${colWidth}-auto`;
  }
  return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
}
function browserEvent(target, ...args) {
  target.addEventListener(...args);
  return () => target.removeEventListener(...args);
}
function getNewCarouselActiveIndex(direction, items, activeIndex) {
  if (direction === "prev") {
    return activeIndex === 0 ? items.length - 1 : activeIndex - 1;
  } else if (direction === "next") {
    return activeIndex === items.length - 1 ? 0 : activeIndex + 1;
  }
}
function toClassName(value) {
  let result = "";
  if (typeof value === "string" || typeof value === "number") {
    result += value;
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      result = value.map(toClassName).filter(Boolean).join(" ");
    } else {
      for (let key in value) {
        if (value[key]) {
          result && (result += " ");
          result += key;
        }
      }
    }
  }
  return result;
}
function classnames(...args) {
  return args.map(toClassName).filter(Boolean).join(" ");
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["flush", "stayOpen", "class"]);
  let $open, $$unsubscribe_open;
  const dispatch = createEventDispatcher();
  let { flush = false } = $$props;
  let { stayOpen = false } = $$props;
  let { class: className2 = "" } = $$props;
  const open = writable2();
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  setContext("accordion", {
    open,
    stayOpen,
    toggle: (id) => {
      if ($open === id)
        open.set();
      else
        open.set(id);
      dispatch("toggle", { [id]: $open === id });
    }
  });
  if ($$props.flush === void 0 && $$bindings.flush && flush !== void 0)
    $$bindings.flush(flush);
  if ($$props.stayOpen === void 0 && $$bindings.stayOpen && stayOpen !== void 0)
    $$bindings.stayOpen(stayOpen);
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "accordion", { "accordion-flush": flush });
  $$unsubscribe_open();
  return `<div${spread([{ class: escape_attribute_value(classes) }, escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var AccordionHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "accordion-button");
  return `<h2${spread([{ class: "accordion-header" }, escape_object($$restProps)])}><button${add_attribute("class", classes, 0)}>${slots.default ? slots.default({}) : ``}</button></h2>`;
});
var defaultToggleEvents = ["touchstart", "click"];
var toggle = (toggler, togglerFn) => {
  let unbindEvents;
  if (typeof toggler === "string" && typeof window !== "undefined" && document && document.createElement) {
    let selection = document.querySelectorAll(toggler);
    if (!selection.length) {
      selection = document.querySelectorAll(`#${toggler}`);
    }
    if (!selection.length) {
      throw new Error(`The target '${toggler}' could not be identified in the dom, tip: check spelling`);
    }
    defaultToggleEvents.forEach((event) => {
      selection.forEach((element) => {
        element.addEventListener(event, togglerFn);
      });
    });
    unbindEvents = () => {
      defaultToggleEvents.forEach((event) => {
        selection.forEach((element) => {
          element.removeEventListener(event, togglerFn);
        });
      });
    };
  }
  return () => {
    if (typeof unbindEvents === "function") {
      unbindEvents();
      unbindEvents = void 0;
    }
  };
};
var Collapse = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "isOpen",
    "class",
    "navbar",
    "onEntering",
    "onEntered",
    "onExiting",
    "onExited",
    "expand",
    "toggler"
  ]);
  const dispatch = createEventDispatcher();
  let { isOpen = false } = $$props;
  let { class: className2 = "" } = $$props;
  let { navbar = false } = $$props;
  let { onEntering = () => dispatch("opening") } = $$props;
  let { onEntered = () => dispatch("open") } = $$props;
  let { onExiting = () => dispatch("closing") } = $$props;
  let { onExited = () => dispatch("close") } = $$props;
  let { expand = false } = $$props;
  let { toggler = null } = $$props;
  onMount(() => toggle(toggler, () => isOpen = !isOpen));
  let windowWidth = 0;
  let _wasMaximized = false;
  const minWidth = {};
  minWidth["xs"] = 0;
  minWidth["sm"] = 576;
  minWidth["md"] = 768;
  minWidth["lg"] = 992;
  minWidth["xl"] = 1200;
  function notify() {
    dispatch("update", isOpen);
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.navbar === void 0 && $$bindings.navbar && navbar !== void 0)
    $$bindings.navbar(navbar);
  if ($$props.onEntering === void 0 && $$bindings.onEntering && onEntering !== void 0)
    $$bindings.onEntering(onEntering);
  if ($$props.onEntered === void 0 && $$bindings.onEntered && onEntered !== void 0)
    $$bindings.onEntered(onEntered);
  if ($$props.onExiting === void 0 && $$bindings.onExiting && onExiting !== void 0)
    $$bindings.onExiting(onExiting);
  if ($$props.onExited === void 0 && $$bindings.onExited && onExited !== void 0)
    $$bindings.onExited(onExited);
  if ($$props.expand === void 0 && $$bindings.expand && expand !== void 0)
    $$bindings.expand(expand);
  if ($$props.toggler === void 0 && $$bindings.toggler && toggler !== void 0)
    $$bindings.toggler(toggler);
  classes = classnames(className2, navbar && "navbar-collapse");
  {
    if (navbar && expand) {
      if (windowWidth >= minWidth[expand] && !isOpen) {
        isOpen = true;
        _wasMaximized = true;
        notify();
      } else if (windowWidth < minWidth[expand] && _wasMaximized) {
        isOpen = false;
        _wasMaximized = false;
        notify();
      }
    }
  }
  return `

${isOpen ? `<div${spread([
    {
      style: escape_attribute_value(navbar ? void 0 : "overflow: hidden;")
    },
    escape_object($$restProps),
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</div>` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let accordionOpen;
  let $open, $$unsubscribe_open;
  let { class: className2 = "" } = $$props;
  let { header = "" } = $$props;
  let { active = false } = $$props;
  let accordionId;
  createEventDispatcher();
  const { stayOpen, toggle: toggle2, open } = getContext("accordion");
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  onMount(() => {
    if (active)
      toggle2(accordionId);
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  classes = classnames(className2, "accordion-item");
  accordionOpen = stayOpen ? active : $open === accordionId;
  $$unsubscribe_open();
  return `<div${add_attribute("class", classes, 0)}${add_attribute("this", accordionId, 1)}>${validate_component(AccordionHeader, "AccordionHeader").$$render($$result, { class: !accordionOpen && "collapsed" }, {}, {
    default: () => `${slots.header ? slots.header({}) : ``}
    ${escape2(header)}`
  })}
  ${validate_component(Collapse, "Collapse").$$render($$result, {
    isOpen: accordionOpen,
    class: "accordion-collapse"
  }, {}, {
    default: () => `<div class="${"accordion-body"}">${slots.default ? slots.default({}) : ``}</div>`
  })}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showClose;
  let classes;
  let closeClassNames;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "children",
    "color",
    "closeClassName",
    "closeAriaLabel",
    "dismissible",
    "heading",
    "isOpen",
    "toggle",
    "fade",
    "transition"
  ]);
  let $$slots = compute_slots(slots);
  let { class: className2 = "" } = $$props;
  let { children = void 0 } = $$props;
  let { color = "success" } = $$props;
  let { closeClassName = "" } = $$props;
  let { closeAriaLabel = "Close" } = $$props;
  let { dismissible = false } = $$props;
  let { heading = void 0 } = $$props;
  let { isOpen = true } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  let { fade: fade2 = true } = $$props;
  let { transition = { duration: fade2 ? 400 : 0 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.closeClassName === void 0 && $$bindings.closeClassName && closeClassName !== void 0)
    $$bindings.closeClassName(closeClassName);
  if ($$props.closeAriaLabel === void 0 && $$bindings.closeAriaLabel && closeAriaLabel !== void 0)
    $$bindings.closeAriaLabel(closeAriaLabel);
  if ($$props.dismissible === void 0 && $$bindings.dismissible && dismissible !== void 0)
    $$bindings.dismissible(dismissible);
  if ($$props.heading === void 0 && $$bindings.heading && heading !== void 0)
    $$bindings.heading(heading);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  if ($$props.fade === void 0 && $$bindings.fade && fade2 !== void 0)
    $$bindings.fade(fade2);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  showClose = dismissible || toggle2;
  classes = classnames(className2, "alert", `alert-${color}`, { "alert-dismissible": showClose });
  closeClassNames = classnames("btn-close", closeClassName);
  return `${isOpen ? `<div${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { role: "alert" }
  ])}>${heading || $$slots.heading ? `<h4 class="${"alert-heading"}">${escape2(heading)}${slots.heading ? slots.heading({}) : ``}</h4>` : ``}
    ${showClose ? `<button type="${"button"}"${add_attribute("class", closeClassNames, 0)}${add_attribute("aria-label", closeAriaLabel, 0)}></button>` : ``}
    ${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</div>` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "children", "color", "href", "pill"]);
  let { class: className2 = "" } = $$props;
  let { children = void 0 } = $$props;
  let { color = "secondary" } = $$props;
  let { href = void 0 } = $$props;
  let { pill = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.pill === void 0 && $$bindings.pill && pill !== void 0)
    $$bindings.pill(pill);
  classes = classnames(className2, "badge", `bg-${color}`, pill ? "rounded-pill" : false);
  return `${href ? `<a${spread([
    escape_object($$restProps),
    { href: escape_attribute_value(href) },
    { class: escape_attribute_value(classes) }
  ])}>${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</a>` : `<span${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</span>`}`;
});
var Breadcrumb = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let listClasses;
  let $$restProps = compute_rest_props($$props, ["class", "children", "listClassName"]);
  let { class: className2 = "" } = $$props;
  let { children = void 0 } = $$props;
  let { listClassName = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.listClassName === void 0 && $$bindings.listClassName && listClassName !== void 0)
    $$bindings.listClassName(listClassName);
  listClasses = classnames("breadcrumb", listClassName);
  return `<nav${spread([escape_object($$restProps), { class: escape_attribute_value(className2) }])}><ol${add_attribute("class", listClasses, 0)}>${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</ol></nav>`;
});
var BreadcrumbItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "children"]);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { children = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  classes = classnames(className2, active ? "active" : false, "breadcrumb-item");
  return `<li${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    {
      "aria-current": escape_attribute_value(active ? "page" : void 0)
    }
  ])}>${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</li>`;
});
var Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let classes;
  let defaultAriaLabel;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "active",
    "block",
    "children",
    "close",
    "color",
    "disabled",
    "href",
    "inner",
    "outline",
    "size",
    "style",
    "value"
  ]);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { block = false } = $$props;
  let { children = void 0 } = $$props;
  let { close = false } = $$props;
  let { color = "secondary" } = $$props;
  let { disabled = false } = $$props;
  let { href = "" } = $$props;
  let { inner = void 0 } = $$props;
  let { outline = false } = $$props;
  let { size = null } = $$props;
  let { style = "" } = $$props;
  let { value = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.block === void 0 && $$bindings.block && block !== void 0)
    $$bindings.block(block);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.close === void 0 && $$bindings.close && close !== void 0)
    $$bindings.close(close);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.inner === void 0 && $$bindings.inner && inner !== void 0)
    $$bindings.inner(inner);
  if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0)
    $$bindings.outline(outline);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  ariaLabel = $$props["aria-label"];
  classes = classnames(className2, close ? "btn-close" : "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "d-block w-100" : false, { active });
  defaultAriaLabel = close ? "Close" : null;
  return `${href ? `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { disabled: disabled || null },
    { href: escape_attribute_value(href) },
    {
      "aria-label": escape_attribute_value(ariaLabel || defaultAriaLabel)
    },
    { style: escape_attribute_value(style) }
  ])}${add_attribute("this", inner, 1)}>${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</a>` : `<button${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { disabled: disabled || null },
    { value: escape_attribute_value(value) },
    {
      "aria-label": escape_attribute_value(ariaLabel || defaultAriaLabel)
    },
    { style: escape_attribute_value(style) }
  ])}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : `
      ${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}
    `}</button>`}`;
});
function getBoundingClientRect(element) {
  var rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    x: rect.left,
    y: rect.top
  };
}
function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}
function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}
function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}
function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : element.document) || window.document).documentElement;
}
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement);
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element);
}
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : updatedList.concat(listScrollParents(getParentNode(target)));
}
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1;
  var isIE = navigator.userAgent.indexOf("Trident") !== -1;
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle2(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css2 = getComputedStyle2(currentNode);
    if (css2.transform !== "none" || css2.perspective !== "none" || css2.contain === "paint" || ["transform", "perspective"].indexOf(css2.willChange) !== -1 || isFirefox && css2.willChange === "filter" || isFirefox && css2.filter && css2.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read2 = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read2, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}
function debounce(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve2) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve2(fn2());
        });
      });
    }
    return pending;
  };
}
function getBasePlacement(placement) {
  return placement.split("-")[0];
}
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}
function getViewportRect(element) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element),
    y
  };
}
var max = Math.max;
var min = Math.min;
var round = Math.round;
function getDocumentRect(element) {
  var _element$ownerDocumen;
  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;
  if (getComputedStyle2(body || html).direction === "rtl") {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}
function getInnerBoundingClientRect(element) {
  var rect = getBoundingClientRect(element);
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element, clippingParent) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isHTMLElement(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}
function getClippingParents(element) {
  var clippingParents2 = listScrollParents(getParentNode(element));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element, boundary, rootBoundary) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}
function getVariation(placement) {
  return placement.split("-")[1];
}
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}
function computeOffsets(_ref) {
  var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
        break;
    }
  }
  return offsets;
}
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}
function detectOverflow(state, options2) {
  if (options2 === void 0) {
    options2 = {};
  }
  var _options = options2, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var referenceElement = state.elements.reference;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
  var referenceClientRect = getBoundingClientRect(referenceElement);
  var popperOffsets2 = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: "absolute",
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset2 = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset2[axis] * multiply;
    });
  }
  return overflowOffsets;
}
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper2(reference2, popper2, options2) {
    if (options2 === void 0) {
      options2 = defaultOptions;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state,
      setOptions: function setOptions(options3) {
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options3);
        state.scrollParents = {
          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index2 = 0; index2 < state.orderedModifiers.length; index2++) {
          if (state.reset === true) {
            state.reset = false;
            index2 = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index2], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state = fn2({
              state,
              options: _options,
              name,
              instance
            }) || state;
          }
        }
      },
      update: debounce(function() {
        return new Promise(function(resolve2) {
          instance.forceUpdate();
          resolve2(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance;
    }
    instance.setOptions(options2).then(function(state2) {
      if (!isDestroyed && options2.onFirstUpdate) {
        options2.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref3) {
        var name = _ref3.name, _ref3$options = _ref3.options, options3 = _ref3$options === void 0 ? {} : _ref3$options, effect2 = _ref3.effect;
        if (typeof effect2 === "function") {
          var cleanupFn = effect2({
            state,
            name,
            instance,
            options: options3
          });
          var noopFn = function noopFn2() {
          };
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}
var passive = {
  passive: true
};
function effect$2(_ref) {
  var state = _ref.state, instance = _ref.instance, options2 = _ref.options;
  var _options$scroll = options2.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options2.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
var eventListeners = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect: effect$2,
  data: {}
};
function popperOffsets(_ref) {
  var state = _ref.state, name = _ref.name;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: "absolute",
    placement: state.placement
  });
}
var popperOffsets$1 = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref) {
  var x = _ref.x, y = _ref.y;
  var win = window;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(round(x * dpr) / dpr) || 0,
    y: round(round(y * dpr) / dpr) || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets;
  var _ref3 = roundOffsets === true ? roundOffsetsByDPR(offsets) : typeof roundOffsets === "function" ? roundOffsets(offsets) : offsets, _ref3$x = _ref3.x, x = _ref3$x === void 0 ? 0 : _ref3$x, _ref3$y = _ref3.y, y = _ref3$y === void 0 ? 0 : _ref3$y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle2(offsetParent).position !== "static") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top) {
      sideY = bottom;
      y -= offsetParent[heightProp] - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left) {
      sideX = right;
      x -= offsetParent[widthProp] - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) < 2 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref4) {
  var state = _ref4.state, options2 = _ref4.options;
  var _options$gpuAccelerat = options2.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options2.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options2.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
var computeStyles$1 = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect$1(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
var applyStyles$1 = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect: effect$1,
  requires: ["computeStyles"]
};
function distanceAndSkiddingToXY(placement, rects, offset2) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
    placement
  })) : offset2, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var state = _ref2.state, options2 = _ref2.options, name = _ref2.name;
  var _options$offset = options2.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }
  state.modifiersData[name] = data;
}
var offset$1 = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};
var hash$1 = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash$1[matched];
  });
}
var hash2 = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash2[matched];
  });
}
function computeAutoPlacement(state, options2) {
  if (options2 === void 0) {
    options2 = {};
  }
  var _options = options2, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a, b) {
    return overflows[a] - overflows[b];
  });
}
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var state = _ref.state, options2 = _ref.options, name = _ref.name;
  if (state.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options2.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options2.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options2.fallbackPlacements, padding = options2.padding, boundary = options2.boundary, rootBoundary = options2.rootBoundary, altBoundary = options2.altBoundary, _options$flipVariatio = options2.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options2.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i = 0; i < placements2.length; i++) {
    var placement = placements2[i];
    var _basePlacement = getBasePlacement(placement);
    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i2) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i2).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);
      if (_ret === "break")
        break;
    }
  }
  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}
var flip$1 = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function preventOverflow(_ref) {
  var state = _ref.state, options2 = _ref.options, name = _ref.name;
  var _options$mainAxis = options2.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options2.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options2.boundary, rootBoundary = options2.rootBoundary, altBoundary = options2.altBoundary, padding = options2.padding, _options$tether = options2.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options2.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis || checkAltAxis) {
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min$1 = popperOffsets2[mainAxis] + overflow[mainSide];
    var max$1 = popperOffsets2[mainAxis] - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - tetherOffsetValue : minLen - arrowLen - arrowPaddingMin - tetherOffsetValue;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + tetherOffsetValue : maxLen + arrowLen + arrowPaddingMax + tetherOffsetValue;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = state.modifiersData.offset ? state.modifiersData.offset[state.placement][mainAxis] : 0;
    var tetherMin = popperOffsets2[mainAxis] + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = popperOffsets2[mainAxis] + maxOffset - offsetModifierValue;
    if (checkMainAxis) {
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var _preventedOffset = within(tether ? min(_min, tetherMin) : _min, _offset, tether ? max(_max, tetherMax) : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
  }
  state.modifiersData[name] = data;
}
var preventOverflow$1 = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};
var toPaddingObject = function toPaddingObject2(padding, state) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var state = _ref.state, name = _ref.name, options2 = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets2) {
    return;
  }
  var paddingObject = toPaddingObject(options2.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
  var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset2 = within(min2, center, max2);
  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
}
function effect(_ref2) {
  var state = _ref2.state, options2 = _ref2.options;
  var _options$element = options2.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }
  state.elements.arrow = arrowElement;
}
var arrow$1 = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}
function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function(side) {
    return overflow[side] >= 0;
  });
}
function hide(_ref) {
  var state = _ref.state, name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: "reference"
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-reference-hidden": isReferenceHidden,
    "data-popper-escaped": hasPopperEscaped
  });
}
var hide$1 = {
  name: "hide",
  enabled: true,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: hide
};
var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});
function createPopperActions(initOptions) {
  let contentNode;
  let options2 = initOptions;
  let popperInstance = null;
  let referenceNode;
  const initPopper = () => {
    if (referenceNode && contentNode) {
      popperInstance = createPopper(referenceNode, contentNode, options2);
    }
  };
  const deinitPopper = () => {
    if (popperInstance) {
      popperInstance.destroy();
      popperInstance = null;
    }
  };
  const referenceAction = (node) => {
    referenceNode = node;
    initPopper();
    return {
      destroy() {
        deinitPopper();
      }
    };
  };
  const contentAction = (node, contentOptions) => {
    contentNode = node;
    options2 = Object.assign(Object.assign({}, initOptions), contentOptions);
    initPopper();
    return {
      update(newContentOptions) {
        options2 = Object.assign(Object.assign({}, initOptions), newContentOptions);
        if (popperInstance && options2) {
          popperInstance.setOptions(options2);
        }
      },
      destroy() {
        deinitPopper();
      }
    };
  };
  return [referenceAction, contentAction, () => popperInstance];
}
var createContext = () => writable2({});
var Dropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let subItemIsActive;
  let classes;
  let handleToggle;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "active",
    "addonType",
    "direction",
    "dropup",
    "group",
    "inNavbar",
    "isOpen",
    "nav",
    "setActiveFromChild",
    "size",
    "toggle"
  ]);
  const noop3 = () => void 0;
  let context = createContext();
  setContext("dropdownContext", context);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { addonType = false } = $$props;
  let { direction = "down" } = $$props;
  let { dropup = false } = $$props;
  let { group = false } = $$props;
  let { inNavbar = false } = $$props;
  let { isOpen = false } = $$props;
  let { nav = false } = $$props;
  let { setActiveFromChild = false } = $$props;
  let { size = "" } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  const [popperRef, popperContent] = createPopperActions();
  const validDirections = ["up", "down", "left", "right", "start", "end"];
  if (validDirections.indexOf(direction) === -1) {
    throw new Error(`Invalid direction sent: '${direction}' is not one of 'up', 'down', 'left', 'right', 'start', 'end'`);
  }
  let component;
  let dropdownDirection;
  function handleDocumentClick(e) {
    if (e && (e.which === 3 || e.type === "keyup" && e.which !== 9))
      return;
    if (component.contains(e.target) && component !== e.target && (e.type !== "keyup" || e.which === 9)) {
      return;
    }
    handleToggle(e);
  }
  onDestroy(() => {
    if (typeof document !== "undefined") {
      ["click", "touchstart", "keyup"].forEach((event) => document.removeEventListener(event, handleDocumentClick, true));
    }
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.addonType === void 0 && $$bindings.addonType && addonType !== void 0)
    $$bindings.addonType(addonType);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  if ($$props.dropup === void 0 && $$bindings.dropup && dropup !== void 0)
    $$bindings.dropup(dropup);
  if ($$props.group === void 0 && $$bindings.group && group !== void 0)
    $$bindings.group(group);
  if ($$props.inNavbar === void 0 && $$bindings.inNavbar && inNavbar !== void 0)
    $$bindings.inNavbar(inNavbar);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.nav === void 0 && $$bindings.nav && nav !== void 0)
    $$bindings.nav(nav);
  if ($$props.setActiveFromChild === void 0 && $$bindings.setActiveFromChild && setActiveFromChild !== void 0)
    $$bindings.setActiveFromChild(setActiveFromChild);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  subItemIsActive = !!(setActiveFromChild && component && typeof component.querySelector === "function" && component.querySelector(".active"));
  {
    {
      if (direction === "left")
        dropdownDirection = "start";
      else if (direction === "right")
        dropdownDirection = "end";
      else
        dropdownDirection = direction;
    }
  }
  handleToggle = toggle2 || (() => isOpen = !isOpen);
  classes = classnames(className2, direction !== "down" && `drop${dropdownDirection}`, nav && active ? "active" : false, setActiveFromChild && subItemIsActive ? "active" : false, {
    [`input-group-${addonType}`]: addonType,
    "btn-group": group,
    [`btn-group-${size}`]: !!size,
    dropdown: !group && !addonType,
    show: isOpen,
    "nav-item": nav
  });
  {
    {
      if (typeof document !== "undefined") {
        if (isOpen) {
          ["click", "touchstart", "keyup"].forEach((event) => document.addEventListener(event, handleDocumentClick, true));
        } else {
          ["click", "touchstart", "keyup"].forEach((event) => document.removeEventListener(event, handleDocumentClick, true));
        }
      }
    }
  }
  {
    {
      context.update(() => {
        return {
          toggle: handleToggle,
          isOpen,
          direction: direction === "down" && dropup ? "up" : direction,
          inNavbar,
          popperRef: nav ? noop3 : popperRef,
          popperContent: nav ? noop3 : popperContent
        };
      });
    }
  }
  return `${nav ? `<li${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}${add_attribute("this", component, 1)}>${slots.default ? slots.default({}) : ``}</li>` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}${add_attribute("this", component, 1)}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `${validate_component(Dropdown, "Dropdown").$$render($$result, Object.assign($$restProps, { group: true }), {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "size", "vertical"]);
  let { class: className2 = "" } = $$props;
  let { size = "" } = $$props;
  let { vertical = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.vertical === void 0 && $$bindings.vertical && vertical !== void 0)
    $$bindings.vertical(vertical);
  classes = classnames(className2, size ? `btn-group-${size}` : false, vertical ? "btn-group-vertical" : "btn-group");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "btn-toolbar");
  return `<div${spread([
    escape_object($$restProps),
    { role: "toolbar" },
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "body", "color", "inverse", "outline", "style"]);
  let { class: className2 = "" } = $$props;
  let { body = false } = $$props;
  let { color = "" } = $$props;
  let { inverse = false } = $$props;
  let { outline = false } = $$props;
  let { style = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.body === void 0 && $$bindings.body && body !== void 0)
    $$bindings.body(body);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.inverse === void 0 && $$bindings.inverse && inverse !== void 0)
    $$bindings.inverse(inverse);
  if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0)
    $$bindings.outline(outline);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  classes = classnames(className2, "card", inverse ? "text-white" : false, body ? "card-body" : false, color ? `${outline ? "border" : "bg"}-${color}` : false);
  return `<div${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { style: escape_attribute_value(style) }
  ])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-body");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-columns");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-deck");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-footer");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-group");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "tag"]);
  let { class: className2 = "" } = $$props;
  let { tag = "div" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  classes = classnames(className2, "card-header");
  return `${tag === "h3" ? `<h3${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</h3>` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "top", "bottom", "src", "alt"]);
  let { class: className2 = "" } = $$props;
  let { top: top2 = false } = $$props;
  let { bottom: bottom2 = false } = $$props;
  let { src: src2 } = $$props;
  let { alt = "" } = $$props;
  let classes = "";
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.top === void 0 && $$bindings.top && top2 !== void 0)
    $$bindings.top(top2);
  if ($$props.bottom === void 0 && $$bindings.bottom && bottom2 !== void 0)
    $$bindings.bottom(bottom2);
  if ($$props.src === void 0 && $$bindings.src && src2 !== void 0)
    $$bindings.src(src2);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  {
    {
      let cardImgClassName = "card-img";
      if (top2) {
        cardImgClassName = "card-img-top";
      }
      if (bottom2) {
        cardImgClassName = "card-img-bottom";
      }
      classes = classnames(className2, cardImgClassName);
    }
  }
  return `<img${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { src: escape_attribute_value(src2) },
    { alt: escape_attribute_value(alt) }
  ])}>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-img-overlay");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "href"]);
  let { class: className2 = "" } = $$props;
  let { href = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames(className2, "card-link");
  return `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { href: escape_attribute_value(href) }
  ])}>${slots.default ? slots.default({}) : ``}</a>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-subtitle");
  return `<h6${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</h6>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-text");
  return `<p${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</p>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "card-title");
  return `<h5${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</h5>`;
});
var Carousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "class",
    "style",
    "items",
    "activeIndex",
    "dark",
    "ride",
    "interval",
    "pause",
    "keyboard"
  ]);
  let classes = "";
  let { class: className2 = "" } = $$props;
  let { style = "" } = $$props;
  let { items = [] } = $$props;
  let { activeIndex = 0 } = $$props;
  let { dark = false } = $$props;
  let { ride = true } = $$props;
  let { interval = 5e3 } = $$props;
  let { pause = true } = $$props;
  let { keyboard = true } = $$props;
  let _rideTimeoutId = false;
  let _removeVisibilityChangeListener = false;
  onMount(() => {
    setRideTimeout();
    _removeVisibilityChangeListener = browserEvent(document, "visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        clearRideTimeout();
      } else {
        setRideTimeout();
      }
    });
  });
  onDestroy(() => {
    if (_rideTimeoutId) {
      clearTimeout(_rideTimeoutId);
    }
    if (_removeVisibilityChangeListener) {
      _removeVisibilityChangeListener();
    }
  });
  function setRideTimeout() {
    clearRideTimeout();
    if (ride) {
      _rideTimeoutId = setTimeout(autoNext, interval);
    }
  }
  function clearRideTimeout() {
    if (_rideTimeoutId) {
      clearTimeout(_rideTimeoutId);
    }
  }
  function autoNext() {
    activeIndex = getNewCarouselActiveIndex("next", items, activeIndex);
  }
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.activeIndex === void 0 && $$bindings.activeIndex && activeIndex !== void 0)
    $$bindings.activeIndex(activeIndex);
  if ($$props.dark === void 0 && $$bindings.dark && dark !== void 0)
    $$bindings.dark(dark);
  if ($$props.ride === void 0 && $$bindings.ride && ride !== void 0)
    $$bindings.ride(ride);
  if ($$props.interval === void 0 && $$bindings.interval && interval !== void 0)
    $$bindings.interval(interval);
  if ($$props.pause === void 0 && $$bindings.pause && pause !== void 0)
    $$bindings.pause(pause);
  if ($$props.keyboard === void 0 && $$bindings.keyboard && keyboard !== void 0)
    $$bindings.keyboard(keyboard);
  classes = classnames(className2, "carousel", "slide", { "carousel-dark": dark });
  return `

<div${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { style: escape_attribute_value(style) }
  ])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var CarouselCaption = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "captionHeader", "captionText"]);
  let classes = "";
  let { class: className2 = "" } = $$props;
  let { captionHeader = "" } = $$props;
  let { captionText = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.captionHeader === void 0 && $$bindings.captionHeader && captionHeader !== void 0)
    $$bindings.captionHeader(captionHeader);
  if ($$props.captionText === void 0 && $$bindings.captionText && captionText !== void 0)
    $$bindings.captionText(captionText);
  classes = classnames(className2, "carousel-caption", "d-none", "d-md-block");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${captionHeader ? `<h5>${escape2(captionHeader)}</h5>` : ``}
  ${captionText ? `<p>${escape2(captionText)}</p>` : ``}
  ${slots.default ? slots.default({}) : ``}</div>`;
});
var CarouselControl = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "direction", "directionText", "activeIndex", "items", "wrap"]);
  let classes = "";
  let { class: className2 = "" } = $$props;
  let srText = "";
  let { direction = "" } = $$props;
  let { directionText = "" } = $$props;
  let { activeIndex = 0 } = $$props;
  let { items = [] } = $$props;
  let { wrap = true } = $$props;
  const getSrText = (direction2) => {
    if (direction2 === "next") {
      return "Next";
    } else if (direction2 === "prev") {
      return "Previous";
    }
  };
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  if ($$props.directionText === void 0 && $$bindings.directionText && directionText !== void 0)
    $$bindings.directionText(directionText);
  if ($$props.activeIndex === void 0 && $$bindings.activeIndex && activeIndex !== void 0)
    $$bindings.activeIndex(activeIndex);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.wrap === void 0 && $$bindings.wrap && wrap !== void 0)
    $$bindings.wrap(wrap);
  classes = classnames(`carousel-control-${direction}`, className2);
  srText = directionText ? directionText : getSrText(direction);
  return `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { role: "button" },
    { href: "#" + escape2(direction) }
  ])}><span class="${"carousel-control-" + escape2(direction) + "-icon"}" aria-hidden="${"true"}"></span>
  <span class="${"visually-hidden"}">${escape2(srText)}</span></a>`;
});
var CarouselIndicators = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "items", "activeIndex"]);
  let { class: className2 = "" } = $$props;
  let classes = "";
  let { items = [] } = $$props;
  let { activeIndex = 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.activeIndex === void 0 && $$bindings.activeIndex && activeIndex !== void 0)
    $$bindings.activeIndex(activeIndex);
  classes = classnames(className2, "carousel-indicators");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${each(items, (item, index2) => `<button data-bs-target${add_attribute("aria-current", activeIndex === index2, 0)}${add_attribute("aria-label", item.title, 0)}${add_classes([activeIndex === index2 ? "active" : ""].join(" ").trim())}>${escape2(item.title ? item.title : "")}
    </button>`)}</div>`;
});
var CarouselItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "itemIndex", "activeIndex"]);
  let classes = "";
  let { class: className2 = "" } = $$props;
  let { itemIndex = 0 } = $$props;
  let { activeIndex = 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.itemIndex === void 0 && $$bindings.itemIndex && itemIndex !== void 0)
    $$bindings.itemIndex(itemIndex);
  if ($$props.activeIndex === void 0 && $$bindings.activeIndex && activeIndex !== void 0)
    $$bindings.activeIndex(activeIndex);
  classes = classnames(className2, "carousel-item");
  return `<div${spread([escape_object($$restProps), { class: escape2(classes) + " active" }], itemIndex === activeIndex ? "active" : "")}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "xs", "sm", "md", "lg", "xl", "xxl"]);
  let { class: className2 = "" } = $$props;
  let { xs = void 0 } = $$props;
  let { sm = void 0 } = $$props;
  let { md = void 0 } = $$props;
  let { lg = void 0 } = $$props;
  let { xl = void 0 } = $$props;
  let { xxl = void 0 } = $$props;
  const colClasses = [];
  const lookup = { xs, sm, md, lg, xl, xxl };
  Object.keys(lookup).forEach((colWidth) => {
    const columnProp = lookup[colWidth];
    if (!columnProp && columnProp !== "") {
      return;
    }
    const isXs = colWidth === "xs";
    if (isObject(columnProp)) {
      const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
      const colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);
      if (columnProp.size || columnProp.size === "") {
        colClasses.push(colClass);
      }
      if (columnProp.push) {
        colClasses.push(`push${colSizeInterfix}${columnProp.push}`);
      }
      if (columnProp.pull) {
        colClasses.push(`pull${colSizeInterfix}${columnProp.pull}`);
      }
      if (columnProp.offset) {
        colClasses.push(`offset${colSizeInterfix}${columnProp.offset}`);
      }
    } else {
      colClasses.push(getColumnSizeClass(isXs, colWidth, columnProp));
    }
  });
  if (!colClasses.length) {
    colClasses.push("col");
  }
  if (className2) {
    colClasses.push(className2);
  }
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.xs === void 0 && $$bindings.xs && xs !== void 0)
    $$bindings.xs(xs);
  if ($$props.sm === void 0 && $$bindings.sm && sm !== void 0)
    $$bindings.sm(sm);
  if ($$props.md === void 0 && $$bindings.md && md !== void 0)
    $$bindings.md(md);
  if ($$props.lg === void 0 && $$bindings.lg && lg !== void 0)
    $$bindings.lg(lg);
  if ($$props.xl === void 0 && $$bindings.xl && xl !== void 0)
    $$bindings.xl(xl);
  if ($$props.xxl === void 0 && $$bindings.xxl && xxl !== void 0)
    $$bindings.xxl(xxl);
  return `<div${spread([
    escape_object($$restProps),
    {
      class: escape_attribute_value(colClasses.join(" "))
    }
  ])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "footer", "header", "width"]);
  let { class: className2 = "" } = $$props;
  let { footer = void 0 } = $$props;
  let { header = void 0 } = $$props;
  let { width = void 0 } = $$props;
  const colgroup = getContext("colgroup");
  const head = getContext("header");
  const foot = getContext("footer");
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.footer === void 0 && $$bindings.footer && footer !== void 0)
    $$bindings.footer(footer);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  return `${colgroup ? `<col style="${"width: " + escape2(width) + ";"}">` : `${foot ? `<th${spread([escape_object($$restProps)])}>${footer ? `${escape2(footer)}` : ``}
    ${slots.footer ? slots.footer({}) : ``}</th>` : `${head ? `<th${spread([escape_object($$restProps)])}>${header ? `${escape2(header)}` : ``}
    ${slots.header ? slots.header({}) : ``}</th>` : `<td${spread([{ class: escape_attribute_value(className2) }, escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</td>`}`}`}`;
});
var Container = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "sm", "md", "lg", "xl", "xxl", "fluid"]);
  let { class: className2 = "" } = $$props;
  let { sm = void 0 } = $$props;
  let { md = void 0 } = $$props;
  let { lg = void 0 } = $$props;
  let { xl = void 0 } = $$props;
  let { xxl = void 0 } = $$props;
  let { fluid = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.sm === void 0 && $$bindings.sm && sm !== void 0)
    $$bindings.sm(sm);
  if ($$props.md === void 0 && $$bindings.md && md !== void 0)
    $$bindings.md(md);
  if ($$props.lg === void 0 && $$bindings.lg && lg !== void 0)
    $$bindings.lg(lg);
  if ($$props.xl === void 0 && $$bindings.xl && xl !== void 0)
    $$bindings.xl(xl);
  if ($$props.xxl === void 0 && $$bindings.xxl && xxl !== void 0)
    $$bindings.xxl(xxl);
  if ($$props.fluid === void 0 && $$bindings.fluid && fluid !== void 0)
    $$bindings.fluid(fluid);
  classes = classnames(className2, {
    "container-sm": sm,
    "container-md": md,
    "container-lg": lg,
    "container-xl": xl,
    "container-xxl": xxl,
    "container-fluid": fluid,
    container: !sm && !md && !lg && !xl && !xxl && !fluid
  });
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var DropdownItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "disabled", "divider", "header", "toggle", "href"]);
  let $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => value);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { disabled = false } = $$props;
  let { divider = false } = $$props;
  let { header = false } = $$props;
  let { toggle: toggle2 = true } = $$props;
  let { href = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.divider === void 0 && $$bindings.divider && divider !== void 0)
    $$bindings.divider(divider);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames(className2, {
    disabled,
    "dropdown-item": !divider && !header,
    active,
    "dropdown-header": header,
    "dropdown-divider": divider
  });
  $$unsubscribe_context();
  return `${header ? `<h6${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</h6>` : `${divider ? `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>` : `${href ? `<a${spread([
    escape_object($$restProps),
    { click: true },
    { href: escape_attribute_value(href) },
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</a>` : `<button${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</button>`}`}`}`;
});
var DropdownMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "dark", "end", "right"]);
  let $context, $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => $context = value);
  let { class: className2 = "" } = $$props;
  let { dark = false } = $$props;
  let { end: end2 = false } = $$props;
  let { right: right2 = false } = $$props;
  const popperPlacement = (direction, end3) => {
    let prefix = direction;
    if (direction === "up")
      prefix = "top";
    else if (direction === "down")
      prefix = "bottom";
    let suffix = end3 ? "end" : "start";
    return `${prefix}-${suffix}`;
  };
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.dark === void 0 && $$bindings.dark && dark !== void 0)
    $$bindings.dark(dark);
  if ($$props.end === void 0 && $$bindings.end && end2 !== void 0)
    $$bindings.end(end2);
  if ($$props.right === void 0 && $$bindings.right && right2 !== void 0)
    $$bindings.right(right2);
  ({
    modifiers: [
      { name: "flip" },
      {
        name: "offset",
        options: { offset: [0, 2] }
      }
    ],
    placement: popperPlacement($context.direction, end2 || right2)
  });
  classes = classnames(className2, "dropdown-menu", {
    "dropdown-menu-dark": dark,
    "dropdown-menu-end": end2 || right2,
    show: $context.isOpen
  });
  $$unsubscribe_context();
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var DropdownToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let btnClasses;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "ariaLabel",
    "active",
    "block",
    "caret",
    "color",
    "disabled",
    "inner",
    "nav",
    "outline",
    "size",
    "split",
    "tag"
  ]);
  let $context, $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => $context = value);
  let { class: className2 = "" } = $$props;
  let { ariaLabel = "Toggle Dropdown" } = $$props;
  let { active = false } = $$props;
  let { block = false } = $$props;
  let { caret = false } = $$props;
  let { color = "secondary" } = $$props;
  let { disabled = false } = $$props;
  let { inner = void 0 } = $$props;
  let { nav = false } = $$props;
  let { outline = false } = $$props;
  let { size = "" } = $$props;
  let { split = false } = $$props;
  let { tag = null } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.block === void 0 && $$bindings.block && block !== void 0)
    $$bindings.block(block);
  if ($$props.caret === void 0 && $$bindings.caret && caret !== void 0)
    $$bindings.caret(caret);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.inner === void 0 && $$bindings.inner && inner !== void 0)
    $$bindings.inner(inner);
  if ($$props.nav === void 0 && $$bindings.nav && nav !== void 0)
    $$bindings.nav(nav);
  if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0)
    $$bindings.outline(outline);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.split === void 0 && $$bindings.split && split !== void 0)
    $$bindings.split(split);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  classes = classnames(className2, {
    "dropdown-toggle": caret || split,
    "dropdown-toggle-split": split,
    "nav-link": nav
  });
  btnClasses = classnames(classes, "btn", `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "d-block w-100" : false, { active });
  $$unsubscribe_context();
  return `${nav ? `<a${spread([
    escape_object($$restProps),
    { href: "#nav" },
    {
      "aria-expanded": escape_attribute_value($context.isOpen)
    },
    { class: escape_attribute_value(classes) }
  ])}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : `
      <span class="${"visually-hidden"}">${escape2(ariaLabel)}</span>
    `}</a>` : `${tag === "div" ? `<div${spread([
    escape_object($$restProps),
    {
      "aria-expanded": escape_attribute_value($context.isOpen)
    },
    { class: escape_attribute_value(classes) }
  ])}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : `
      <span class="${"visually-hidden"}">${escape2(ariaLabel)}</span>
    `}</div>` : `${tag === "span" ? `<span${spread([
    escape_object($$restProps),
    {
      "aria-expanded": escape_attribute_value($context.isOpen)
    },
    { class: escape_attribute_value(classes) }
  ])}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : `
      <span class="${"visually-hidden"}">${escape2(ariaLabel)}</span>
    `}</span>` : `<button${spread([
    escape_object($$restProps),
    {
      "aria-expanded": escape_attribute_value($context.isOpen)
    },
    {
      class: escape_attribute_value(btnClasses)
    }
  ])}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : `
      <span class="${"visually-hidden"}">${escape2(ariaLabel)}</span>
    `}</button>`}`}`}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["isOpen", "class", "onEntering", "onEntered", "onExiting", "onExited", "toggler"]);
  const dispatch = createEventDispatcher();
  let { isOpen = false } = $$props;
  let { class: className2 = "" } = $$props;
  let { onEntering = () => dispatch("opening") } = $$props;
  let { onEntered = () => dispatch("open") } = $$props;
  let { onExiting = () => dispatch("closing") } = $$props;
  let { onExited = () => dispatch("close") } = $$props;
  let { toggler = null } = $$props;
  onMount(() => toggle(toggler, () => isOpen = !isOpen));
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.onEntering === void 0 && $$bindings.onEntering && onEntering !== void 0)
    $$bindings.onEntering(onEntering);
  if ($$props.onEntered === void 0 && $$bindings.onEntered && onEntered !== void 0)
    $$bindings.onEntered(onEntered);
  if ($$props.onExiting === void 0 && $$bindings.onExiting && onExiting !== void 0)
    $$bindings.onExiting(onExiting);
  if ($$props.onExited === void 0 && $$bindings.onExited && onExited !== void 0)
    $$bindings.onExited(onExited);
  if ($$props.toggler === void 0 && $$bindings.toggler && toggler !== void 0)
    $$bindings.toggler(toggler);
  return `${isOpen ? `<div${spread([escape_object($$restProps), { class: escape_attribute_value(className2) }])}>${slots.default ? slots.default({}) : ``}</div>` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "alt", "caption"]);
  let $$slots = compute_slots(slots);
  setContext("figure", true);
  let { class: className2 = "" } = $$props;
  let { alt = void 0 } = $$props;
  let { caption = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  if ($$props.caption === void 0 && $$bindings.caption && caption !== void 0)
    $$bindings.caption(caption);
  classes = classnames("figure", className2);
  return `<img${spread([
    { alt: escape_attribute_value(alt) },
    escape_object($$restProps),
    { class: escape_attribute_value(classes) }
  ])}>

<figure${spread([{ class: escape_attribute_value(classes) }, escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}
  ${caption || $$slots.caption ? `<figcaption class="${"figure-caption"}">${escape2(caption)}${slots.caption ? slots.caption({}) : ``}</figcaption>` : ``}</figure>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "inline", "validated"]);
  let { class: className2 = "" } = $$props;
  let { inline = false } = $$props;
  let { validated = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.validated === void 0 && $$bindings.validated && validated !== void 0)
    $$bindings.validated(validated);
  classes = classnames(className2, {
    "form-inline": inline,
    "was-validated": validated
  });
  return `<form${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</form>`;
});
var FormCheck = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let inputClasses;
  let idFor;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "checked",
    "disabled",
    "group",
    "id",
    "inline",
    "inner",
    "invalid",
    "label",
    "name",
    "size",
    "type",
    "valid",
    "value"
  ]);
  let { class: className2 = "" } = $$props;
  let { checked = false } = $$props;
  let { disabled = false } = $$props;
  let { group = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { inline = false } = $$props;
  let { inner = void 0 } = $$props;
  let { invalid = false } = $$props;
  let { label = "" } = $$props;
  let { name = "" } = $$props;
  let { size = "" } = $$props;
  let { type = "checkbox" } = $$props;
  let { valid = false } = $$props;
  let { value = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.group === void 0 && $$bindings.group && group !== void 0)
    $$bindings.group(group);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.inner === void 0 && $$bindings.inner && inner !== void 0)
    $$bindings.inner(inner);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.valid === void 0 && $$bindings.valid && valid !== void 0)
    $$bindings.valid(valid);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  classes = classnames(className2, "form-check", {
    "form-switch": type === "switch",
    "form-check-inline": inline,
    [`form-control-${size}`]: size
  });
  inputClasses = classnames("form-check-input", { "is-invalid": invalid, "is-valid": valid });
  idFor = id || label;
  return `<div${add_attribute("class", classes, 0)}>${type === "radio" ? `<input${spread([
    escape_object($$restProps),
    {
      class: escape_attribute_value(inputClasses)
    },
    { id: escape_attribute_value(idFor) },
    { type: "radio" },
    { disabled: disabled || null },
    { name: escape_attribute_value(name) },
    { value: escape_attribute_value(value) }
  ])}${add_attribute("this", inner, 1)}>` : `${type === "switch" ? `<input${spread([
    escape_object($$restProps),
    {
      class: escape_attribute_value(inputClasses)
    },
    { id: escape_attribute_value(idFor) },
    { type: "checkbox" },
    { disabled: disabled || null },
    { name: escape_attribute_value(name) },
    { value: escape_attribute_value(value) }
  ])}${add_attribute("checked", checked, 1)}${add_attribute("this", inner, 1)}>` : `<input${spread([
    escape_object($$restProps),
    {
      class: escape_attribute_value(inputClasses)
    },
    { id: escape_attribute_value(idFor) },
    { type: "checkbox" },
    { disabled: disabled || null },
    { name: escape_attribute_value(name) },
    { value: escape_attribute_value(value) }
  ])}${add_attribute("checked", checked, 1)}${add_attribute("this", inner, 1)}>`}`}
  ${label ? `<label class="${"form-check-label"}"${add_attribute("for", idFor, 0)}>${slots.label ? slots.label({}) : `${escape2(label)}`}</label>` : ``}</div>`;
});
var FormFeedback = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "valid", "tooltip"]);
  let { class: className2 = "" } = $$props;
  let { valid = void 0 } = $$props;
  let { tooltip = false } = $$props;
  let classes;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.valid === void 0 && $$bindings.valid && valid !== void 0)
    $$bindings.valid(valid);
  if ($$props.tooltip === void 0 && $$bindings.tooltip && tooltip !== void 0)
    $$bindings.tooltip(tooltip);
  {
    {
      const validMode = tooltip ? "tooltip" : "feedback";
      classes = classnames(className2, valid ? `valid-${validMode}` : `invalid-${validMode}`);
    }
  }
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "check", "disabled", "inline", "row", "tag"]);
  let { class: className2 = "" } = $$props;
  let { check = false } = $$props;
  let { disabled = false } = $$props;
  let { inline = false } = $$props;
  let { row: row2 = false } = $$props;
  let { tag = null } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.check === void 0 && $$bindings.check && check !== void 0)
    $$bindings.check(check);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.row === void 0 && $$bindings.row && row2 !== void 0)
    $$bindings.row(row2);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  classes = classnames(className2, "mb-3", {
    row: row2,
    "form-check": check,
    "form-check-inline": check && inline,
    disabled: check && disabled
  });
  return `${tag === "fieldset" ? `<fieldset${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</fieldset>` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "inline", "color"]);
  let { class: className2 = "" } = $$props;
  let { inline = false } = $$props;
  let { color = "muted" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  classes = classnames(className2, !inline ? "form-text" : false, color ? `text-${color}` : false);
  return `<small${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</small>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "name"]);
  let { class: className2 = "" } = $$props;
  let { name = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  classes = classnames(className2, `bi-${name}`);
  return `<i${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}></i>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "alt", "figure", "fluid", "thumbnail"]);
  let { class: className2 = "" } = $$props;
  let { alt = void 0 } = $$props;
  let { figure = getContext("figure") } = $$props;
  let { fluid = false } = $$props;
  let { thumbnail = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  if ($$props.figure === void 0 && $$bindings.figure && figure !== void 0)
    $$bindings.figure(figure);
  if ($$props.fluid === void 0 && $$bindings.fluid && fluid !== void 0)
    $$bindings.fluid(fluid);
  if ($$props.thumbnail === void 0 && $$bindings.thumbnail && thumbnail !== void 0)
    $$bindings.thumbnail(thumbnail);
  classes = classnames(className2, {
    "figure-img": figure,
    "img-fluid": fluid,
    "img-thumbnail": thumbnail
  });
  return `<img${spread([
    { alt: escape_attribute_value(alt) },
    escape_object($$restProps),
    { class: escape_attribute_value(classes) }
  ])}>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "class",
    "bsSize",
    "checked",
    "color",
    "disabled",
    "feedback",
    "files",
    "group",
    "inner",
    "invalid",
    "label",
    "multiple",
    "name",
    "placeholder",
    "plaintext",
    "readonly",
    "size",
    "type",
    "valid",
    "value"
  ]);
  let { class: className2 = "" } = $$props;
  let { bsSize = void 0 } = $$props;
  let { checked = false } = $$props;
  let { color = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  let { feedback = void 0 } = $$props;
  let { files = void 0 } = $$props;
  let { group = void 0 } = $$props;
  let { inner = void 0 } = $$props;
  let { invalid = false } = $$props;
  let { label = void 0 } = $$props;
  let { multiple = void 0 } = $$props;
  let { name = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { plaintext = false } = $$props;
  let { readonly = void 0 } = $$props;
  let { size = void 0 } = $$props;
  let { type = "text" } = $$props;
  let { valid = false } = $$props;
  let { value = "" } = $$props;
  let classes;
  let tag;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.bsSize === void 0 && $$bindings.bsSize && bsSize !== void 0)
    $$bindings.bsSize(bsSize);
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.feedback === void 0 && $$bindings.feedback && feedback !== void 0)
    $$bindings.feedback(feedback);
  if ($$props.files === void 0 && $$bindings.files && files !== void 0)
    $$bindings.files(files);
  if ($$props.group === void 0 && $$bindings.group && group !== void 0)
    $$bindings.group(group);
  if ($$props.inner === void 0 && $$bindings.inner && inner !== void 0)
    $$bindings.inner(inner);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.multiple === void 0 && $$bindings.multiple && multiple !== void 0)
    $$bindings.multiple(multiple);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.plaintext === void 0 && $$bindings.plaintext && plaintext !== void 0)
    $$bindings.plaintext(plaintext);
  if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0)
    $$bindings.readonly(readonly);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.valid === void 0 && $$bindings.valid && valid !== void 0)
    $$bindings.valid(valid);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      {
        const isNotaNumber = new RegExp("\\D", "g");
        let isBtn = false;
        let formControlClass = "form-control";
        tag = "input";
        switch (type) {
          case "color":
            formControlClass = `form-control form-control-color`;
            break;
          case "range":
            formControlClass = "form-range";
            break;
          case "select":
            formControlClass = `form-select`;
            tag = "select";
            break;
          case "textarea":
            tag = "textarea";
            break;
          case "button":
          case "reset":
          case "submit":
            formControlClass = `btn btn-${color || "secondary"}`;
            isBtn = true;
            break;
          case "hidden":
          case "image":
            formControlClass = void 0;
            break;
          default:
            formControlClass = "form-control";
            tag = "input";
        }
        if (plaintext) {
          formControlClass = `${formControlClass}-plaintext`;
          tag = "input";
        }
        if (size && isNotaNumber.test(size)) {
          console.warn(`Please use the prop "bsSize" instead of the "size" to bootstrap's input sizing.`);
          bsSize = size;
          size = void 0;
        }
        classes = classnames(className2, formControlClass, {
          "is-invalid": invalid,
          "is-valid": valid,
          [`form-control-${bsSize}`]: bsSize && !isBtn,
          [`btn-${bsSize}`]: bsSize && isBtn
        });
      }
    }
    $$rendered = `${tag === "input" ? `${type === "text" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "text" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "password" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "password" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "color" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "color" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "email" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "email" },
      { disabled: disabled || null },
      { multiple: multiple || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "file" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "file" },
      { disabled: disabled || null },
      { invalid: escape_attribute_value(invalid) },
      { multiple: multiple || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { valid: escape_attribute_value(valid) }
    ])}>` : `${type === "checkbox" || type === "radio" || type === "switch" ? `${validate_component(FormCheck, "FormCheck").$$render($$result, Object.assign($$restProps, { class: className2 }, { size: bsSize }, { type }, { disabled }, { invalid }, { label }, { name }, { placeholder }, { readonly }, { valid }, { checked }, { group }, { value }, { this: inner }), {
      checked: ($$value) => {
        checked = $$value;
        $$settled = false;
      },
      group: ($$value) => {
        group = $$value;
        $$settled = false;
      },
      value: ($$value) => {
        value = $$value;
        $$settled = false;
      },
      this: ($$value) => {
        inner = $$value;
        $$settled = false;
      }
    }, {})}` : `${type === "url" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "url" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "number" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "number" },
      { readonly: readonly || null },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      {
        placeholder: escape_attribute_value(placeholder)
      }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "date" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "date" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "time" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "time" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "datetime" ? `<input${spread([
      escape_object($$restProps),
      { type: "datetime" },
      { readonly: readonly || null },
      { class: escape_attribute_value(classes) },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      {
        placeholder: escape_attribute_value(placeholder)
      }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "datetime-local" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "datetime-local" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "month" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "month" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "color" ? `<input${spread([
      escape_object($$restProps),
      { type: "color" },
      { readonly: readonly || null },
      { class: escape_attribute_value(classes) },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      {
        placeholder: escape_attribute_value(placeholder)
      }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "range" ? `<input${spread([
      escape_object($$restProps),
      { type: "range" },
      { readonly: readonly || null },
      { class: escape_attribute_value(classes) },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      {
        placeholder: escape_attribute_value(placeholder)
      }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "search" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "search" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "tel" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "tel" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null },
      { size: escape_attribute_value(size) }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `${type === "week" ? `<input${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { type: "week" },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>` : `<input${spread([
      escape_object($$restProps),
      { type: escape_attribute_value(type) },
      { readonly: readonly || null },
      { class: escape_attribute_value(classes) },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { value: escape_attribute_value(value) }
    ])}>`}`}`}`}`}`}`}`}`}`}`}`}`}`}`}`}`}`}` : `${tag === "textarea" ? `<textarea${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { disabled: disabled || null },
      { name: escape_attribute_value(name) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      { readonly: readonly || null }
    ])}${add_attribute("this", inner, 1)}>${value || ""}</textarea>` : `${tag === "select" && !multiple ? `<select${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { name: escape_attribute_value(name) },
      { disabled: disabled || null },
      { readonly: readonly || null }
    ])}${add_attribute("value", value, 1)}${add_attribute("this", inner, 1)}>${slots.default ? slots.default({}) : ``}</select>

  ` : ``}`}`}
${feedback ? `${Array.isArray(feedback) ? `${each(feedback, (msg) => `${validate_component(FormFeedback, "FormFeedback").$$render($$result, { valid }, {}, { default: () => `${escape2(msg)}` })}`)}` : `${validate_component(FormFeedback, "FormFeedback").$$render($$result, { valid }, {}, { default: () => `${escape2(feedback)}` })}`}` : ``}`;
  } while (!$$settled);
  return $$rendered;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "size"]);
  let { class: className2 = "" } = $$props;
  let { size = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  classes = classnames(className2, "input-group", size ? `input-group-${size}` : null);
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "input-group-text");
  return `<span${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</span>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "p-5 mb-4 bg-light rounded-3");
  return `<div${add_attribute("class", classes, 0)}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "hidden", "check", "size", "for", "xs", "sm", "md", "lg", "xl", "xxl", "widths"]);
  let { class: className2 = "" } = $$props;
  let { hidden = false } = $$props;
  let { check = false } = $$props;
  let { size = "" } = $$props;
  let { for: fore = null } = $$props;
  let { xs = "" } = $$props;
  let { sm = "" } = $$props;
  let { md = "" } = $$props;
  let { lg = "" } = $$props;
  let { xl = "" } = $$props;
  let { xxl = "" } = $$props;
  const colWidths = { xs, sm, md, lg, xl, xxl };
  let { widths = Object.keys(colWidths) } = $$props;
  const colClasses = [];
  widths.forEach((colWidth) => {
    let columnProp = $$props[colWidth];
    if (!columnProp && columnProp !== "") {
      return;
    }
    const isXs = colWidth === "xs";
    let colClass;
    if (isObject(columnProp)) {
      const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
      colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);
      colClasses.push(classnames({
        [colClass]: columnProp.size || columnProp.size === "",
        [`order${colSizeInterfix}${columnProp.order}`]: columnProp.order || columnProp.order === 0,
        [`offset${colSizeInterfix}${columnProp.offset}`]: columnProp.offset || columnProp.offset === 0
      }));
    } else {
      colClass = getColumnSizeClass(isXs, colWidth, columnProp);
      colClasses.push(colClass);
    }
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.hidden === void 0 && $$bindings.hidden && hidden !== void 0)
    $$bindings.hidden(hidden);
  if ($$props.check === void 0 && $$bindings.check && check !== void 0)
    $$bindings.check(check);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.for === void 0 && $$bindings.for && fore !== void 0)
    $$bindings.for(fore);
  if ($$props.xs === void 0 && $$bindings.xs && xs !== void 0)
    $$bindings.xs(xs);
  if ($$props.sm === void 0 && $$bindings.sm && sm !== void 0)
    $$bindings.sm(sm);
  if ($$props.md === void 0 && $$bindings.md && md !== void 0)
    $$bindings.md(md);
  if ($$props.lg === void 0 && $$bindings.lg && lg !== void 0)
    $$bindings.lg(lg);
  if ($$props.xl === void 0 && $$bindings.xl && xl !== void 0)
    $$bindings.xl(xl);
  if ($$props.xxl === void 0 && $$bindings.xxl && xxl !== void 0)
    $$bindings.xxl(xxl);
  if ($$props.widths === void 0 && $$bindings.widths && widths !== void 0)
    $$bindings.widths(widths);
  classes = classnames(className2, hidden ? "visually-hidden" : false, check ? "form-check-label" : false, size ? `col-form-label-${size}` : false, colClasses, colClasses.length ? "col-form-label" : "form-label");
  return `<label${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { for: escape_attribute_value(fore) }
  ])}>${slots.default ? slots.default({}) : ``}</label>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "flush", "numbered"]);
  let { class: className2 = "" } = $$props;
  let { flush = false } = $$props;
  let { numbered = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.flush === void 0 && $$bindings.flush && flush !== void 0)
    $$bindings.flush(flush);
  if ($$props.numbered === void 0 && $$bindings.numbered && numbered !== void 0)
    $$bindings.numbered(numbered);
  classes = classnames(className2, "list-group", {
    "list-group-flush": flush,
    "list-group-numbered": numbered
  });
  return `${numbered ? `<ol${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</ol>` : `<ul${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</ul>`}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "disabled", "color", "action", "href", "tag"]);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { disabled = false } = $$props;
  let { color = "" } = $$props;
  let { action = false } = $$props;
  let { href = null } = $$props;
  let { tag = null } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.action === void 0 && $$bindings.action && action !== void 0)
    $$bindings.action(action);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  classes = classnames(className2, "list-group-item", {
    active,
    disabled,
    "list-group-item-action": action || tag === "button",
    [`list-group-item-${color}`]: color
  });
  return `${href ? `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { href: escape_attribute_value(href) },
    { disabled: disabled || null },
    { active: escape_attribute_value(active) }
  ])}>${slots.default ? slots.default({}) : ``}</a>` : `${tag === "button" ? `<button${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { type: "button" },
    { disabled: disabled || null },
    { active: escape_attribute_value(active) }
  ])}>${slots.default ? slots.default({}) : ``}</button>` : `<li${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { disabled: disabled || null },
    { active: escape_attribute_value(active) }
  ])}>${slots.default ? slots.default({}) : ``}</li>`}`}`;
});
var InlineContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div>${slots.default ? slots.default({}) : ``}</div>`;
});
var ModalBody = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "modal-body");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var ModalHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "toggle", "closeAriaLabel", "children"]);
  let { class: className2 = "" } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  let { closeAriaLabel = "Close" } = $$props;
  let { children = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  if ($$props.closeAriaLabel === void 0 && $$bindings.closeAriaLabel && closeAriaLabel !== void 0)
    $$bindings.closeAriaLabel(closeAriaLabel);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  classes = classnames(className2, "modal-header");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}><h5 class="${"modal-title"}">${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</h5>
  ${slots.close ? slots.close({}) : `
    ${typeof toggle2 === "function" ? `<button type="${"button"}" class="${"btn-close"}"${add_attribute("aria-label", closeAriaLabel, 0)}></button>` : ``}
  `}</div>`;
});
var Portal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  let ref;
  let portal;
  onMount(() => {
    portal = document.createElement("div");
    document.body.appendChild(portal);
    portal.appendChild(ref);
  });
  onDestroy(() => {
    if (typeof document !== "undefined") {
      document.body.removeChild(portal);
    }
  });
  return `<div${spread([escape_object($$restProps)])}${add_attribute("this", ref, 1)}>${slots.default ? slots.default({}) : ``}</div>`;
});
var openCount = 0;
var dialogBaseClass = "modal-dialog";
var Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let outer;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "static",
    "isOpen",
    "autoFocus",
    "body",
    "centered",
    "container",
    "fullscreen",
    "header",
    "scrollable",
    "size",
    "toggle",
    "labelledBy",
    "backdrop",
    "wrapClassName",
    "modalClassName",
    "backdropClassName",
    "contentClassName",
    "fade",
    "backdropDuration",
    "unmountOnClose",
    "returnFocusAfterClose",
    "transitionType",
    "transitionOptions"
  ]);
  createEventDispatcher();
  let { class: className2 = "" } = $$props;
  let { static: staticModal = false } = $$props;
  let { isOpen = false } = $$props;
  let { autoFocus = true } = $$props;
  let { body = false } = $$props;
  let { centered = false } = $$props;
  let { container = void 0 } = $$props;
  let { fullscreen = false } = $$props;
  let { header = void 0 } = $$props;
  let { scrollable = false } = $$props;
  let { size = "" } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  let { labelledBy = "" } = $$props;
  let { backdrop = true } = $$props;
  let { wrapClassName = "" } = $$props;
  let { modalClassName = "" } = $$props;
  let { backdropClassName = "" } = $$props;
  let { contentClassName = "" } = $$props;
  let { fade: fade$1 = true } = $$props;
  let { backdropDuration = fade$1 ? 150 : 0 } = $$props;
  let { unmountOnClose = true } = $$props;
  let { returnFocusAfterClose = true } = $$props;
  let { transitionType = fade } = $$props;
  let { transitionOptions = { duration: fade$1 ? 300 : 0 } } = $$props;
  let hasOpened = false;
  let _isMounted = false;
  let _triggeringElement;
  let _originalBodyPadding;
  let _lastIsOpen = isOpen;
  let _dialog;
  onMount(() => {
    if (isOpen) {
      init2();
      hasOpened = true;
    }
  });
  onDestroy(() => {
    destroy();
    if (hasOpened) {
      close();
    }
  });
  afterUpdate(() => {
    if (isOpen && !_lastIsOpen) {
      init2();
      hasOpened = true;
    }
    _lastIsOpen = isOpen;
  });
  function init2() {
    try {
      _triggeringElement = document.activeElement;
    } catch (err) {
      _triggeringElement = null;
    }
    if (!staticModal) {
      _originalBodyPadding = getOriginalBodyPadding();
      conditionallyUpdateScrollbar();
      if (openCount === 0) {
        document.body.className = classnames(document.body.className, "modal-open");
      }
      ++openCount;
    }
    _isMounted = true;
  }
  function manageFocusAfterClose() {
    if (_triggeringElement) {
      if (typeof _triggeringElement.focus === "function" && returnFocusAfterClose) {
        _triggeringElement.focus();
      }
      _triggeringElement = null;
    }
  }
  function destroy() {
    manageFocusAfterClose();
  }
  function close() {
    if (openCount <= 1) {
      const modalOpenClassName = "modal-open";
      const modalOpenClassNameRegex = new RegExp(`(^| )${modalOpenClassName}( |$)`);
      document.body.className = document.body.className.replace(modalOpenClassNameRegex, " ").trim();
    }
    manageFocusAfterClose();
    openCount = Math.max(0, openCount - 1);
    setScrollbarWidth(_originalBodyPadding);
  }
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.static === void 0 && $$bindings.static && staticModal !== void 0)
    $$bindings.static(staticModal);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.autoFocus === void 0 && $$bindings.autoFocus && autoFocus !== void 0)
    $$bindings.autoFocus(autoFocus);
  if ($$props.body === void 0 && $$bindings.body && body !== void 0)
    $$bindings.body(body);
  if ($$props.centered === void 0 && $$bindings.centered && centered !== void 0)
    $$bindings.centered(centered);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.fullscreen === void 0 && $$bindings.fullscreen && fullscreen !== void 0)
    $$bindings.fullscreen(fullscreen);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.scrollable === void 0 && $$bindings.scrollable && scrollable !== void 0)
    $$bindings.scrollable(scrollable);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  if ($$props.labelledBy === void 0 && $$bindings.labelledBy && labelledBy !== void 0)
    $$bindings.labelledBy(labelledBy);
  if ($$props.backdrop === void 0 && $$bindings.backdrop && backdrop !== void 0)
    $$bindings.backdrop(backdrop);
  if ($$props.wrapClassName === void 0 && $$bindings.wrapClassName && wrapClassName !== void 0)
    $$bindings.wrapClassName(wrapClassName);
  if ($$props.modalClassName === void 0 && $$bindings.modalClassName && modalClassName !== void 0)
    $$bindings.modalClassName(modalClassName);
  if ($$props.backdropClassName === void 0 && $$bindings.backdropClassName && backdropClassName !== void 0)
    $$bindings.backdropClassName(backdropClassName);
  if ($$props.contentClassName === void 0 && $$bindings.contentClassName && contentClassName !== void 0)
    $$bindings.contentClassName(contentClassName);
  if ($$props.fade === void 0 && $$bindings.fade && fade$1 !== void 0)
    $$bindings.fade(fade$1);
  if ($$props.backdropDuration === void 0 && $$bindings.backdropDuration && backdropDuration !== void 0)
    $$bindings.backdropDuration(backdropDuration);
  if ($$props.unmountOnClose === void 0 && $$bindings.unmountOnClose && unmountOnClose !== void 0)
    $$bindings.unmountOnClose(unmountOnClose);
  if ($$props.returnFocusAfterClose === void 0 && $$bindings.returnFocusAfterClose && returnFocusAfterClose !== void 0)
    $$bindings.returnFocusAfterClose(returnFocusAfterClose);
  if ($$props.transitionType === void 0 && $$bindings.transitionType && transitionType !== void 0)
    $$bindings.transitionType(transitionType);
  if ($$props.transitionOptions === void 0 && $$bindings.transitionOptions && transitionOptions !== void 0)
    $$bindings.transitionOptions(transitionOptions);
  classes = classnames(dialogBaseClass, className2, {
    [`modal-${size}`]: size,
    "modal-fullscreen": fullscreen === true,
    [`modal-fullscreen-${fullscreen}-down`]: fullscreen && typeof fullscreen === "string",
    [`${dialogBaseClass}-centered`]: centered,
    [`${dialogBaseClass}-scrollable`]: scrollable
  });
  outer = container === "inline" || staticModal ? InlineContainer : Portal;
  return `${_isMounted ? `${validate_component(outer || missing_component, "svelte:component").$$render($$result, {}, {}, {
    default: () => `<div${spread([
      {
        class: escape_attribute_value(wrapClassName)
      },
      { tabindex: "-1" },
      escape_object($$restProps)
    ])}>${isOpen ? `<div${add_attribute("arialabelledby", labelledBy, 0)}${add_attribute("class", classnames("modal", modalClassName, {
      show: isOpen,
      "d-block": isOpen,
      "d-none": !isOpen,
      "position-static": staticModal
    }), 0)} role="${"dialog"}">${slots.external ? slots.external({}) : ``}
        <div${add_attribute("class", classes, 0)} role="${"document"}"${add_attribute("this", _dialog, 1)}><div${add_attribute("class", classnames("modal-content", contentClassName), 0)}>${header ? `${validate_component(ModalHeader, "ModalHeader").$$render($$result, { toggle: toggle2 }, {}, { default: () => `${escape2(header)}` })}` : ``}
            ${body ? `${validate_component(ModalBody, "ModalBody").$$render($$result, {}, {}, {
      default: () => `${slots.default ? slots.default({}) : ``}`
    })}` : `${slots.default ? slots.default({}) : ``}`}</div></div></div>
      ${backdrop && !staticModal ? `<div${add_attribute("class", classnames("modal-backdrop", "show", backdropClassName), 0)}></div>` : ``}` : ``}</div>`
  })}` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "modal-footer");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
function getVerticalClass(vertical) {
  if (vertical === false) {
    return false;
  } else if (vertical === true || vertical === "xs") {
    return "flex-column";
  }
  return `flex-${vertical}-column`;
}
var Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "tabs",
    "pills",
    "vertical",
    "horizontal",
    "justified",
    "fill",
    "navbar",
    "card"
  ]);
  let { class: className2 = "" } = $$props;
  let { tabs = false } = $$props;
  let { pills = false } = $$props;
  let { vertical = false } = $$props;
  let { horizontal = "" } = $$props;
  let { justified = false } = $$props;
  let { fill = false } = $$props;
  let { navbar = false } = $$props;
  let { card = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0)
    $$bindings.tabs(tabs);
  if ($$props.pills === void 0 && $$bindings.pills && pills !== void 0)
    $$bindings.pills(pills);
  if ($$props.vertical === void 0 && $$bindings.vertical && vertical !== void 0)
    $$bindings.vertical(vertical);
  if ($$props.horizontal === void 0 && $$bindings.horizontal && horizontal !== void 0)
    $$bindings.horizontal(horizontal);
  if ($$props.justified === void 0 && $$bindings.justified && justified !== void 0)
    $$bindings.justified(justified);
  if ($$props.fill === void 0 && $$bindings.fill && fill !== void 0)
    $$bindings.fill(fill);
  if ($$props.navbar === void 0 && $$bindings.navbar && navbar !== void 0)
    $$bindings.navbar(navbar);
  if ($$props.card === void 0 && $$bindings.card && card !== void 0)
    $$bindings.card(card);
  classes = classnames(className2, navbar ? "navbar-nav" : "nav", horizontal ? `justify-content-${horizontal}` : false, getVerticalClass(vertical), {
    "nav-tabs": tabs,
    "card-header-tabs": card && tabs,
    "nav-pills": pills,
    "card-header-pills": card && pills,
    "nav-justified": justified,
    "nav-fill": fill
  });
  return `<ul${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</ul>`;
});
function getExpandClass(expand) {
  if (expand === false) {
    return false;
  } else if (expand === true || expand === "xs") {
    return "navbar-expand";
  }
  return `navbar-expand-${expand}`;
}
var Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "container", "color", "dark", "expand", "fixed", "light", "sticky"]);
  let { class: className2 = "" } = $$props;
  let { container = "fluid" } = $$props;
  let { color = "" } = $$props;
  let { dark = false } = $$props;
  let { expand = "" } = $$props;
  let { fixed = "" } = $$props;
  let { light = false } = $$props;
  let { sticky = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.dark === void 0 && $$bindings.dark && dark !== void 0)
    $$bindings.dark(dark);
  if ($$props.expand === void 0 && $$bindings.expand && expand !== void 0)
    $$bindings.expand(expand);
  if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0)
    $$bindings.fixed(fixed);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.sticky === void 0 && $$bindings.sticky && sticky !== void 0)
    $$bindings.sticky(sticky);
  classes = classnames(className2, "navbar", getExpandClass(expand), {
    "navbar-light": light,
    "navbar-dark": dark,
    [`bg-${color}`]: color,
    [`fixed-${fixed}`]: fixed,
    [`sticky-${sticky}`]: sticky
  });
  return `<nav${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${container ? `${validate_component(Container, "Container").$$render($$result, { fluid: container === "fluid" }, {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}` : `${slots.default ? slots.default({}) : ``}`}</nav>`;
});
var NavItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active"]);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  classes = classnames(className2, "nav-item", active ? "active" : false);
  return `<li${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</li>`;
});
var NavLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "disabled", "active", "href"]);
  let { class: className2 = "" } = $$props;
  let { disabled = false } = $$props;
  let { active = false } = $$props;
  let { href = "#" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames(className2, "nav-link", { disabled, active });
  return `<a${spread([
    escape_object($$restProps),
    { href: escape_attribute_value(href) },
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</a>`;
});
var NavbarBrand = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "href"]);
  let { class: className2 = "" } = $$props;
  let { href = "/" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames(className2, "navbar-brand");
  return `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { href: escape_attribute_value(href) }
  ])}>${slots.default ? slots.default({}) : ``}</a>`;
});
var NavbarToggler = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "navbar-toggler");
  return `${validate_component(Button, "Button").$$render($$result, Object.assign($$restProps, { class: classes }), {}, {
    default: () => `${slots.default ? slots.default({}) : `
    <span class="${"navbar-toggler-icon"}"></span>
  `}`
  })}`;
});
var OffcanvasBody = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "offcanvas-body");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var OffcanvasHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "children", "closeAriaLabel", "toggle"]);
  let { class: className2 = "" } = $$props;
  let { children = void 0 } = $$props;
  let { closeAriaLabel = "Close" } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.closeAriaLabel === void 0 && $$bindings.closeAriaLabel && closeAriaLabel !== void 0)
    $$bindings.closeAriaLabel(closeAriaLabel);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  classes = classnames(className2, "offcanvas-header");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}><h5 class="${"offcanvas-title"}">${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</h5>
  ${slots.close ? slots.close({}) : `
    ${typeof toggle2 === "function" ? `<button${add_attribute("aria-label", closeAriaLabel, 0)} class="${"btn-close"}" type="${"button"}"></button>` : ``}
  `}</div>`;
});
var css$2 = {
  code: ".overflow-noscroll{overflow:hidden;padding-right:0px}",
  map: `{"version":3,"file":"Offcanvas.svelte","sources":["Offcanvas.svelte"],"sourcesContent":["<script>\\n  import { createEventDispatcher, onMount } from 'svelte';\\n  import { fade as fadeTransition } from 'svelte/transition';\\n  import InlineContainer from './InlineContainer.svelte';\\n  import OffcanvasBody from './OffcanvasBody.svelte';\\n  import OffcanvasHeader from './OffcanvasHeader.svelte';\\n  import Portal from './Portal.svelte';\\n  import classnames, { browserEvent, getTransitionDuration } from './utils';\\n\\n  const dispatch = createEventDispatcher();\\n\\n  let className = '';\\n  export { className as class };\\n  export let backdrop = true;\\n  export let container;\\n  export let fade = true;\\n  export let backdropDuration = fade ? 150 : 0;\\n  export let header = undefined;\\n  export let isOpen = false;\\n  export let placement = 'start';\\n  export let scroll = false;\\n  export let toggle = undefined;\\n\\n  // TODO support these like Modals:\\n  // export let autoFocus = true;\\n  // export let unmountOnClose = true;\\n  // TODO focus trap\\n\\n  let body;\\n  let isTransitioning = false;\\n  let element;\\n  let removeEscListener;\\n\\n  onMount(() => body = document.body);\\n\\n  $: if (body) {\\n    if (!scroll) {\\n      body.classList.toggle('overflow-noscroll', (isOpen || isTransitioning));\\n    }\\n  }\\n  $: if (element) {\\n    isOpen = isOpen; // Used to trigger reactive on isOpen changes.\\n    isTransitioning = true;\\n    dispatch(isOpen ? 'opening' : 'closing');\\n    setTimeout(() => {\\n      isTransitioning = false;\\n      dispatch(isOpen ? 'open' : 'close');\\n    }, getTransitionDuration(element));\\n  }\\n  $: if (isOpen && toggle && (typeof window !== 'undefined')) {\\n    removeEscListener = browserEvent(document, 'keydown', (event) => {\\n      if (event.key && event.key === 'Escape') toggle();\\n    });\\n  }\\n  $: if (!isOpen && removeEscListener) {\\n    removeEscListener();\\n  }\\n  $: handleMouseDown = (backdrop && toggle && body && isOpen) ? (e) => {\\n    if (e.target === body) {\\n      toggle();\\n    }\\n  } : undefined;\\n  $: classes = classnames('offcanvas', \`offcanvas-\${placement}\`, className, { show: isOpen });\\n  $: outer = (container === 'inline') ? InlineContainer : Portal;\\n<\/script>\\n\\n<style>\\n  :global(.overflow-noscroll) {\\n    overflow: hidden;\\n    padding-right: 0px;\\n  }\\n</style>\\n\\n<svelte:body on:mousedown={handleMouseDown} />\\n\\n<svelte:component this={outer}>\\n<div\\n  {...$$restProps}\\n  bind:this={element}\\n  aria-hidden={!isOpen ? true : undefined}\\n  aria-modal={isOpen ? true : undefined}\\n  class={classes}\\n  role={(isOpen || isTransitioning) ? 'dialog' : undefined}\\n  style={\`visibility: \${isOpen || isTransitioning ? 'visible' : 'hidden'}\`}\\n  tabindex=\\"-1\\">\\n  {#if toggle || header || $$slots.header}\\n    <OffcanvasHeader {toggle}>\\n      {#if header}\\n        <h5 class=\\"offcanvas-title\\">\\n          {header}\\n        </h5>\\n      {/if}\\n      <slot name=\\"header\\" />\\n    </OffcanvasHeader>\\n  {/if}\\n  <OffcanvasBody>\\n    <slot />\\n  </OffcanvasBody>\\n</div>\\n{#if backdrop && isOpen}\\n  <div\\n    on:click={toggle ? () => toggle() : undefined}\\n    transition:fadeTransition={{ duration: backdropDuration }}\\n    class={classnames('modal-backdrop', 'show')} />\\n{/if}\\n</svelte:component>\\n"],"names":[],"mappings":"AAmEU,kBAAkB,AAAE,CAAC,AAC3B,QAAQ,CAAE,MAAM,CAChB,aAAa,CAAE,GAAG,AACpB,CAAC"}`
};
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let outer;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "backdrop",
    "container",
    "fade",
    "backdropDuration",
    "header",
    "isOpen",
    "placement",
    "scroll",
    "toggle"
  ]);
  let $$slots = compute_slots(slots);
  createEventDispatcher();
  let { class: className2 = "" } = $$props;
  let { backdrop = true } = $$props;
  let { container } = $$props;
  let { fade: fade2 = true } = $$props;
  let { backdropDuration = fade2 ? 150 : 0 } = $$props;
  let { header = void 0 } = $$props;
  let { isOpen = false } = $$props;
  let { placement = "start" } = $$props;
  let { scroll = false } = $$props;
  let { toggle: toggle2 = void 0 } = $$props;
  let body;
  let isTransitioning = false;
  let element;
  let removeEscListener;
  onMount(() => body = document.body);
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.backdrop === void 0 && $$bindings.backdrop && backdrop !== void 0)
    $$bindings.backdrop(backdrop);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.fade === void 0 && $$bindings.fade && fade2 !== void 0)
    $$bindings.fade(fade2);
  if ($$props.backdropDuration === void 0 && $$bindings.backdropDuration && backdropDuration !== void 0)
    $$bindings.backdropDuration(backdropDuration);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.placement === void 0 && $$bindings.placement && placement !== void 0)
    $$bindings.placement(placement);
  if ($$props.scroll === void 0 && $$bindings.scroll && scroll !== void 0)
    $$bindings.scroll(scroll);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  $$result.css.add(css$2);
  {
    if (body) {
      if (!scroll) {
        body.classList.toggle("overflow-noscroll", isOpen || isTransitioning);
      }
    }
  }
  {
    if (isOpen && toggle2 && typeof window !== "undefined") {
      removeEscListener = browserEvent(document, "keydown", (event) => {
        if (event.key && event.key === "Escape")
          toggle2();
      });
    }
  }
  {
    if (!isOpen && removeEscListener) {
      removeEscListener();
    }
  }
  classes = classnames("offcanvas", `offcanvas-${placement}`, className2, { show: isOpen });
  outer = container === "inline" ? InlineContainer : Portal;
  return `

${validate_component(outer || missing_component, "svelte:component").$$render($$result, {}, {}, {
    default: () => `<div${spread([
      escape_object($$restProps),
      {
        "aria-hidden": escape_attribute_value(!isOpen ? true : void 0)
      },
      {
        "aria-modal": escape_attribute_value(isOpen ? true : void 0)
      },
      { class: escape_attribute_value(classes) },
      {
        role: escape_attribute_value(isOpen || isTransitioning ? "dialog" : void 0)
      },
      {
        style: escape_attribute_value(`visibility: ${isOpen || isTransitioning ? "visible" : "hidden"}`)
      },
      { tabindex: "-1" }
    ])}${add_attribute("this", element, 1)}>${toggle2 || header || $$slots.header ? `${validate_component(OffcanvasHeader, "OffcanvasHeader").$$render($$result, { toggle: toggle2 }, {}, {
      default: () => `${header ? `<h5 class="${"offcanvas-title"}">${escape2(header)}</h5>` : ``}
      ${slots.header ? slots.header({}) : ``}`
    })}` : ``}
  ${validate_component(OffcanvasBody, "OffcanvasBody").$$render($$result, {}, {}, {
      default: () => `${slots.default ? slots.default({}) : ``}`
    })}</div>
${backdrop && isOpen ? `<div${add_attribute("class", classnames("modal-backdrop", "show"), 0)}></div>` : ``}`
  })}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let listClasses;
  let $$restProps = compute_rest_props($$props, ["class", "listClassName", "size", "ariaLabel"]);
  let { class: className2 = "" } = $$props;
  let { listClassName = "" } = $$props;
  let { size = "" } = $$props;
  let { ariaLabel = "pagination" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.listClassName === void 0 && $$bindings.listClassName && listClassName !== void 0)
    $$bindings.listClassName(listClassName);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  classes = classnames(className2);
  listClasses = classnames(listClassName, "pagination", { [`pagination-${size}`]: !!size });
  return `<nav${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    {
      "aria-label": escape_attribute_value(ariaLabel)
    }
  ])}><ul${add_attribute("class", listClasses, 0)}>${slots.default ? slots.default({}) : ``}</ul></nav>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "disabled"]);
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { disabled = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  classes = classnames(className2, "page-item", { active, disabled });
  return `<li${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</li>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let realLabel;
  let $$restProps = compute_rest_props($$props, ["class", "next", "previous", "first", "last", "ariaLabel", "href"]);
  let { class: className2 = "" } = $$props;
  let { next = false } = $$props;
  let { previous = false } = $$props;
  let { first = false } = $$props;
  let { last = false } = $$props;
  let { ariaLabel = "" } = $$props;
  let { href = "" } = $$props;
  let defaultAriaLabel;
  let defaultCaret;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.next === void 0 && $$bindings.next && next !== void 0)
    $$bindings.next(next);
  if ($$props.previous === void 0 && $$bindings.previous && previous !== void 0)
    $$bindings.previous(previous);
  if ($$props.first === void 0 && $$bindings.first && first !== void 0)
    $$bindings.first(first);
  if ($$props.last === void 0 && $$bindings.last && last !== void 0)
    $$bindings.last(last);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames(className2, "page-link");
  {
    if (previous) {
      defaultAriaLabel = "Previous";
    } else if (next) {
      defaultAriaLabel = "Next";
    } else if (first) {
      defaultAriaLabel = "First";
    } else if (last) {
      defaultAriaLabel = "Last";
    }
  }
  realLabel = ariaLabel || defaultAriaLabel;
  {
    if (previous) {
      defaultCaret = "\u2039";
    } else if (next) {
      defaultCaret = "\u203A";
    } else if (first) {
      defaultCaret = "\xAB";
    } else if (last) {
      defaultCaret = "\xBB";
    }
  }
  return `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { href: escape_attribute_value(href) }
  ])}>${previous || next || first || last ? `<span aria-hidden="${"true"}">${slots.default ? slots.default({}) : `${escape2(defaultCaret)}`}</span>
    <span class="${"visually-hidden"}">${escape2(realLabel)}</span>` : `${slots.default ? slots.default({}) : ``}`}</a>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let outer;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "animation",
    "children",
    "container",
    "dismissible",
    "isOpen",
    "placement",
    "target",
    "title",
    "trigger"
  ]);
  let { class: className2 = "" } = $$props;
  let { animation = true } = $$props;
  let { children = void 0 } = $$props;
  let { container = void 0 } = $$props;
  let { dismissible = false } = $$props;
  let { isOpen = false } = $$props;
  let { placement = "top" } = $$props;
  let { target = "" } = $$props;
  let { title = "" } = $$props;
  let { trigger = "click" } = $$props;
  let targetEl;
  let popoverEl;
  let popperInstance;
  let bsPlacement;
  let popperPlacement = placement;
  const checkPopperPlacement = {
    name: "checkPopperPlacement",
    enabled: true,
    phase: "main",
    fn({ state }) {
      popperPlacement = state.placement;
    }
  };
  const open = () => isOpen = true;
  const close = () => isOpen = false;
  const toggle2 = () => isOpen = !isOpen;
  onMount(() => {
    targetEl = document.querySelector(`#${target}`);
    switch (trigger) {
      case "hover":
        targetEl.addEventListener("mouseover", open);
        targetEl.addEventListener("mouseleave", close);
        break;
      case "focus":
        targetEl.addEventListener("focus", open);
        targetEl.addEventListener("blur", close);
        break;
      default:
        targetEl.addEventListener("click", toggle2);
        if (dismissible)
          targetEl.addEventListener("blur", close);
        break;
    }
    return () => {
      switch (trigger) {
        case "hover":
          targetEl.removeEventListener("mouseover", open);
          targetEl.removeEventListener("mouseleave", close);
          break;
        case "focus":
          targetEl.removeEventListener("focus", open);
          targetEl.removeEventListener("blur", close);
          break;
        default:
          targetEl.removeEventListener("click", toggle2);
          if (dismissible)
            targetEl.removeEventListener("blur", close);
          break;
      }
    };
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.animation === void 0 && $$bindings.animation && animation !== void 0)
    $$bindings.animation(animation);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.dismissible === void 0 && $$bindings.dismissible && dismissible !== void 0)
    $$bindings.dismissible(dismissible);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.placement === void 0 && $$bindings.placement && placement !== void 0)
    $$bindings.placement(placement);
  if ($$props.target === void 0 && $$bindings.target && target !== void 0)
    $$bindings.target(target);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.trigger === void 0 && $$bindings.trigger && trigger !== void 0)
    $$bindings.trigger(trigger);
  {
    {
      if (isOpen && popoverEl) {
        popperInstance = createPopper(targetEl, popoverEl, {
          placement,
          modifiers: [
            checkPopperPlacement,
            {
              name: "offset",
              options: {
                offset: () => {
                  return [0, 8];
                }
              }
            }
          ]
        });
      } else if (popperInstance) {
        popperInstance.destroy();
        popperInstance = void 0;
      }
    }
  }
  {
    if (!target) {
      throw new Error("Need target!");
    }
  }
  {
    {
      if (popperPlacement === "left")
        bsPlacement = "start";
      else if (popperPlacement === "right")
        bsPlacement = "end";
      else
        bsPlacement = popperPlacement;
    }
  }
  classes = classnames(className2, "popover", animation ? "fade" : false, `bs-popover-${bsPlacement}`, isOpen ? "show" : false);
  outer = container === "inline" ? InlineContainer : Portal;
  return `${isOpen ? `${validate_component(outer || missing_component, "svelte:component").$$render($$result, {}, {}, {
    default: () => `<div${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { role: "tooltip" },
      {
        "x-placement": escape_attribute_value(popperPlacement)
      }
    ])}${add_attribute("this", popoverEl, 1)}><div class="${"popover-arrow"}" data-popper-arrow></div>
    <h3 class="${"popover-header"}">${slots.title ? slots.title({}) : `${escape2(title)}`}</h3>
    <div class="${"popover-body"}">${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</div></div>`
  })}` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let progressBarClasses;
  let percent;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "bar",
    "multi",
    "value",
    "max",
    "animated",
    "striped",
    "color",
    "barClassName"
  ]);
  let { class: className2 = "" } = $$props;
  let { bar = false } = $$props;
  let { multi = false } = $$props;
  let { value = 0 } = $$props;
  let { max: max2 = 100 } = $$props;
  let { animated = false } = $$props;
  let { striped = false } = $$props;
  let { color = "" } = $$props;
  let { barClassName = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.bar === void 0 && $$bindings.bar && bar !== void 0)
    $$bindings.bar(bar);
  if ($$props.multi === void 0 && $$bindings.multi && multi !== void 0)
    $$bindings.multi(multi);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.max === void 0 && $$bindings.max && max2 !== void 0)
    $$bindings.max(max2);
  if ($$props.animated === void 0 && $$bindings.animated && animated !== void 0)
    $$bindings.animated(animated);
  if ($$props.striped === void 0 && $$bindings.striped && striped !== void 0)
    $$bindings.striped(striped);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.barClassName === void 0 && $$bindings.barClassName && barClassName !== void 0)
    $$bindings.barClassName(barClassName);
  classes = classnames(className2, "progress");
  progressBarClasses = classnames("progress-bar", bar ? className2 || barClassName : barClassName, animated ? "progress-bar-animated" : null, color ? `bg-${color}` : null, striped || animated ? "progress-bar-striped" : null);
  percent = parseInt(value, 10) / parseInt(max2, 10) * 100;
  return `${bar ? `${multi ? `${slots.default ? slots.default({}) : ``}` : `<div${spread([
    escape_object($$restProps),
    {
      class: escape_attribute_value(progressBarClasses)
    },
    { style: "width: " + escape2(percent) + "%" },
    { role: "progressbar" },
    {
      "aria-valuenow": escape_attribute_value(value)
    },
    { "aria-valuemin": "0" },
    {
      "aria-valuemax": escape_attribute_value(max2)
    }
  ])}>${slots.default ? slots.default({}) : ``}</div>`}` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${multi ? `${slots.default ? slots.default({}) : ``}` : `<div${add_attribute("class", progressBarClasses, 0)} style="${"width: " + escape2(percent) + "%"}" role="${"progressbar"}"${add_attribute("aria-valuenow", value, 0)} aria-valuemin="${"0"}"${add_attribute("aria-valuemax", max2, 0)}>${slots.default ? slots.default({}) : ``}</div>`}</div>`}`;
});
function getCols(cols) {
  const colsValue = parseInt(cols);
  if (!isNaN(colsValue)) {
    if (colsValue > 0) {
      return [`row-cols-${colsValue}`];
    }
  } else if (typeof cols === "object") {
    return ["xs", "sm", "md", "lg", "xl"].map((colWidth) => {
      const isXs = colWidth === "xs";
      const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
      const value = cols[colWidth];
      if (typeof value === "number" && value > 0) {
        return `row-cols${colSizeInterfix}${value}`;
      }
      return null;
    }).filter((value) => !!value);
  }
  return [];
}
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "noGutters", "form", "cols"]);
  let { class: className2 = "" } = $$props;
  let { noGutters = false } = $$props;
  let { form = false } = $$props;
  let { cols = 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.noGutters === void 0 && $$bindings.noGutters && noGutters !== void 0)
    $$bindings.noGutters(noGutters);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  if ($$props.cols === void 0 && $$bindings.cols && cols !== void 0)
    $$bindings.cols(cols);
  classes = classnames(className2, noGutters ? "gx-0" : null, form ? "form-row" : "row", ...getCols(cols));
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "type", "size", "color"]);
  let { class: className2 = "" } = $$props;
  let { type = "border" } = $$props;
  let { size = "" } = $$props;
  let { color = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  classes = classnames(className2, size ? `spinner-${type}-${size}` : false, `spinner-${type}`, color ? `text-${color}` : false);
  return `<div${spread([
    escape_object($$restProps),
    { role: "status" },
    { class: escape_attribute_value(classes) }
  ])}><span class="${"visually-hidden"}">${slots.default ? slots.default({}) : `Loading...`}</span></div>`;
});
var Styles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { icons = true } = $$props;
  if ($$props.icons === void 0 && $$bindings.icons && icons !== void 0)
    $$bindings.icons(icons);
  return `${$$result.head += `<link rel="${"stylesheet"}" href="${"https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"}" data-svelte="svelte-4z5jpf">${icons ? `<link rel="${"stylesheet"}" href="${"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"}" data-svelte="svelte-4z5jpf">` : ``}`, ""}`;
});
var Colgroup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  setContext("colgroup", true);
  return `<colgroup>${slots.default ? slots.default({}) : ``}</colgroup>`;
});
var className = "";
var ResponsiveContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let responsiveClassName;
  let { responsive = false } = $$props;
  if ($$props.responsive === void 0 && $$bindings.responsive && responsive !== void 0)
    $$bindings.responsive(responsive);
  responsiveClassName = classnames(className, {
    "table-responsive": responsive === true,
    [`table-responsive-${responsive}`]: typeof responsive === "string"
  });
  return `${responsive ? `<div${add_attribute("class", responsiveClassName, 0)}>${slots.default ? slots.default({}) : ``}</div>` : `${slots.default ? slots.default({}) : ``}`}`;
});
var TableFooter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  setContext("footer", true);
  return `<tfoot${spread([escape_object($$restProps)])}><tr>${slots.default ? slots.default({}) : ``}</tr></tfoot>`;
});
var TableHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  setContext("header", true);
  return `<thead${spread([escape_object($$restProps)])}><tr>${slots.default ? slots.default({}) : ``}</tr></thead>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "size",
    "bordered",
    "borderless",
    "striped",
    "dark",
    "hover",
    "responsive",
    "rows"
  ]);
  let { class: className2 = "" } = $$props;
  let { size = "" } = $$props;
  let { bordered = false } = $$props;
  let { borderless = false } = $$props;
  let { striped = false } = $$props;
  let { dark = false } = $$props;
  let { hover = false } = $$props;
  let { responsive = false } = $$props;
  let { rows = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.bordered === void 0 && $$bindings.bordered && bordered !== void 0)
    $$bindings.bordered(bordered);
  if ($$props.borderless === void 0 && $$bindings.borderless && borderless !== void 0)
    $$bindings.borderless(borderless);
  if ($$props.striped === void 0 && $$bindings.striped && striped !== void 0)
    $$bindings.striped(striped);
  if ($$props.dark === void 0 && $$bindings.dark && dark !== void 0)
    $$bindings.dark(dark);
  if ($$props.hover === void 0 && $$bindings.hover && hover !== void 0)
    $$bindings.hover(hover);
  if ($$props.responsive === void 0 && $$bindings.responsive && responsive !== void 0)
    $$bindings.responsive(responsive);
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  classes = classnames(className2, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, dark ? "table-dark" : false, hover ? "table-hover" : false);
  return `${validate_component(ResponsiveContainer, "ResponsiveContainer").$$render($$result, { responsive }, {}, {
    default: () => `<table${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${rows ? `${validate_component(Colgroup, "Colgroup").$$render($$result, {}, {}, {
      default: () => `${slots.default ? slots.default({}) : ``}`
    })}
      ${validate_component(TableHeader, "TableHeader").$$render($$result, {}, {}, {
      default: () => `${slots.default ? slots.default({ row }) : ``}`
    })}
      <tbody>${each(rows, (row2) => `<tr>${slots.default ? slots.default({ row: row2 }) : ``}
          </tr>`)}</tbody>
      ${validate_component(TableFooter, "TableFooter").$$render($$result, {}, {}, {
      default: () => `${slots.default ? slots.default({}) : ``}`
    })}` : `${slots.default ? slots.default({}) : ``}`}</table>`
  })}`;
});
var TabHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  setContext("tabs", true);
  return `${validate_component(Nav, "Nav").$$render($$result, Object.assign($$restProps), {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "pills", "vertical"]);
  const dispatch = createEventDispatcher();
  let { class: className2 = "" } = $$props;
  let { pills = false } = $$props;
  let { vertical = false } = $$props;
  const activeTabId = writable2();
  setContext("tabContent", {
    activeTabId,
    setActiveTab: (tabId) => {
      activeTabId.set(tabId);
      dispatch("tab", tabId);
    }
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.pills === void 0 && $$bindings.pills && pills !== void 0)
    $$bindings.pills(pills);
  if ($$props.vertical === void 0 && $$bindings.vertical && vertical !== void 0)
    $$bindings.vertical(vertical);
  classes = classnames("tab-content", className2, { "d-flex align-items-start": vertical });
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${validate_component(TabHeader, "TabHeader").$$render($$result, {
    class: classnames({ "me-3": vertical }),
    pills,
    tabs: !pills,
    vertical
  }, {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}
  ${slots.default ? slots.default({}) : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let tabOpen;
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "tab", "tabId"]);
  let $activeTabId, $$unsubscribe_activeTabId;
  let { class: className2 = "" } = $$props;
  let { active = false } = $$props;
  let { tab = void 0 } = $$props;
  let { tabId = void 0 } = $$props;
  const tabs = getContext("tabs");
  const { activeTabId, setActiveTab } = getContext("tabContent");
  $$unsubscribe_activeTabId = subscribe(activeTabId, (value) => $activeTabId = value);
  onMount(() => {
    if (active)
      setActiveTab(tabId);
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0)
    $$bindings.tab(tab);
  if ($$props.tabId === void 0 && $$bindings.tabId && tabId !== void 0)
    $$bindings.tabId(tabId);
  tabOpen = $activeTabId === tabId;
  classes = classnames("tab-pane", className2, { active: tabOpen, show: tabOpen });
  $$unsubscribe_activeTabId();
  return `${tabs ? `${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
    default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { active: tabOpen }, {}, {
      default: () => `${tab ? `${escape2(tab)}` : ``}
      ${slots.tab ? slots.tab({}) : ``}`
    })}`
  })}` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
var ToastBody = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className2 = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  classes = classnames(className2, "toast-body");
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var ToastHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let tagClassName;
  let $$restProps = compute_rest_props($$props, ["class", "icon", "toggle", "closeAriaLabel"]);
  let { class: className2 = "" } = $$props;
  let { icon = null } = $$props;
  let { toggle: toggle2 = null } = $$props;
  let { closeAriaLabel = "Close" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  if ($$props.closeAriaLabel === void 0 && $$bindings.closeAriaLabel && closeAriaLabel !== void 0)
    $$bindings.closeAriaLabel(closeAriaLabel);
  classes = classnames(className2, "toast-header");
  tagClassName = classnames("me-auto", { "ms-2": icon != null });
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${icon ? `<svg${add_attribute("class", `rounded text-${icon}`, 0)} width="${"20"}" height="${"20"}" xmlns="${"http://www.w3.org/2000/svg"}" preserveAspectRatio="${"xMidYMid slice"}" focusable="${"false"}" role="${"img"}"><rect fill="${"currentColor"}" width="${"100%"}" height="${"100%"}"></rect></svg>` : `${slots.icon ? slots.icon({}) : ``}`}
  <strong${add_attribute("class", tagClassName, 0)}>${slots.default ? slots.default({}) : ``}</strong>
  ${toggle2 ? `${slots.close ? slots.close({}) : `
      ${validate_component(Button, "Button").$$render($$result, {
    close: true,
    "aria-label": closeAriaLabel
  }, {}, {})}
    `}` : ``}</div>`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "autohide", "body", "delay", "duration", "fade", "header", "isOpen", "toggle"]);
  createEventDispatcher();
  let { class: className2 = "" } = $$props;
  let { autohide = false } = $$props;
  let { body = false } = $$props;
  let { delay = 5e3 } = $$props;
  let { duration = 200 } = $$props;
  let { fade: fade2 = true } = $$props;
  let { header } = $$props;
  let { isOpen = true } = $$props;
  let { toggle: toggle2 = null } = $$props;
  let timeout;
  onDestroy(() => {
    return () => clearTimeout(timeout);
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.autohide === void 0 && $$bindings.autohide && autohide !== void 0)
    $$bindings.autohide(autohide);
  if ($$props.body === void 0 && $$bindings.body && body !== void 0)
    $$bindings.body(body);
  if ($$props.delay === void 0 && $$bindings.delay && delay !== void 0)
    $$bindings.delay(delay);
  if ($$props.duration === void 0 && $$bindings.duration && duration !== void 0)
    $$bindings.duration(duration);
  if ($$props.fade === void 0 && $$bindings.fade && fade2 !== void 0)
    $$bindings.fade(fade2);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle2 !== void 0)
    $$bindings.toggle(toggle2);
  {
    if (isOpen && autohide) {
      timeout = setTimeout(() => isOpen = false, delay);
    }
  }
  classes = classnames(className2, "toast", { show: isOpen });
  return `${isOpen ? `<div${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { role: "alert" }
  ])}>${header ? `${validate_component(ToastHeader, "ToastHeader").$$render($$result, { toggle: toggle2 }, {}, { default: () => `${escape2(header)}` })}` : ``}
    ${body ? `${validate_component(ToastBody, "ToastBody").$$render($$result, {}, {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}` : `${slots.default ? slots.default({}) : ``}`}</div>` : ``}`;
});
create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let outer;
  let $$restProps = compute_rest_props($$props, ["class", "animation", "children", "container", "id", "isOpen", "placement", "target"]);
  let { class: className2 = "" } = $$props;
  let { animation = true } = $$props;
  let { children = void 0 } = $$props;
  let { container = void 0 } = $$props;
  let { id = `tooltip_${uuid()}` } = $$props;
  let { isOpen = false } = $$props;
  let { placement = "top" } = $$props;
  let { target = "" } = $$props;
  let bsPlacement;
  let popperInstance;
  let popperPlacement = placement;
  let targetEl;
  let tooltipEl;
  const checkPopperPlacement = {
    name: "checkPopperPlacement",
    enabled: true,
    phase: "main",
    fn({ state }) {
      popperPlacement = state.placement;
    }
  };
  const open = () => isOpen = true;
  const close = () => isOpen = false;
  onMount(() => {
    targetEl = document.querySelector(`#${target}`);
    targetEl.addEventListener("mouseover", open);
    targetEl.addEventListener("mouseleave", close);
    targetEl.addEventListener("focus", open);
    targetEl.addEventListener("blur", close);
  });
  onDestroy(() => {
    if (targetEl) {
      targetEl.removeEventListener("mouseover", open);
      targetEl.removeEventListener("mouseleave", close);
      targetEl.removeEventListener("focus", open);
      targetEl.removeEventListener("blur", close);
      targetEl.removeAttribute("aria-describedby");
    }
  });
  if ($$props.class === void 0 && $$bindings.class && className2 !== void 0)
    $$bindings.class(className2);
  if ($$props.animation === void 0 && $$bindings.animation && animation !== void 0)
    $$bindings.animation(animation);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.placement === void 0 && $$bindings.placement && placement !== void 0)
    $$bindings.placement(placement);
  if ($$props.target === void 0 && $$bindings.target && target !== void 0)
    $$bindings.target(target);
  {
    {
      if (isOpen && tooltipEl) {
        popperInstance = createPopper(targetEl, tooltipEl, {
          placement,
          modifiers: [checkPopperPlacement]
        });
      } else if (popperInstance) {
        popperInstance.destroy();
        popperInstance = void 0;
      }
    }
  }
  {
    if (targetEl) {
      if (isOpen)
        targetEl.setAttribute("aria-describedby", id);
      else
        targetEl.removeAttribute("aria-describedby");
    }
  }
  {
    {
      if (popperPlacement === "left")
        bsPlacement = "start";
      else if (popperPlacement === "right")
        bsPlacement = "end";
      else
        bsPlacement = popperPlacement;
    }
  }
  classes = classnames(className2, "tooltip", animation ? "fade" : false, `bs-tooltip-${bsPlacement}`, isOpen ? "show" : false);
  {
    if (!target) {
      throw new Error("Need target!");
    }
  }
  outer = container === "inline" ? InlineContainer : Portal;
  return `${isOpen ? `${validate_component(outer || missing_component, "svelte:component").$$render($$result, {}, {}, {
    default: () => `<div${spread([
      escape_object($$restProps),
      { class: escape_attribute_value(classes) },
      { id: escape_attribute_value(id) },
      { role: "tooltip" },
      {
        "x-placement": escape_attribute_value(popperPlacement)
      }
    ])}${add_attribute("this", tooltipEl, 1)}><div class="${"tooltip-arrow"}" data-popper-arrow></div>
    <div class="${"tooltip-inner"}">${children ? `${escape2(children)}` : `${slots.default ? slots.default({}) : ``}`}</div></div>`
  })}` : ``}`;
});
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn2) {
    const store = getStores().page;
    return store.subscribe(fn2);
  }
};
var Navbar_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let isOpen = false;
  $$unsubscribe_page();
  return `${validate_component(Navbar, "Navbar").$$render($$result, {
    color: "light",
    light: true,
    expand: "md"
  }, {}, {
    default: () => `${validate_component(NavbarBrand, "NavbarBrand").$$render($$result, { href: "/" }, {}, {
      default: () => `Permacultura <br><spam class="${"text-muted"}">Svizzera Italiana</spam>`
    })}
	${validate_component(NavbarToggler, "NavbarToggler").$$render($$result, {}, {}, {})}

	${validate_component(Collapse, "Collapse").$$render($$result, { isOpen, navbar: true, expand: "md" }, {}, {
      default: () => `${validate_component(Nav, "Nav").$$render($$result, { class: "ms-auto", navbar: true }, {}, {
        default: () => `${$page.path.startsWith("/permablitz") ? `${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/permablitz/calendar" }, {}, { default: () => `Come funziona` })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/permablitz/calendar" }, {}, { default: () => `I nostri eventi` })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, {
            href: "/permablitz/projects",
            active: true
          }, {}, { default: () => `Progetti` })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/permablitz/values" }, {}, { default: () => `Valori` })}`
        })}
				${validate_component(Dropdown, "Dropdown").$$render($$result, { nav: true, inNavbar: true }, {}, {
          default: () => `${validate_component(DropdownToggle, "DropdownToggle").$$render($$result, { nav: true, caret: true }, {}, { default: () => `Persone` })}
					${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, {}, {}, {
            default: () => `${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `I ruoli dei Permablitz` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { divider: true }, {}, {})}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `Progettisti` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Collaboratori` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Host` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Artigiani` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Negozi e Fornitori` })}`
          })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/tools", active: true }, {}, { default: () => `Gli Attrezzi` })}`
        })}` : `${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/what" }, {}, { default: () => `Cos&#39;\xE8` })}`
        })}
        ${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/values" }, {}, { default: () => `Valori` })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/calendar" }, {}, { default: () => `Calendario` })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/permablitz", active: true }, {}, { default: () => `Permablitz` })}`
        })}
        ${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "/values" }, {}, { default: () => `Bacheca` })}`
        })}
				${validate_component(Dropdown, "Dropdown").$$render($$result, { nav: true, inNavbar: true }, {}, {
          default: () => `${validate_component(DropdownToggle, "DropdownToggle").$$render($$result, { nav: true, caret: true }, {}, { default: () => `Chi siamo` })}
					${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, {}, {}, {
            default: () => `${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Il Gruppo` })}
            ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `I volontari` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "values" }, {}, { default: () => `Obiettivi` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "hosts" }, {}, { default: () => `Dicono di noi` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "hosts" }, {}, { default: () => `Ringraziamenti` })}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, { divider: true }, {}, {})}
						${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `Entra` })}`
          })}`
        })}
				${validate_component(NavItem, "NavItem").$$render($$result, {}, {}, {
          default: () => `${validate_component(NavLink, "NavLink").$$render($$result, { href: "who" }, {}, { default: () => `Login` })}`
        })}`}`
      })}`
    })}`
  })}`;
});
var _layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Styles, "Styles").$$render($$result, {}, {}, {})}

${$$result.head += `${$$result.title = `<title>Permacultura Svizzera Italiana</title>`, ""}`, ""}

${validate_component(Navbar_1, "Navbar").$$render($$result, {}, {}, {})}
<div class="${"m-3"}">${slots.default ? slots.default({}) : ``}</div>

`;
});
var __layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout$1
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<p>${escape2(error22.message)}</p>


${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Sito della Permacultura Svizzera Italiana</h1>
<p>Visita xxx</p>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
function xxx(words) {
  const links = [];
  let previous = "/";
  words.slice(1).forEach((word) => {
    links.push({
      label: word.charAt(0).toUpperCase() + word.slice(1),
      link: previous + word
    });
    previous = previous + word + "/";
  });
  return links;
}
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let crumbs;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  crumbs = xxx($page.path.split("/"));
  $$unsubscribe_page();
  return `${validate_component(Styles, "Styles").$$render($$result, {}, {}, {})}

${$$result.head += `${$$result.title = `<title>Permacultura Svizzera Italiana</title>`, ""}`, ""}

<div class="${"m-2"}"><div class="${""}">${validate_component(Breadcrumb, "Breadcrumb").$$render($$result, { class: "d-flex justify-content-start" }, {}, {
    default: () => `${each(crumbs, (item, index2) => `${index2 == crumbs.length - 1 ? `${validate_component(BreadcrumbItem, "BreadcrumbItem").$$render($$result, {}, {}, { default: () => `${escape2(item.label)}` })}` : `${validate_component(BreadcrumbItem, "BreadcrumbItem").$$render($$result, {}, {}, {
      default: () => `<a${add_attribute("href", item.link, 0)}>/${escape2(item.label)}</a>`
    })}`}`)}`
  })}
		<h1>Permablitz</h1></div>
	<hr>
	${slots.default ? slots.default({}) : ``}</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var Permablitz = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<p>Siamo nei Permablitz</p>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Permablitz
});
var Calendar$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"text-center"}"><iframe title="${"calendario dei permablitz"}" src="${"https://calendar.google.com/calendar/embed?src=c_9vuvi57f7uprp2q1gl8a6950m0%40group.calendar.google.com&ctz=Europe%2FZurich"}" style="${"border: 0"}" width="${"800"}" height="${"600"}" frameborder="${"0"}" scrolling="${"no"}"></iframe></div>`;
});
var calendar$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Calendar$1
});
var css$1 = {
  code: ".bg.svelte-5bcepa{position:fixed;top:0;left:0;min-width:100%;min-height:100%}@media screen and (max-width: 1024px){img.bg.svelte-5bcepa{left:50%;margin-left:-512px}}",
  map: `{"version":3,"file":"projects.svelte","sources":["projects.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption, Modal, ModalBody, ModalFooter, ModalHeader, Button, Icon } from 'sveltestrap';\\nlet isOpen = false;\\nconst toggle = () => (isOpen = !isOpen);\\nconst items = [\\n    {\\n        url: '/images/pexels-quang-nguyen-vinh-2132250.jpg',\\n        title: 'Paesaggio inesplorato lungo la Via del Ferro',\\n        founder: 'Giulia Valsani, dal 1997 in Val Morobbia',\\n        subTitle: 'Gi\xE0 candidato, oscar mancato per poco, Giulia decide di intraprendere un percorso eco-sostenibile per aiutare i propri compaesani e gli anziani del paese.'\\n    },\\n    {\\n        url: '/images/pexels-mike-145685.jpg',\\n        title: 'Lo stagno riporta le rane nel deserto',\\n        founder: 'Scoproche Godo, dal 2011 sul Pian Magadino',\\n        subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos beatae eligendi ut reiciendis ab voluptas saepe eos quo! Illum, accusantium iste unde optio culpa cum tempore perferendis, perspiciatis ad soluta aspernatur dolorem delectus officiis corrupti velit tenetur excepturi. Perferendis exercitationem dicta tenetur tempora? Odio iure ut earum, voluptas illum suscipit.'\\n    },\\n    {\\n        url: '/images/pexels-bence-kondor-2259917.jpg',\\n        title: 'Casa degli hobbit',\\n        founder: 'Giulia Valsani, dal 1997 in Val Morobbia',\\n        subTitle: 'Un luogo creato nel 1976 da Barbara Fenice ad Olivone'\\n    }\\n];\\nlet activeIndex = 0;\\n<\/script>\\n\\n{#if !isOpen}\\n\\t<div class=\\"m-3\\">\\n\\t\\t{#each items as item, index}\\n\\t\\t\\t<div class=\\"m-3\\">\\n\\t\\t\\t\\t<div class=\\"row featurette\\">\\n\\t\\t\\t\\t\\t<div class=\\"col-md-5 {index % 2 ? 'order-md-5' : ''}\\">\\n\\t\\t\\t\\t\\t\\t<h2 class=\\"featurette-heading\\">{item.title}</h2>\\n\\t\\t\\t\\t\\t\\t<h4 class=\\"featurette-heading text-muted\\">{item.founder}</h4>\\n\\t\\t\\t\\t\\t\\t<p class=\\"lead h-100 d-inline-block\\">\\n\\t\\t\\t\\t\\t\\t\\t{item.subTitle}\\n\\t\\t\\t\\t\\t\\t\\t<a href=\\"xxx\\" class=\\"text-end\\">scopri di pi\xF9</a>\\n\\t\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t<div class=\\"col-md-7  {!(index % 2) ? 'd-flex justify-content-end' : ''}\\">\\n\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\thref=\\"#\\"\\n\\t\\t\\t\\t\\t\\t\\ton:click={() => {\\n\\t\\t\\t\\t\\t\\t\\t\\ttoggle();\\n\\t\\t\\t\\t\\t\\t\\t\\tactiveIndex = index;\\n\\t\\t\\t\\t\\t\\t\\t}}\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t<img src={item.url} alt=\\"\\" width=\\"500\\" />\\n\\t\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t\\t<hr class=\\"featurette-divider\\" />\\n\\t\\t{/each}\\n\\t</div>\\n{/if}\\n<div>\\n\\t<Modal {isOpen} {toggle} fullscreen size=\\"lg\\" scrollable={false} href=\\"#bottom\\">\\n\\t\\t<Carousel {items} bind:activeIndex ride interval={2000}>\\n\\t\\t\\t<div\\n\\t\\t\\t\\tclass=\\"carousel-inner\\"\\n\\t\\t\\t\\tstyle=\\"width: 95%; height: 95%; margin: auto;\\n      border: 3px solid gold;\\n      padding: 10px;\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t{#each items as item, index}\\n\\t\\t\\t\\t\\t<CarouselItem bind:activeIndex itemIndex={index}>\\n\\t\\t\\t\\t\\t\\t<div id=\\"bg\\">\\n\\t\\t\\t\\t\\t\\t\\t<img src={item.url} class=\\"bg d-block w-100 100vh\\" alt={item.title} />\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</CarouselItem>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</div>\\n\\t\\t</Carousel>\\n\\t</Modal>\\n</div>\\n<div class=\\"bottom\\" />\\n\\n<style>\\n\\t.bg {\\n\\t\\tposition: fixed;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\n\\t\\t/* Preserve aspet ratio */\\n\\t\\tmin-width: 100%;\\n\\t\\tmin-height: 100%;\\n\\t}\\n\\t@media screen and (max-width: 1024px) {\\n\\t\\t/* Specific to this particular image */\\n\\t\\timg.bg {\\n\\t\\t\\tleft: 50%;\\n\\t\\t\\tmargin-left: -512px; /* 50% */\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA+EC,GAAG,cAAC,CAAC,AACJ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CAGP,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAEtC,GAAG,GAAG,cAAC,CAAC,AACP,IAAI,CAAE,GAAG,CACT,WAAW,CAAE,MAAM,AACpB,CAAC,AACF,CAAC"}`
};
var Projects$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isOpen = false;
  const toggle2 = () => isOpen = !isOpen;
  const items = [
    {
      url: "/images/pexels-quang-nguyen-vinh-2132250.jpg",
      title: "Paesaggio inesplorato lungo la Via del Ferro",
      founder: "Giulia Valsani, dal 1997 in Val Morobbia",
      subTitle: "Gi\xE0 candidato, oscar mancato per poco, Giulia decide di intraprendere un percorso eco-sostenibile per aiutare i propri compaesani e gli anziani del paese."
    },
    {
      url: "/images/pexels-mike-145685.jpg",
      title: "Lo stagno riporta le rane nel deserto",
      founder: "Scoproche Godo, dal 2011 sul Pian Magadino",
      subTitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos beatae eligendi ut reiciendis ab voluptas saepe eos quo! Illum, accusantium iste unde optio culpa cum tempore perferendis, perspiciatis ad soluta aspernatur dolorem delectus officiis corrupti velit tenetur excepturi. Perferendis exercitationem dicta tenetur tempora? Odio iure ut earum, voluptas illum suscipit."
    },
    {
      url: "/images/pexels-bence-kondor-2259917.jpg",
      title: "Casa degli hobbit",
      founder: "Giulia Valsani, dal 1997 in Val Morobbia",
      subTitle: "Un luogo creato nel 1976 da Barbara Fenice ad Olivone"
    }
  ];
  let activeIndex = 0;
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${!isOpen ? `<div class="${"m-3"}">${each(items, (item, index2) => `<div class="${"m-3"}"><div class="${"row featurette"}"><div class="${"col-md-5 " + escape2(index2 % 2 ? "order-md-5" : "")}"><h2 class="${"featurette-heading"}">${escape2(item.title)}</h2>
						<h4 class="${"featurette-heading text-muted"}">${escape2(item.founder)}</h4>
						<p class="${"lead h-100 d-inline-block"}">${escape2(item.subTitle)}
							<a href="${"xxx"}" class="${"text-end"}">scopri di pi\xF9</a>
						</p></div>
					<div class="${"col-md-7  " + escape2(!(index2 % 2) ? "d-flex justify-content-end" : "")}"><a href="${"#"}"><img${add_attribute("src", item.url, 0)} alt="${""}" width="${"500"}">
						</a></div>
				</div></div>
			<hr class="${"featurette-divider"}">`)}</div>` : ``}
<div>${validate_component(Modal, "Modal").$$render($$result, {
      isOpen,
      toggle: toggle2,
      fullscreen: true,
      size: "lg",
      scrollable: false,
      href: "#bottom"
    }, {}, {
      default: () => `${validate_component(Carousel, "Carousel").$$render($$result, {
        items,
        ride: true,
        interval: 2e3,
        activeIndex
      }, {
        activeIndex: ($$value) => {
          activeIndex = $$value;
          $$settled = false;
        }
      }, {
        default: () => `<div class="${"carousel-inner"}" style="${"width: 95%; height: 95%; margin: auto;\n      border: 3px solid gold;\n      padding: 10px;"}">${each(items, (item, index2) => `${validate_component(CarouselItem, "CarouselItem").$$render($$result, { itemIndex: index2, activeIndex }, {
          activeIndex: ($$value) => {
            activeIndex = $$value;
            $$settled = false;
          }
        }, {
          default: () => `<div id="${"bg"}"><img${add_attribute("src", item.url, 0)} class="${"bg d-block w-100 100vh svelte-5bcepa"}"${add_attribute("alt", item.title, 0)}></div>
					`
        })}`)}</div>`
      })}`
    })}</div>
<div class="${"bottom"}"></div>`;
  } while (!$$settled);
  return $$rendered;
});
var projects$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Projects$1
});
var Values = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Valori</h1>
...`;
});
var Values_1$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Values, "Values").$$render($$result, {}, {}, {})}`;
});
var values$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Values_1$1
});
var Calendar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"text-center"}"><iframe src="${"https://calendar.google.com/calendar/embed?height=780&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FZurich&src=Y185dnV2aTU3Zjd1cHJwMnExZ2w4YTY5NTBtMEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=Y19xOHVmZzY5amI1MXJmdm4xdGdxYzFhaXU1NEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4uY2gjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%238E24AA&color=%23EF6C00&color=%23A79B8E&showTitle=1&showPrint=0&showTabs=1&showTz=0&showNav=1&mode=MONTH&title=Permacultura%20Svizzera%20Italiana"}" style="${"border-width:0"}" width="${"1024"}" height="${"780"}" frameborder="${"0"}" scrolling="${"no"}"></iframe></div>`;
});
var calendar = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Calendar
});
var css = {
  code: ".bg.svelte-5bcepa{position:fixed;top:0;left:0;min-width:100%;min-height:100%}@media screen and (max-width: 1024px){img.bg.svelte-5bcepa{left:50%;margin-left:-512px}}",
  map: `{"version":3,"file":"projects.svelte","sources":["projects.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { Carousel, CarouselControl, CarouselIndicators, CarouselItem, CarouselCaption, Modal, ModalBody, ModalFooter, ModalHeader, Button, Icon } from 'sveltestrap';\\nlet isOpen = false;\\nconst toggle = () => (isOpen = !isOpen);\\nconst items = [\\n    {\\n        url: '/images/pexels-quang-nguyen-vinh-2132250.jpg',\\n        title: 'Paesaggio inesplorato lungo la Via del Ferro',\\n        founder: 'Giulia Valsani, dal 1997 in Val Morobbia',\\n        subTitle: 'Gi\xE0 candidato, oscar mancato per poco, Giulia decide di intraprendere un percorso eco-sostenibile per aiutare i propri compaesani e gli anziani del paese.'\\n    },\\n    {\\n        url: '/images/pexels-mike-145685.jpg',\\n        title: 'Lo stagno riporta le rane nel deserto',\\n        founder: 'Scoproche Godo, dal 2011 sul Pian Magadino',\\n        subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos beatae eligendi ut reiciendis ab voluptas saepe eos quo! Illum, accusantium iste unde optio culpa cum tempore perferendis, perspiciatis ad soluta aspernatur dolorem delectus officiis corrupti velit tenetur excepturi. Perferendis exercitationem dicta tenetur tempora? Odio iure ut earum, voluptas illum suscipit.'\\n    },\\n    {\\n        url: '/images/pexels-bence-kondor-2259917.jpg',\\n        title: 'Casa degli hobbit',\\n        founder: 'Giulia Valsani, dal 1997 in Val Morobbia',\\n        subTitle: 'Un luogo creato nel 1976 da Barbara Fenice ad Olivone'\\n    }\\n];\\nlet activeIndex = 0;\\n<\/script>\\n\\n{#if !isOpen}\\n\\t<div class=\\"m-3\\">\\n\\t\\t<hr class=\\"featurette-divider\\" />\\n\\t\\t{#each items as item, index}\\n\\t\\t\\t<div class=\\"m-3\\">\\n\\t\\t\\t\\t<div class=\\"row featurette\\">\\n\\t\\t\\t\\t\\t<div class=\\"col-md-5 {index % 2 ? 'order-md-5' : ''}\\">\\n\\t\\t\\t\\t\\t\\t<h2 class=\\"featurette-heading\\">{item.title}</h2>\\n\\t\\t\\t\\t\\t\\t<h4 class=\\"featurette-heading text-muted\\">{item.founder}</h4>\\n\\t\\t\\t\\t\\t\\t<p class=\\"lead\\">{item.subTitle}</p>\\n            <div class=\\"text-end\\">\\n              <a href=\\"xxx\\">scopri di pi\xF9</a>\\n            </div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t<div class=\\"col-md-7\\">\\n\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\thref=\\"#\\"\\n\\t\\t\\t\\t\\t\\t\\ton:click={() => {\\n\\t\\t\\t\\t\\t\\t\\t\\ttoggle();\\n\\t\\t\\t\\t\\t\\t\\t\\tactiveIndex = index;\\n\\t\\t\\t\\t\\t\\t\\t}}\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t<img src={item.url} alt=\\"\\" width=\\"500\\" />\\n\\t\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t\\t<hr class=\\"featurette-divider\\" />\\n\\t\\t{/each}\\n\\t</div>\\n{/if}\\n<div>\\n\\t<Modal {isOpen} {toggle} fullscreen size=\\"lg\\" scrollable={false} href=\\"#bottom\\">\\n\\t\\t<Carousel {items} bind:activeIndex ride interval={2000}>\\n\\t\\t\\t<div\\n\\t\\t\\t\\tclass=\\"carousel-inner\\"\\n\\t\\t\\t\\tstyle=\\"width: 95%; height: 95%; margin: auto;\\n      border: 3px solid gold;\\n      padding: 10px;\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<CarouselIndicators bind:activeIndex {items} />\\n\\t\\t\\t\\t{#each items as item, index}\\n\\t\\t\\t\\t\\t<CarouselItem bind:activeIndex itemIndex={index}>\\n\\t\\t\\t\\t\\t\\t<div id=\\"bg\\">\\n\\t\\t\\t\\t\\t\\t\\t<img src={item.url} class=\\"bg d-block w-100 100vh\\" alt={item.title} />\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t\\t<CarouselCaption\\n\\t\\t\\t\\t\\t\\t\\tcaptionHeader={item.title}\\n\\t\\t\\t\\t\\t\\t\\tcaptionText={item.founder}\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"fs-2 text-black bg-secondary\\"\\n\\t\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t\\t</CarouselItem>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t<CarouselControl direction=\\"prev\\" directionText=\\"avanti\\" bind:activeIndex {items} />\\n\\t\\t\\t\\t<CarouselControl direction=\\"next\\" bind:activeIndex {items} />\\n\\t\\t\\t</div>\\n\\t\\t</Carousel>\\n\\t</Modal>\\n</div>\\n<div class=\\"bottom\\" />\\n\\n<style>\\n\\t.bg {\\n\\t\\tposition: fixed;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\n\\t\\t/* Preserve aspet ratio */\\n\\t\\tmin-width: 100%;\\n\\t\\tmin-height: 100%;\\n\\t}\\n\\t@media screen and (max-width: 1024px) {\\n\\t\\t/* Specific to this particular image */\\n\\t\\timg.bg {\\n\\t\\t\\tleft: 50%;\\n\\t\\t\\tmargin-left: -512px; /* 50% */\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAwFC,GAAG,cAAC,CAAC,AACJ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CAGP,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAEtC,GAAG,GAAG,cAAC,CAAC,AACP,IAAI,CAAE,GAAG,CACT,WAAW,CAAE,MAAM,AACpB,CAAC,AACF,CAAC"}`
};
var Projects = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isOpen = false;
  const toggle2 = () => isOpen = !isOpen;
  const items = [
    {
      url: "/images/pexels-quang-nguyen-vinh-2132250.jpg",
      title: "Paesaggio inesplorato lungo la Via del Ferro",
      founder: "Giulia Valsani, dal 1997 in Val Morobbia",
      subTitle: "Gi\xE0 candidato, oscar mancato per poco, Giulia decide di intraprendere un percorso eco-sostenibile per aiutare i propri compaesani e gli anziani del paese."
    },
    {
      url: "/images/pexels-mike-145685.jpg",
      title: "Lo stagno riporta le rane nel deserto",
      founder: "Scoproche Godo, dal 2011 sul Pian Magadino",
      subTitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos beatae eligendi ut reiciendis ab voluptas saepe eos quo! Illum, accusantium iste unde optio culpa cum tempore perferendis, perspiciatis ad soluta aspernatur dolorem delectus officiis corrupti velit tenetur excepturi. Perferendis exercitationem dicta tenetur tempora? Odio iure ut earum, voluptas illum suscipit."
    },
    {
      url: "/images/pexels-bence-kondor-2259917.jpg",
      title: "Casa degli hobbit",
      founder: "Giulia Valsani, dal 1997 in Val Morobbia",
      subTitle: "Un luogo creato nel 1976 da Barbara Fenice ad Olivone"
    }
  ];
  let activeIndex = 0;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${!isOpen ? `<div class="${"m-3"}"><hr class="${"featurette-divider"}">
		${each(items, (item, index2) => `<div class="${"m-3"}"><div class="${"row featurette"}"><div class="${"col-md-5 " + escape2(index2 % 2 ? "order-md-5" : "")}"><h2 class="${"featurette-heading"}">${escape2(item.title)}</h2>
						<h4 class="${"featurette-heading text-muted"}">${escape2(item.founder)}</h4>
						<p class="${"lead"}">${escape2(item.subTitle)}</p>
            <div class="${"text-end"}"><a href="${"xxx"}">scopri di pi\xF9</a>
            </div></div>
					<div class="${"col-md-7"}"><a href="${"#"}"><img${add_attribute("src", item.url, 0)} alt="${""}" width="${"500"}">
						</a></div>
				</div></div>
			<hr class="${"featurette-divider"}">`)}</div>` : ``}
<div>${validate_component(Modal, "Modal").$$render($$result, {
      isOpen,
      toggle: toggle2,
      fullscreen: true,
      size: "lg",
      scrollable: false,
      href: "#bottom"
    }, {}, {
      default: () => `${validate_component(Carousel, "Carousel").$$render($$result, {
        items,
        ride: true,
        interval: 2e3,
        activeIndex
      }, {
        activeIndex: ($$value) => {
          activeIndex = $$value;
          $$settled = false;
        }
      }, {
        default: () => `<div class="${"carousel-inner"}" style="${"width: 95%; height: 95%; margin: auto;\n      border: 3px solid gold;\n      padding: 10px;"}">${validate_component(CarouselIndicators, "CarouselIndicators").$$render($$result, { items, activeIndex }, {
          activeIndex: ($$value) => {
            activeIndex = $$value;
            $$settled = false;
          }
        }, {})}
				${each(items, (item, index2) => `${validate_component(CarouselItem, "CarouselItem").$$render($$result, { itemIndex: index2, activeIndex }, {
          activeIndex: ($$value) => {
            activeIndex = $$value;
            $$settled = false;
          }
        }, {
          default: () => `<div id="${"bg"}"><img${add_attribute("src", item.url, 0)} class="${"bg d-block w-100 100vh svelte-5bcepa"}"${add_attribute("alt", item.title, 0)}></div>
						${validate_component(CarouselCaption, "CarouselCaption").$$render($$result, {
            captionHeader: item.title,
            captionText: item.founder,
            class: "fs-2 text-black bg-secondary"
          }, {}, {})}
					`
        })}`)}
				${validate_component(CarouselControl, "CarouselControl").$$render($$result, {
          direction: "prev",
          directionText: "avanti",
          items,
          activeIndex
        }, {
          activeIndex: ($$value) => {
            activeIndex = $$value;
            $$settled = false;
          }
        }, {})}
				${validate_component(CarouselControl, "CarouselControl").$$render($$result, { direction: "next", items, activeIndex }, {
          activeIndex: ($$value) => {
            activeIndex = $$value;
            $$settled = false;
          }
        }, {})}</div>`
      })}`
    })}</div>
<div class="${"bottom"}"></div>`;
  } while (!$$settled);
  return $$rendered;
});
var projects = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Projects
});
var Values_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Values, "Values").$$render($$result, {}, {}, {})}`;
});
var values = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Values_1
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const rawBody = headers["content-type"] === "application/octet-stream" ? new TextEncoder("base64").encode(body) : isBase64Encoded ? Buffer.from(body, "base64").toString() : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      headers: rendered.headers,
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
