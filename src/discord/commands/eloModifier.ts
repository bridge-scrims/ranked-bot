import { Elo } from "@/util/elo"
import {
    ChatInputCommandInteraction,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js"
import fs from "fs/promises"

const MODIFIER_FILE = "./data/modifier"

export default {
    builder: new SlashCommandBuilder()
        .setName("elo-modifier")
        .setDescription("Edits the ranked elo modifier.")
        .addNumberOption((option) =>
            option
                .setName("modifier")
                .setDescription("The new elo modifier to use. Set to 1 to reset.")
                .setRequired(false),
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions("0"),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const modifier = interaction.options.getNumber("modifier")
        if (modifier === null) {
            return interaction.reply({
                content: `Elo modifier is set at \`${Elo.getModifier() ?? 1}\`.`,
                flags: MessageFlags.Ephemeral,
            })
        }

        await fs.writeFile(MODIFIER_FILE, modifier.toString())
        Elo.setModifier(modifier)

        await interaction.reply({
            content: `Elo modifier set to \`${modifier}\`.`,
            flags: MessageFlags.Ephemeral,
        })
    },
}

fs.readFile(MODIFIER_FILE, "utf-8")
    .then((data) => Elo.setModifier(parseFloat(data)))
    .catch((err) => console.warn(`Failed to load elo modifier: ${err}`))
