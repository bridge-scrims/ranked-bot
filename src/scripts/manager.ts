import dotenv from "dotenv";
dotenv.config();

import { Command } from "commander";

const scripts = [await import("./impl/export"), await import("./impl/import"), await import("./impl/drop")];

const program = new Command("Ranked Bridge | Scripts");
program.version("0.0.1").description("Ranked Bridge scripts manager.");

for (const script of scripts) {
    program
        .command(script.default.name)
        .description(script.default.description)
        .action((...args: any[]) => {
            script.default.action(...args);
        });
}

program.parse(process.argv);
