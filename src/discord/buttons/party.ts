import { MessageOptionsBuilder } from "@/lib/discord/MessageOptionsBuilder"
import { UserError } from "@/lib/discord/UserError"
import { Party } from "@/lib/party"
import { ButtonInteraction, MessageFlags } from "discord.js"

export default {
    id: "PARTY",
    async execute(interaction: ButtonInteraction<"cached">) {
        switch (interaction.args.shift()) {
            case "join": {
                if (await Party.get(interaction.user.id)) {
                    throw new UserError("You are already in a party.")
                }

                const party = await Party.getInvite(interaction.args.shift()!)
                if (!party) {
                    interaction.message.delete().catch(() => null)
                    throw new UserError("This party no longer exists.")
                }

                if (!party.addMember(interaction.user)) {
                    throw new UserError("You haven't been invited to this party.")
                }

                const embed = party.getEmbed(
                    "Invitation Accepted",
                    "You have accepted the party invitation.",
                    party.leader,
                )

                const message = new MessageOptionsBuilder().addEmbeds(embed)
                if (interaction.channel?.isDMBased()) {
                    await interaction.update(message)
                } else {
                    interaction.message.delete().catch(() => null)
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                    return message
                }
            }
        }
    },
}
