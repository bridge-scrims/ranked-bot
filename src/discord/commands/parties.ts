import { InteractionHandler } from "@/lib/discord/InteractionHandler"
import { PartyHandler } from "@/lib/party"
import { LEADER_ALREADY_IN_PARTY, NO_PARTY_FOUND, NOT_IN_A_PARTY } from "@/lib/party/constants"
import { ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandType, InteractionContextType, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js"

export default (handler: InteractionHandler) => {
    handler.addCommands(
        {
            builder: new SlashCommandBuilder()
                .setName("party")
                .setDescription("All party related commands")
                .addSubcommand(subcommand =>
                    subcommand
                    .setName("create")
                    .setDescription("Create a party!")
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
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName("leave")
                    .setDescription("Leave a party")
                )
                .setContexts(InteractionContextType.Guild),

                async execute(interaction: ChatInputCommandInteraction) {
                    if (!interaction.isChatInputCommand()) return;

                    const subcommand = interaction.options.getSubcommand();
                    
                    if (subcommand === "create") {
                        const leader = interaction.user;
                    
                        const players = [
                            interaction.options.getUser("user1"),
                            interaction.options.getUser("user2"),
                        ]
                            .filter(user => user !== null)
                            .map(user => user);
                    
                        const result = await PartyHandler.createParty(leader, ...players);
                        if (result === LEADER_ALREADY_IN_PARTY) {
                            await interaction.reply({content:"You are already in a party!", ephemeral:true});
                        } else if (result === 0) {
                            const playerNames = players.map(player => player.username).join(" and ");
                            await interaction.reply({content:`Successfully created party with ${playerNames}`, ephemeral:true});
                        }
                    } else if (subcommand === "leave") {
                        const result = PartyHandler.leaveParty(interaction.user)
                        if (result == NOT_IN_A_PARTY) {
                            await interaction.reply("You aren't in a party!")
                        } else if (result == 0 || result == NO_PARTY_FOUND) {
                            await interaction.reply("Left party!")
                        }
                    }
                },
        },
    )
}