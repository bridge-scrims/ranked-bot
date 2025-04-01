import { MessageOptionsBuilder } from "@/lib/discord/MessageOptionsBuilder"
import { UserError } from "@/lib/discord/UserError"
import { Party } from "@/lib/party"
import { ButtonInteraction } from "discord.js"

export default {
    id: "PARTY",
    async execute(interaction: ButtonInteraction<"cached">) {
        switch (interaction.args.shift()) {
            case "join": {
                if (Party.get(interaction.user.id)) {
                    throw new UserError("You are already in a party.")
                }

                const party = Party.join(interaction.user, interaction.args.shift()!)
                const embed = party.getEmbed(
                    "Invitation Accepted",
                    "You have accepted the party invitation.",
                    party.leader,
                )

                return interaction.update(new MessageOptionsBuilder().addEmbeds(embed))
            }
        }
    },
}
