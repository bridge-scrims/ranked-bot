import { Party } from "@/lib/party"
import { ButtonInteraction, MessageFlags } from "discord.js"

export default {
    id: "PARTY",
    execute(interaction: ButtonInteraction<"cached">) {
        switch (interaction.args.shift()) {
            case "join": {
                const existingParty = Party.get(interaction.user.id)
                if (existingParty) {
                    return interaction.reply({
                        flags: MessageFlags.Ephemeral,
                        content: "You are already in a party.",
                    })
                }

                const party = Party.join(interaction.user, interaction.args.shift()!)
                const embed = party.getEmbed(
                    "Invitation Accepted",
                    "You have accepted the party invitation.",
                    party.leader,
                )

                interaction.update({ embeds: [embed], components: [] })
            }
        }
    },
}
