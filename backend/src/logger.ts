type Meta = Record<string, unknown>;

function format(level: string, msg: string, meta?: Meta): string {
  const line = `[${new Date().toISOString()}] ${level} ${msg}`;
  return meta ? `${line} ${JSON.stringify(meta)}` : line;
}

export const logger = {
  info: (msg: string, meta?: Meta) => console.log(format("INFO ", msg, meta)),
  warn: (msg: string, meta?: Meta) => console.warn(format("WARN ", msg, meta)),
  error: (msg: string, meta?: Meta) => console.error(format("ERROR", msg, meta)),
};
