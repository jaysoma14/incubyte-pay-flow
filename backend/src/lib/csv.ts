import type { Response } from "express";

export async function writeCsvRow(
  response: Response,
  values: Array<string | number | Date | null>,
) {
  const row = `${values.map((value) => csvEscape(value === null ? "" : String(value))).join(",")}\r\n`;
  if (response.destroyed || response.writableEnded) {
    return false;
  }
  if (response.write(row)) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const cleanup = () => {
      response.off("drain", onDrain);
      response.off("close", onClose);
    };
    const onDrain = () => {
      cleanup();
      resolve(true);
    };
    const onClose = () => {
      cleanup();
      resolve(false);
    };
    response.once("drain", onDrain);
    response.once("close", onClose);
  });
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
