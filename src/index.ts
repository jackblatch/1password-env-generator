#!/usr/bin/env node
import { exec } from "child_process";
import { createSpinner } from "nanospinner";
import inquirer from "inquirer";
import { OnePasswordResponse } from "./types.js";

const execWithPromise = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (err, stout, sterr) => {
      if (err) {
        reject(sterr);
      } else {
        resolve(stout);
      }
    });
  });

const getRunCommand = async () => {
  let envFileName: {
    envFileName: string;
  };
  envFileName = await inquirer.prompt({
    name: "envFileName",
    type: "list",
    choices: [".env", ".env.local", "Something else"],
    message: "What is the name of the env file?",
  });

  if (envFileName.envFileName === "Something else") {
    envFileName = await inquirer.prompt({
      name: "envFileName",
      type: "input",
      message: "Specify the name of the env file:",
    });
  }

  let devCommand: {
    devCommand: string;
  };

  devCommand = await inquirer.prompt({
    name: "devCommand",
    type: "list",
    choices: ["npm run dev", "pnpm dev", "Something else"],
    message: "What's the command to run your app?",
  });

  if (devCommand.devCommand === "Something else") {
    devCommand = await inquirer.prompt({
      name: "devCommand",
      type: "input",
      message: "Specify the command to run your app:",
    });
  }

  console.log(
    `\n op run --no-masking --env-file="${envFileName.envFileName}" -- ${devCommand.devCommand} \n`
  );
};

const outputOptions = ["1Password reference values", "Actual values"];

if (process.argv.includes("--run")) {
  await getRunCommand();
  process.exit(0);
} else {
  const itemName = await inquirer.prompt({
    name: "itemName",
    type: "input",
    default: "env_variables",
    message: "What is the item's name?",
  });

  const vaultName = await inquirer.prompt({
    name: "vaultName",
    type: "input",
    default: "Development",
    message: "What vault is this item in?",
  });

  const sectionName = await inquirer.prompt({
    name: "sectionName",
    type: "input",
    message: "What section is this item in?",
  });

  const outputPreference = await inquirer.prompt({
    name: "outputPreference",
    type: "list",
    choices: outputOptions.map((item) => item),
    message: "How would you like the output?",
  });

  const pwCommand = `op item get ${itemName.itemName} --vault ${vaultName.vaultName} --format=json`;

  const spinner = createSpinner("Fetching entries...\n").start();

  let hasEntry: boolean = false;
  execWithPromise(pwCommand)
    .then(async (res) => {
      const parsedData = JSON.parse(res as string) as OnePasswordResponse;
      parsedData.fields.forEach((item) => {
        if (
          item.section &&
          item.section.label === sectionName.sectionName &&
          item.type === "CONCEALED"
        ) {
          if (!hasEntry) {
            console.log("\n");
            spinner.success({
              text: "Entries found! Copy the following value(s) into your env file: \n",
            });
          }
          hasEntry = true;
          if (outputPreference.outputPreference === outputOptions[0]) {
            console.log(`${item.label}="${item.reference}"`);
          } else {
            console.log(`${item.label}=${item.value}`);
          }
        }
      });
      if (!hasEntry) {
        spinner.error({
          text: "No items found. Please make sure your values are correct and try again.",
        });
        process.exit(1);
      }
      if (outputPreference.outputPreference === outputOptions[0]) {
        console.log("\n");
        const shouldGetRunCommand = await inquirer.prompt({
          name: "shouldGetRunCommand",
          type: "list",
          choices: ["Yes", "No"],
          message: "Would you like to get the run command?",
        });

        if (shouldGetRunCommand.shouldGetRunCommand === "Yes") {
          await getRunCommand();
        }
        process.exit(0);
      }
      console.log("\n");
    })
    .catch(() => {
      spinner.error({
        text: "Oops, no results could be found matching those values. Please make sure your values are correct and try again.",
      });
      process.exit(1);
    });
}
