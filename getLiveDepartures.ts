const DEFAULT_STATION_ID = "8000107";
const DEFAULT_DURATION_MINUTES = 30;
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;
const RETRY_BACKOFF_MS = 350;
const UNKNOWN_LINE_NAME = "Unknown";

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const departureCache = new Map<string, { expiresAt: number; data: FormattedDeparture[] }>();

export interface DepartureApiLine {
  name?: string | null;
}

export interface DepartureApiItem {
  when?: string | null;
  plannedWhen?: string | null;
  delay?: number | null;
  cancelled?: boolean | null;
  direction?: string | null;
  line?: DepartureApiLine | null;
}

export interface FormattedDeparture {
  stationId: string;
  line: string;
  direction: string;
  time: string;
  delayMinutes: number | null;
  isOnTime: boolean;
  isCancelled: boolean;
  status: "on_time" | "delayed" | "cancelled" | "unknown";
  rawIsoTime: string;
}

export interface LiveDeparturesErrorState {
  code: "NETWORK" | "TIMEOUT" | "API" | "INVALID_RESPONSE";
  message: string;
  stationId: string;
  cause?: unknown;
  status?: number;
}

export interface GetLiveDeparturesOptions {
  durationMinutes?: number;
  timeoutMs?: number;
  retries?: number;
  cacheTtlMs?: number;
  includeCancelled?: boolean;
  sortByTime?: boolean;
}

function asObject(value: unknown): object | null {
  return typeof value === "object" && value !== null ? value : null;
}

function readProperty(source: object, key: string): unknown {
  return Reflect.get(source, key);
}

function pruneExpiredCacheEntries(now: number): void {
  for (const [key, entry] of departureCache.entries()) {
    if (entry.expiresAt <= now) {
      departureCache.delete(key);
    }
  }
}

function toErrorState(input: {
  code: LiveDeparturesErrorState["code"];
  message: string;
  stationId: string;
  cause?: unknown;
  status?: number;
}): LiveDeparturesErrorState {
  return {
    code: input.code,
    message: input.message,
    stationId: input.stationId,
    cause: input.cause,
    status: input.status,
  };
}

function isTransientHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function parseIsoTime(raw: unknown): Date | null {
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDeparture(stationId: string, rawItem: unknown): FormattedDeparture | null {
  const item = asObject(rawItem);
  if (!item) {
    return null;
  }

  const actualTime = parseIsoTime(readProperty(item, "when"));
  const plannedTime = parseIsoTime(readProperty(item, "plannedWhen"));
  const referenceTime = actualTime ?? plannedTime;
  if (!referenceTime) {
    return null;
  }

  const delayValue = readProperty(item, "delay");
  const delaySeconds = typeof delayValue === "number" && Number.isFinite(delayValue) ? delayValue : null;
  const delayMinutes = delaySeconds === null ? null : Math.round(delaySeconds / 60);
  const isCancelled = readProperty(item, "cancelled") === true;

  const lineRecord = asObject(readProperty(item, "line"));
  const lineName = lineRecord ? readProperty(lineRecord, "name") : undefined;
  const line = typeof lineName === "string" && lineName.trim() ? lineName.trim() : UNKNOWN_LINE_NAME;
  const directionValue = readProperty(item, "direction");
  const direction = typeof directionValue === "string" && directionValue.trim() ? directionValue.trim() : "Unknown";

  const status: FormattedDeparture["status"] = isCancelled
    ? "cancelled"
    : delayMinutes === null
      ? "unknown"
      : delayMinutes > 0
        ? "delayed"
        : "on_time";

  return {
    stationId,
    line,
    direction,
    time: timeFormatter.format(referenceTime),
    delayMinutes,
    isOnTime: !isCancelled && delayMinutes !== null && delayMinutes <= 0,
    isCancelled,
    status,
    rawIsoTime: referenceTime.toISOString(),
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStationDepartures(
  stationId: string,
  options: Required<Pick<GetLiveDeparturesOptions, "durationMinutes" | "timeoutMs" | "retries">>,
): Promise<unknown[]> {
  let attempt = 0;
  let latestError: LiveDeparturesErrorState | null = null;

  while (attempt <= options.retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const url = new URL(`https://v6.db.transport.rest/stops/${encodeURIComponent(stationId)}/departures`);
      url.searchParams.set("duration", String(options.durationMinutes));

      const response = await fetch(url.toString(), {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorState = toErrorState({
          code: "API",
          message: `Departure API responded with ${response.status} ${response.statusText}`,
          stationId,
          status: response.status,
        });

        if (attempt < options.retries && isTransientHttpStatus(response.status)) {
          latestError = errorState;
          attempt += 1;
          await sleep(RETRY_BACKOFF_MS * attempt);
          continue;
        }

        throw Object.assign(new Error(errorState.message), { details: errorState });
      }

      const data: unknown = await response.json();
      const directDepartures = Array.isArray(data) ? data : null;
      const dataObject = directDepartures ? null : asObject(data);
      const departuresValue = dataObject ? readProperty(dataObject, "departures") : undefined;
      const nestedDepartures = Array.isArray(departuresValue) ? departuresValue : null;
      const departures = directDepartures ?? nestedDepartures;

      if (!departures) {
        const errorState = toErrorState({
          code: "INVALID_RESPONSE",
          message: "Departure API returned an unexpected payload shape",
          stationId,
        });
        throw Object.assign(new Error(errorState.message), { details: errorState });
      }

      return departures;
    } catch (error) {
      const errorObject = asObject(error);
      if (errorObject && asObject(readProperty(errorObject, "details"))) {
        throw error;
      }

      const isAbortError = (error instanceof DOMException && error.name === "AbortError")
        || (error instanceof Error && error.name === "AbortError");
      latestError = toErrorState({
        code: isAbortError ? "TIMEOUT" : "NETWORK",
        message: isAbortError
          ? `Departure request timed out after ${options.timeoutMs}ms`
          : "Network error while requesting live departures",
        stationId,
        cause: error,
      });

      if (attempt < options.retries) {
        attempt += 1;
        await sleep(RETRY_BACKOFF_MS * attempt);
        continue;
      }

      throw Object.assign(new Error(latestError.message), { details: latestError });
    } finally {
      clearTimeout(timer);
    }
  }

  throw Object.assign(new Error("Unexpected departure fetch loop exit"), {
    details: latestError ?? toErrorState({
      code: "NETWORK",
      message: "Unknown error while requesting departures",
      stationId,
    }),
  });
}

/**
 * Fetches and normalizes live departures from the DB transport REST API.
 * Returns an empty list when requests fail so callers can degrade gracefully.
 */
export async function getLiveDepartures(
  stationId: string | string[] = DEFAULT_STATION_ID,
  options: GetLiveDeparturesOptions = {},
): Promise<FormattedDeparture[]> {
  const stationIds = (Array.isArray(stationId) ? stationId : [stationId]).filter(
    (id): id is string => typeof id === "string" && id.trim().length > 0,
  );

  if (stationIds.length === 0) {
    return [];
  }

  const mergedOptions = {
    durationMinutes: Math.max(1, Math.floor(options.durationMinutes ?? DEFAULT_DURATION_MINUTES)),
    timeoutMs: Math.max(1000, Math.floor(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)),
    retries: Math.max(0, Math.floor(options.retries ?? DEFAULT_RETRIES)),
    cacheTtlMs: Math.max(0, Math.floor(options.cacheTtlMs ?? 0)),
    includeCancelled: options.includeCancelled ?? true,
    sortByTime: options.sortByTime ?? true,
  };

  const cacheKey = `${stationIds.join(",")}:${mergedOptions.durationMinutes}:${mergedOptions.includeCancelled}:${mergedOptions.sortByTime}:${mergedOptions.cacheTtlMs}`;
  const now = Date.now();
  if (mergedOptions.cacheTtlMs > 0) {
    const cached = departureCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }
  }

  try {
    const stationResults = await Promise.allSettled(
      stationIds.map((id) =>
        fetchStationDepartures(id, {
          durationMinutes: mergedOptions.durationMinutes,
          timeoutMs: mergedOptions.timeoutMs,
          retries: mergedOptions.retries,
        }),
      ),
    );

    let formatted = stationResults.flatMap((stationResult, stationIndex) => {
      const id = stationIds[stationIndex];
      if (!id) {
        return [];
      }
      if (stationResult.status === "rejected") {
        console.error("getLiveDepartures failed for station", {
          stationId: id,
          error: stationResult.reason,
        });
        return [];
      }

      return stationResult.value
        .map((item) => normalizeDeparture(id, item))
        .filter((item): item is FormattedDeparture => item !== null);
    });

    if (!mergedOptions.includeCancelled) {
      formatted = formatted.filter((departure) => !departure.isCancelled);
    }

    if (mergedOptions.sortByTime) {
      formatted = formatted.sort((a, b) => Date.parse(a.rawIsoTime) - Date.parse(b.rawIsoTime));
    }

    if (mergedOptions.cacheTtlMs > 0) {
      pruneExpiredCacheEntries(now);
      departureCache.set(cacheKey, {
        expiresAt: now + mergedOptions.cacheTtlMs,
        data: formatted,
      });
    }

    return formatted;
  } catch (error) {
    const errorObject = asObject(error);
    const detailsValue = errorObject ? readProperty(errorObject, "details") : undefined;
    const details = asObject(detailsValue);

    console.error("getLiveDepartures failed", {
      stationIds,
      error: details ?? error,
    });

    return [];
  }
}
