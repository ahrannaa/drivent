import { ApplicationError } from "@/protocols";

export function notFoundError(message?: string): ApplicationError {
  const incomingMessage = message || "No result for this search!";
  return {
    name: "NotFoundError",
    message: incomingMessage,
  };
}
