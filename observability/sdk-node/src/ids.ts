import { ulid } from "ulid";

export function genId(prefix: string): string {
  return `${prefix}_${ulid()}`;
}
