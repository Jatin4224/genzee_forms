import { z } from "zod";

/**
 * Input schema for procedures that take no arguments. tRPC still wants an
 * .input() call so the OpenAPI generator knows the body is intentionally empty.
 */
export const zodUndefinedModel = z.undefined().describe("undefined");
export { z };
