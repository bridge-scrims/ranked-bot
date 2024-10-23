import Jimp from "jimp";
import { join } from "node:path";
import { Player, ScrimsUserData } from "../../../types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const BACKGROUND_COLOR = 0x808080ff;
const TRANSLUCENT_BG = 0x00000080;

export const generateStatsCard = async (player: Player, scrimsData: ScrimsUserData) => {
    // Create canvas
    const canvas = new Jimp(CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_COLOR);

    // Load fonts
    const fontLarge = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontMedium = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_8_WHITE);

    // Load background image
    const background = await Jimp.read(join(import.meta.dir, "../images/background.png"));
    background.resize(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.composite(background, 0, 0);

    // Load and place player skin
    const skinRequest = await (await fetch(`https://mc-heads.net/body/${player.mc_uuid}/right`)).arrayBuffer();
    const skin = await Jimp.read(Buffer.from(skinRequest));
    //skin.resize(100, 200);
    canvas.composite(skin, 20, 20);

    // Add translucent overlays
    const overlay = new Jimp(220, 60, TRANSLUCENT_BG);
    canvas.composite(overlay, 10, 0);
    canvas.composite(overlay, 10, 70);

    // Add name
    canvas.print(fontLarge, 100, 10, scrimsData.username);

    // Add ELO and rank
    canvas.print(fontMedium, 50, 90, `${player.elo} ELO`);
    canvas.print(fontMedium, 150, 90, `#${1}`);

    // Add stats
    const statsOverlay = new Jimp(300, 120, TRANSLUCENT_BG);
    canvas.composite(statsOverlay, 480, 40);

    canvas.print(fontSmall, 500, 50, "GAME STATS");
    canvas.print(fontMedium, 500, 60, `${10} Games`);
    canvas.print(fontMedium, 500, 80, `${player.wins} Wins`);
    canvas.print(fontMedium, 500, 100, `${player.losses} Losses`);
    canvas.print(fontMedium, 650, 60, `${player.wins / player.losses} W/L`);

    // Add winstreaks
    const winstreakOverlay = new Jimp(300, 80, TRANSLUCENT_BG);
    canvas.composite(winstreakOverlay, 480, 170);

    canvas.print(fontSmall, 500, 180, "WINSTREAKS");
    canvas.print(fontMedium, 500, 200, `${player.win_streak} Win Streak`);
    canvas.print(fontMedium, 650, 200, `${player.best_win_streak} Best Winstreak`);

    // Add PVP stats
    const pvpOverlay = new Jimp(300, 100, TRANSLUCENT_BG);
    canvas.composite(pvpOverlay, 480, 260);

    canvas.print(fontSmall, 500, 270, "PVP");
    canvas.print(fontMedium, 500, 290, `${10} Kills`);
    canvas.print(fontMedium, 500, 310, `${12} Deaths`);
    canvas.print(fontMedium, 650, 290, `${0.8} K/D`);

    // Add game name and URL
    canvas.print(fontMedium, 20, 360, "RANKED BRIDGE");
    canvas.print(fontSmall, 20, 380, ".GG/RANKEDBRIDGE");

    // Save or return the image
    return await canvas.getBufferAsync(Jimp.MIME_PNG);
};
