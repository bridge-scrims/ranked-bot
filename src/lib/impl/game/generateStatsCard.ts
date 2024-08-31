import Jimp from "jimp";
import { join } from "node:path";
import { Player, ScrimsUserData } from "../../../types";

export const generateStatsCard = async (player: Player, scrimsData: ScrimsUserData) => {
    const CANVAS_WIDTH = 3000;
    const CANVAS_HEIGHT = 2000;

    const canvas = new Jimp(CANVAS_WIDTH, CANVAS_HEIGHT, "#333333");

    const fontLargeGray = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE); // You might need a custom gray font if you want exact color match
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    const background = (await Jimp.read(join(import.meta.dir, "../images/background.png"))).resize(CANVAS_WIDTH, CANVAS_HEIGHT);
    const skinRequest = await (await fetch(`https://mc-heads.net/body/${player.mc_uuid}/right`)).arrayBuffer();
    const skin = (await Jimp.read(Buffer.from(skinRequest))).resize(180 * 2.3, 432 * 2.3);

    canvas.composite(background, 0, 0);
    canvas.composite(skin, 450, 500);

    const rectColor = "#141414";
    const rectOpacity = 0.1;
    const rectWidth = 1400;
    const rectHeight = 1275;
    const rectX = 1325;
    const rectY = 500;
    const rectangle = new Jimp(rectWidth, rectHeight, Jimp.cssColorToHex(rectColor));
    rectangle.opacity(rectOpacity);
    canvas.composite(rectangle, rectX, rectY);

    // Draw division icon background circle
    const circleColor = "#141414";
    const circleOpacity = 0.2;
    const circleRadius = 125;
    const circleX = 1550;
    const circleY = 300;
    const circle = new Jimp(circleRadius * 2, circleRadius * 2, Jimp.cssColorToHex(circleColor));
    circle.opacity(circleOpacity);

    // Draw the circle manually by setting pixels
    for (let y = 0; y < circleRadius * 2; y++) {
        for (let x = 0; x < circleRadius * 2; x++) {
            const dx = x - circleRadius;
            const dy = y - circleRadius;
            if (dx * dx + dy * dy <= circleRadius * circleRadius) {
                circle.setPixelColor(Jimp.cssColorToHex(circleColor), x, y);
            }
        }
    }

    canvas.composite(circle, circleX - circleRadius, circleY - circleRadius);

    canvas.print(fontLargeGray, 1420, 1200, "Wins");
    canvas.print(fontLargeGray, 2300, 1200, "Losses");
    canvas.print(fontLargeGray, 2360, 770, "W/L");
    canvas.print(fontLargeGray, 1400, 770, "Games");
    canvas.print(fontLargeGray, 2365, 1700, "WS");
    canvas.print(fontLargeGray, 1400, 1700, "Best WS");

    const name = scrimsData.username; // Replace with the actual player's name
    if (name.length > 9) {
        canvas.print(fontTitle, 100, 350, `${name} `);
    } else {
        canvas.print(fontLargeGray, 100, 361, `${name} `);
    }

    const elo = Math.round(player.elo); // Replace with the actual ELO value
    const eloX = elo < 1000 ? 270 : 170;
    canvas.print(fontTitle, eloX, 1710, elo.toString());
    canvas.print(fontTitle, 700, 1710, "ELO");

    const drawStatText = async (value: number, x: number, y: number, color: string) => {
        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE); // Load white font

        // Create a temporary image to hold the text
        const textImage = new Jimp(300, 200, (err) => {
            if (err) throw err;
        });

        // Print the text onto the temporary image
        textImage.print(
            font,
            0,
            0,
            {
                text: value.toString(),
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            textImage.bitmap.width,
            textImage.bitmap.height,
        );

        // Apply color filter manually
        const hexColor = Jimp.cssColorToHex(color);
        textImage.scan(0, 0, textImage.bitmap.width, textImage.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];

            // If the pixel is white (255, 255, 255) and not transparent
            if (red === 255 && green === 255 && blue === 255 && alpha > 0) {
                this.bitmap.data[idx] = (hexColor >> 24) & 0xff; // Apply red
                this.bitmap.data[idx + 1] = (hexColor >> 16) & 0xff; // Apply green
                this.bitmap.data[idx + 2] = (hexColor >> 8) & 0xff; // Apply blue
            }
        });

        // Composite the colored text onto the main canvas
        canvas.composite(textImage, x, y);
    };

    await drawStatText(player.wins, 1420, 1100, "#70AD47");
    await drawStatText(player.losses, 2340, 1100, "#C00000");
    await drawStatText(Math.trunc(player.wins / player.losses), 2315, 670, "white");
    await drawStatText(/*player.gamesPlayed*/ 30, 1420, 670, "white");
    await drawStatText(player.win_streak, 2340, 1600, "#70AD47");
    await drawStatText(player.best_win_streak, 1420, 1600, "#70AD47");

    return await canvas.getBufferAsync(Jimp.MIME_PNG);
};
