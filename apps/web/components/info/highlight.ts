/**
 * A deliberately small syntax highlighter — no dependency, no build step.
 *
 * It is approximate by design: good enough for the short, well-formed samples
 * on the landing page, and guaranteed never to throw. Anything it cannot
 * classify falls through as plain text.
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "type"
  | "number"
  | "property"
  | "function"
  | "punctuation";

export interface Token {
  text: string;
  kind: TokenKind;
}

export type Lang = "ts" | "bash" | "json";

const TS_KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "const",
  "let",
  "var",
  "function",
  "return",
  "async",
  "await",
  "type",
  "interface",
  "class",
  "extends",
  "implements",
  "new",
  "if",
  "else",
  "for",
  "while",
  "typeof",
  "keyof",
  "as",
  "default",
  "null",
  "undefined",
  "true",
  "false",
  "void",
  "public",
  "private",
]);

/** Ordered — first match at a position wins. */
const TS_RULES: { kind: TokenKind; re: RegExp }[] = [
  { kind: "comment", re: /^\/\/[^\n]*|^\/\*[\s\S]*?\*\//},
  { kind: "string", re: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'|^`(?:[^`\\]|\\.)*`/ },
  { kind: "number", re: /^\b\d+(?:\.\d+)?\b/ },
  { kind: "function", re: /^[A-Za-z_$][\w$]*(?=\s*\()/ },
  { kind: "property", re: /^[A-Za-z_$][\w$]*(?=\s*:)/ },
  { kind: "type", re: /^\b[A-Z][\w$]*\b/ },
  { kind: "plain", re: /^[A-Za-z_$][\w$]*/ },
  { kind: "punctuation", re: /^[{}()[\].,;:=<>|&?!+\-*/%^~]+/ },
  { kind: "plain", re: /^\s+/ },
];

const BASH_RULES: { kind: TokenKind; re: RegExp }[] = [
  { kind: "comment", re: /^#[^\n]*/ },
  { kind: "string", re: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/ },
  { kind: "keyword", re: /^\$(?=\s)/ },
  { kind: "function", re: /^\b(?:curl|docker|pnpm|npm|npx|git|cd|node|compose)\b/ },
  { kind: "type", re: /^--?[\w-]+/ },
  { kind: "number", re: /^\b\d+(?:\.\d+)?\b/ },
  { kind: "plain", re: /^[\w./:@-]+/ },
  { kind: "punctuation", re: /^[{}()[\].,;:=<>|&]+/ },
  { kind: "plain", re: /^\s+/ },
];

const JSON_RULES: { kind: TokenKind; re: RegExp }[] = [
  // Not legal JSON, but the samples annotate themselves.
  { kind: "comment", re: /^\/\/[^\n]*/ },
  { kind: "property", re: /^"(?:[^"\\]|\\.)*"(?=\s*:)/ },
  { kind: "string", re: /^"(?:[^"\\]|\\.)*"/ },
  { kind: "number", re: /^-?\b\d+(?:\.\d+)?\b/ },
  { kind: "keyword", re: /^\b(?:true|false|null)\b/ },
  { kind: "punctuation", re: /^[{}[\],:]+/ },
  { kind: "plain", re: /^\s+/ },
  { kind: "plain", re: /^[^\s{}[\],:"]+/ },
];

function rulesFor(lang: Lang) {
  if (lang === "bash") return BASH_RULES;
  if (lang === "json") return JSON_RULES;
  return TS_RULES;
}

export function tokenize(code: string, lang: Lang): Token[] {
  const rules = rulesFor(lang);
  const tokens: Token[] = [];
  let rest = code;

  // Bounded so a pathological input can never hang the render.
  let guard = 0;
  const limit = code.length + 1000;

  while (rest.length > 0 && guard++ < limit) {
    let matched = false;

    for (const rule of rules) {
      const m = rule.re.exec(rest);
      if (!m || m[0].length === 0) continue;

      const text = m[0];
      // Keywords are ordinary identifiers until we check the word list.
      const kind: TokenKind =
        lang === "ts" && rule.kind === "plain" && TS_KEYWORDS.has(text) ? "keyword" : rule.kind;

      push(tokens, { text, kind });
      rest = rest.slice(text.length);
      matched = true;
      break;
    }

    // Nothing matched: emit one character and keep going rather than loop.
    if (!matched) {
      push(tokens, { text: rest[0] ?? "", kind: "plain" });
      rest = rest.slice(1);
    }
  }

  if (rest.length > 0) push(tokens, { text: rest, kind: "plain" });
  return tokens;
}

/** Merge adjacent same-kind tokens so the DOM stays small. */
function push(tokens: Token[], token: Token) {
  const last = tokens[tokens.length - 1];
  if (last && last.kind === token.kind) {
    last.text += token.text;
    return;
  }
  tokens.push(token);
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-zinc-200",
  comment: "text-zinc-500 italic",
  string: "text-emerald-300",
  keyword: "text-violet-300",
  type: "text-sky-300",
  number: "text-amber-300",
  property: "text-cyan-200",
  function: "text-blue-300",
  punctuation: "text-zinc-400",
};
