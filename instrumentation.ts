export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runStartupSyncOnce } = await import("@/lib/results/startup-sync");
    await runStartupSyncOnce();
  }
}
