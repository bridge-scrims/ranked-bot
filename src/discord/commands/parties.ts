import { InteractionHandler } from "@/lib/discord/InteractionHandler"
import { PartyHandler } from "@/lib/party"
import { LEADER_ALREADY_IN_PARTY } from "@/lib/party/constants"
import { ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandType, InteractionContextType, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js"

export default (handler: InteractionHandler) => {
    handler.addCommands(
        {
            builder: new SlashCommandBuilder()
                .setName("party-create")
                .setDescription("Create a party")
                .addUserOption(option => 
                    option.setName('user1')
                    .setDescription('First user to be invited')
                    .setRequired(false)
                )
                .addUserOption(option => 
                    option.setName('user2')
                    .setDescription('Second user to be invited')
                    .setRequired(false)
                )
                .setContexts(InteractionContextType.Guild),

                async execute(interaction: ChatInputCommandInteraction) {
                    const leader = interaction.user;
                
                    const players = [
                        interaction.options.getUser("user1"),
                        interaction.options.getUser("user2")
                    ].filter(user => user !== null)
                      .map(user => user);
                
                    const result = await PartyHandler.createParty(leader, ...players);
                    if (result == LEADER_ALREADY_IN_PARTY) {
                        interaction.reply("You are already in a party!");
                    } else if (result == 0) {
                        const playerNames = players.map(player => player.username).join(" and ");
                        interaction.reply(`Successfully created party with ${playerNames}`);
                    }
                },
        },
    )
}