import { getAnalyticsClient, getPerformanceClient, isFirebaseConfigured } from '../config/firebase';

type TelemetryParams = Record<string, string | number | boolean | undefined>;

function cleanParams(params: TelemetryParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export async function trackClientEvent(
  eventName: string,
  params: TelemetryParams = {}
): Promise<void> {
  if (!isFirebaseConfigured) return;

  try {
    const [analytics, analyticsModule] = await Promise.all([
      getAnalyticsClient(),
      import('firebase/analytics'),
    ]);
    if (analytics) analyticsModule.logEvent(analytics, eventName, cleanParams(params));
  } catch {
    // Analytics must never block civic workflows.
  }
}

export async function measureAsync<T>(traceName: string, action: () => Promise<T>): Promise<T> {
  if (!isFirebaseConfigured) return action();

  let traceHandle: { start: () => void; stop: () => void } | null = null;
  try {
    const [performance, performanceModule] = await Promise.all([
      getPerformanceClient(),
      import('firebase/performance'),
    ]);
    if (performance) {
      traceHandle = performanceModule.trace(performance, traceName);
      traceHandle.start();
    }
  } catch {
    traceHandle = null;
  }

  try {
    return await action();
  } finally {
    traceHandle?.stop();
  }
}
