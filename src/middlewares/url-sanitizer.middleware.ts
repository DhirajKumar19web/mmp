import type { NextFunction, Request, Response } from "express";

/**
 * Enterprise URL Sanitizer Middleware
 * Cleans incoming request URLs by stripping accidental trailing whitespace,
 * URL-encoded spaces (%20), and normalizing accidental trailing slashes.
 */
export const urlSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.url) {
    let sanitizedUrl = req.url.trim();

    while (sanitizedUrl.endsWith("%20") || sanitizedUrl.endsWith(" ")) {
      if (sanitizedUrl.endsWith("%20")) {
        sanitizedUrl = sanitizedUrl.slice(0, -3).trim();
      } else {
        sanitizedUrl = sanitizedUrl.trimEnd();
      }
    }

    req.url = sanitizedUrl;
  }
  next();
};

export default urlSanitizer;
