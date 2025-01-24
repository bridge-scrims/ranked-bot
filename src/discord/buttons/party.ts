import { UserError } from "@/lib/discord/UserError"
import { joinParty } from "@/lib/party"
import { ButtonInteraction } from "discord.js"

export default {
    id: "PARTY",
    async execute(interaction: ButtonInteraction<"cached">) {
        switch (interaction.args.shift()) {
            case "join":
                const party = joinParty(interaction.user, interaction.args.shift()!)
                if (party === null) {
                    throw new UserError("This party no longer exists.")
                }

                return "You have successfully joined the party."
        }
    },
}
