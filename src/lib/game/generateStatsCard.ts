import { type Player } from "@/database"
import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas"
import type { ScrimsUser } from "../minecraft/scrims/user"

GlobalFonts.registerFromPath("assets/fonts/Comfortaa.ttf", "Comfortaa")
GlobalFonts.registerFromPath("assets/fonts/SourceSans3.ttf", "SourceSans")
GlobalFonts.registerFromPath("assets/fonts/Hubballi.ttf", "Hubballi")
GlobalFonts.registerFromPath("assets/fonts/Audiowide.ttf", "Audiowide")
GlobalFonts.registerFromPath("assets/fonts/Baloo2.ttf", "Baloo2")
GlobalFonts.registerFromPath("assets/fonts/Oxanium.ttf", "Oxanium")
GlobalFonts.registerFromPath("assets/fonts/Oxanium-Bold.ttf", "OxaniumBold")
GlobalFonts.registerFromPath("assets/fonts/Rajdhani.ttf", "Rajdhani")

const bgPromise = loadImage("assets/images/background.png")

export async function generateStatsCard(player: Player, user: ScrimsUser) {
    const { elo, winStreak, bestWinStreak, wins, losses, draws } = player.getRankedStats()
    const gamesPlayed = wins + losses + draws
    const wl = losses === 0 ? wins.toString() : (wins / losses).toFixed(2)

    const canvas = createCanvas(3000, 2000)
    const ctx = canvas.getContext("2d")

    const [background, avatar] = await Promise.all([
        bgPromise,
        loadImage(`https://mc-heads.net/body/${user._id}/right`),
    ])

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(avatar, 450, 500, 180 * 2.3, 432 * 2.3)

    // Base text
    // Base text
    ctx["globalAlpha"] = 1
    ctx["font"] = '100px "SourceSans"'
    ctx["fillStyle"] = "#666666"
    ctx["fillText"]("Wins", 1420, 1200)
    ctx["fillText"]("Losses", 2300, 1200)
    ctx["fillText"]("W/L", 2360, 770)
    ctx["fillText"]("Games", 1400, 770)
    ctx["fillText"]("WS", 2365, 1700)
    ctx["fillText"]("Best WS", 1400, 1700)

    // Background box
    // Background box
    ctx["globalAlpha"] = 0.1
    ctx["fillStyle"] = "#141414"
    ctx["fillRect"](1325, 500, 1400, 1275)

    // Draw division icon background circle
    // Draw division icon background circle
    ctx["globalAlpha"] = 0.2
    ctx["strokeStyle"] = "#141414"
    ctx["beginPath"]()
    ctx["arc"](1550, 300, 125, 0 * Math.PI, 4 * Math.PI)
    ctx["fill"]()

    ctx["globalAlpha"] = 1

    // IGN of the user
    // IGN of the user
    ctx["fillStyle"] = "#66fff5"

    if (user.username.length > 9) {
        ctx["font"] = '150px "Rajdhani"'
        ctx["fillText"](user.username + " ", 100, 350)
    } else {
        ctx["font"] = '200px "Rajdhani"'
        ctx["fillText"](user.username + " ", 100, 361)
    }

    ctx["globalAlpha"] = 1
    // ELO text
    // ELO text
    ctx["font"] = '195px "Oxanium"'
    ctx["fillStyle"] = "#4cad59"
    if (elo < 1000) {
        ctx["fillText"](String(elo), 270, 1710)
        ctx["fillStyle"] = "white"
        ctx["fillText"]("ELO", 700, 1710)
    } else {
        ctx["fillText"](String(elo), 170, 1710)
        ctx["fillStyle"] = "white"
        ctx["fillText"]("ELO", 700, 1710)
    }

    // Wins
    // Wins
    ctx["font"] = '195px "OxaniumBold"'
    ctx["fillStyle"] = "#70AD47"
    if (wins > 9 && wins < 99) {
        ctx["fillText"](String(wins), 1420, 1100)
    } else if (wins > 99) {
        ctx["fillText"](String(wins), 1370, 1100)
    } else {
        ctx["fillText"](String(wins), 1480, 1100)
    }

    // Losses
    // Losses
    ctx["fillStyle"] = "#C00000"
    if (losses > 9 && losses < 99) {
        ctx["fillText"](String(losses), 2340, 1100)
    } else if (losses > 99) {
        ctx["fillText"](String(losses), 2305, 1100)
    } else {
        ctx["fillText"](String(losses), 2395, 1100)
    }

    // W/L
    // W/L
    ctx["fillStyle"] = "white"
    if (wl.toString().length < 2) {
        ctx["fillText"](wl + ".0", 2315, 670)
    } else if (wl.toString().length === 3) {
        ctx["fillText"](wl, 2315, 670)
    } else if (wl.toString().length === 2) {
        ctx["fillText"](wl + ".0", 2300, 670)
    } else {
        ctx["fillText"](wl, 2300, 670)
    }

    // Games played
    if (gamesPlayed > 9 && gamesPlayed < 99) {
        ctx["fillText"](gamesPlayed.toString(), 1420, 670)
    } else if (gamesPlayed > 99) {
        ctx["fillText"](gamesPlayed.toString(), 1370, 670)
    } else {
        ctx["fillText"](gamesPlayed.toString(), 1480, 670)
    }

    // Winstreak
    // Winstreak
    ctx["fillStyle"] = "#70AD47"
    if (winStreak > 9 && winStreak < 99) {
        ctx["fillText"](String(winStreak), 2340, 1600)
    } else if (wins > 99) {
        ctx["fillText"](String(winStreak), 2305, 1600)
    } else {
        if (winStreak === 4) {
            ctx["fillText"](String(winStreak), 2400, 1600)
        } else {
            ctx["fillText"](String(winStreak), 2390, 1600)
        }
    }

    // Best winstreak
    if (bestWinStreak > 9 && bestWinStreak < 99) {
        ctx["fillText"](String(bestWinStreak), 1420, 1600)
    } else if (wins > 99) {
        ctx["fillText"](String(bestWinStreak), 1370, 1600)
    } else {
        ctx["fillText"](String(bestWinStreak), 1480, 1600)
    }

    return canvas.toBuffer("image/png")
}
