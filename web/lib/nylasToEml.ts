import fs from "fs";
import path from "path";

/* ----------  Load exact raw MIME message as base64 ----------------------- */
export async function getMimeEmailBase64(jsonPath: string): Promise<string> {
  const raw = await fs.promises.readFile(jsonPath, "utf8");
  const { data } = JSON.parse(raw);

  let mimeEmail: string | undefined;

  if (data.raw_message) {
    mimeEmail = data.raw_message;
  } else if (data.raw_mime) {
    mimeEmail = Buffer.from(data.raw_mime, "base64").toString("utf8");
  }

  if (!mimeEmail) {
    throw new Error(
      "JSON lacks raw MIME. Refetch with ?include_raw_message=true"
    );
  }

  return Buffer.from(mimeEmail, "utf8").toString("base64");
}

export function getMimeEmailBase64FromRaw(
  rawMimeOrMessage: string,
  isBase64: boolean = true
): string {
  const mimeEmail = isBase64
    ? Buffer.from(rawMimeOrMessage, "base64").toString("utf8")
    : rawMimeOrMessage;

  return Buffer.from(mimeEmail, "utf8").toString("base64");
}
