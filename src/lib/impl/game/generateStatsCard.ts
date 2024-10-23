import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { writeFile } from "node:fs";
import { Player, ScrimsUserData } from "../../../types";
import { exists, mkdir } from "node:fs/promises";
import { getGamesPlayed } from "../../../database/impl/games/impl/get";

export const generateStatsCard = async (player: Player, scrimsData: ScrimsUserData) => {
    const { elo, win_streak, best_win_streak, wins, losses } = player;
    const gamesPlayed = await getGamesPlayed(player.guild_id, player.user_id);

    const wl = losses === 0 || isNaN(wins / losses) ? wins.toString() : (wins / losses).toFixed(2);

    try {
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Comfortaa.ttf"), "Comfortaa");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/SourceSans3.ttf"), "SourceSans");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Hubballi.ttf"), "Hubballi");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Audiowide.ttf"), "Audiowide");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Baloo2.ttf"), "Baloo2");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Oxanium.ttf"), "Oxanium");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Oxanium-Bold.ttf"), "OxaniumBold");
        GlobalFonts.registerFromPath(join(import.meta.dir, "../fonts/Rajdhani.ttf"), "Rajdhani");

        const canvas = createCanvas(3000, 2000);
        const ctx = canvas.getContext("2d");

        const background = await loadImage(join(import.meta.dir, "../images/background.png"));
        const avatar = await loadImage(`https://mc-heads.net/body/${player.mc_uuid}/right`);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar, 450, 500, 180 * 2.3, 432 * 2.3);

        // Base text
        ctx.globalAlpha = 1;
        ctx.font = '100px "SourceSans"';
        ctx.fillStyle = "#666666";
        ctx.fillText("Wins", 1420, 1200);
        ctx.fillText("Losses", 2300, 1200);
        ctx.fillText("W/L", 2360, 770);
        ctx.fillText("Games", 1400, 770);
        ctx.fillText("WS", 2365, 1700);
        ctx.fillText("Best WS", 1400, 1700);

        // Background box
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#141414";
        ctx.fillRect(1325, 500, 1400, 1275);

        // Draw division icon background circle
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = "#141414";
        ctx.beginPath();
        ctx.arc(1550, 300, 125, 0 * Math.PI, 4 * Math.PI);
        ctx.fill();

        ctx.globalAlpha = 1;

        // IGN of the user
        ctx.fillStyle = "#66fff5";

        if (scrimsData.username.length > 9) {
            ctx.font = '150px "Rajdhani"';
            ctx.fillText(scrimsData.username + " ", 100, 350);
        } else {
            ctx.font = '200px "Rajdhani"';
            ctx.fillText(scrimsData.username + " ", 100, 361);
        }

        ctx.globalAlpha = 1;
        // ELO text
        ctx.font = '195px "Oxanium"';
        ctx.fillStyle = "#4cad59";
        if (elo < 1000) {
            ctx.fillText(String(Math.round(elo)), 270, 1710);
            ctx.fillStyle = "white";
            ctx.fillText("ELO", 700, 1710);
        } else {
            ctx.fillText(String(Math.round(elo)), 170, 1710);
            ctx.fillStyle = "white";
            ctx.fillText("ELO", 700, 1710);
        }

        // Wins
        ctx.font = '195px "OxaniumBold"';
        ctx.fillStyle = "#70AD47";
        if (wins > 9 && wins < 99) {
            ctx.fillText(String(wins), 1420, 1100);
        } else if (wins > 99) {
            ctx.fillText(String(wins), 1370, 1100);
        } else {
            ctx.fillText(String(wins), 1480, 1100);
        }

        // Losses
        ctx.fillStyle = "#C00000";
        if (losses > 9 && losses < 99) {
            ctx.fillText(String(losses), 2340, 1100);
        } else if (losses > 99) {
            ctx.fillText(String(losses), 2305, 1100);
        } else {
            ctx.fillText(String(losses), 2395, 1100);
        }

        // W/L
        ctx.fillStyle = "white";
        if (wl.toString().length < 2) {
            ctx.fillText(wl + ".0", 2315, 670);
        } else if (wl.toString().length === 3) {
            ctx.fillText(wl, 2315, 670);
        } else if (wl.toString().length === 2) {
            ctx.fillText(wl + ".0", 2300, 670);
        } else {
            ctx.fillText(wl, 2300, 670);
        }

        // Games played
        if (gamesPlayed > 9 && gamesPlayed < 99) {
            ctx.fillText(gamesPlayed.toString(), 1420, 670);
        } else if (gamesPlayed > 99) {
            ctx.fillText(gamesPlayed.toString(), 1370, 670);
        } else {
            ctx.fillText(gamesPlayed.toString(), 1480, 670);
        }

        // Winstreak
        ctx.fillStyle = "#70AD47";
        if (win_streak > 9 && win_streak < 99) {
            ctx.fillText(String(win_streak), 2340, 1600);
        } else if (wins > 99) {
            ctx.fillText(String(win_streak), 2305, 1600);
        } else {
            if (win_streak === 4) {
                ctx.fillText(String(win_streak), 2400, 1600);
            } else {
                ctx.fillText(String(win_streak), 2390, 1600);
            }
        }

        // Best winstreak
        if (best_win_streak > 9 && best_win_streak < 99) {
            ctx.fillText(String(best_win_streak), 1420, 1600);
        } else if (wins > 99) {
            ctx.fillText(String(best_win_streak), 1370, 1600);
        } else {
            ctx.fillText(String(best_win_streak), 1480, 1600);
        }

        const buffer = canvas.toBuffer("image/png");

        await saveImage(scrimsData.username, buffer);

        return buffer;
    } catch (error) {
        console.error("Error generating scorecard:", error);
        return null;
    }
};

export const saveImage = async (username: string, buffer: Buffer): Promise<void> => {
    const outputPath = join(import.meta.dir, "../output", "profiles", `${username}.png`);

    if (!(await exists(join(import.meta.dir, "../output", "profiles")))) {
        await mkdir(join(import.meta.dir, "../output", "profiles"), { recursive: true });
    }

    return new Promise((resolve, reject) => {
        writeFile(outputPath, buffer as any, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};
