export const commands = [
    await import("./impl/clearQueue"),
    await import("./impl/createQueue"),
    await import("./impl/getQueue"),
    await import("./impl/register"),
    await import("./impl/void"),
    await import("./impl/score"),
    await import("./impl/scoreGame"),
    await import("./impl/leaderboard"),
    await import("./impl/games"),
    await import("./impl/info"),
    await import("./impl/set"),
    await import("./impl/queue"),
];