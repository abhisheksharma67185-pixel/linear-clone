/**
 * All errors thrown inside user-instrumented code are caught and never
 * re-thrown — but internal helper errors may use this class.
 */
export class ThetaObservabilityError extends Error {
  public override readonly cause?: unknown;
  public readonly code: string;

  constructor(message: string, opts: { code?: string; cause?: unknown } = {}) {
    super(message);
    this.name = "ThetaObservabilityError";
    this.code = opts.code ?? "theta_observability_error";
    if (opts.cause !== undefined) this.cause = opts.cause;
  }
}
