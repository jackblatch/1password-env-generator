#!/usr/bin/env node
import {exec} from 'child_process'
import { createSpinner } from 'nanospinner'
import inquirer from 'inquirer';
import { OnePasswordResponse } from './types.js';

const outputOptions = ["1Password reference values","Actual values"]

const itemName = await inquirer.prompt({
        name: 'itemName',
        type: 'input',
        message: "What is the item's name?",
    })

const vaultName = await inquirer.prompt({
        name: 'vaultName',
        type: 'input',
        message: "What vault is this item in?",
    })

const sectionName = await inquirer.prompt({
    name: 'sectionName',
    type: 'input',
    message: "What section is this item in?",
})

const outputPreference = await inquirer.prompt({
        name: 'outputPreference',
        type: "list",
        choices: outputOptions.map(item => item),
        message: "How would you like the output?",
    })

const pwCommand = `op item get ${itemName.itemName} --vault ${vaultName.vaultName} --format=json`;

const execWithPromise = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (err, stout, sterr) => {
      if(err) {
        reject(sterr)
      } else {
        resolve(stout)
      }
    })
  })

const spinner = createSpinner('Fetching entries...\n').start()

let hasEntry;
execWithPromise(pwCommand).then((res) => {
    const parsedData = JSON.parse(res as string) as OnePasswordResponse;
    parsedData.fields.forEach(item => {
        if (item.section && item.section.label === sectionName.sectionName && item.type === "CONCEALED") {
            if (!hasEntry) {
                spinner.success({text: "Entries found!"});
            }
            hasEntry = true;
            if (outputPreference.outputPreference === outputOptions[0]) {
                console.log(`${item.label}="${item.reference}"`)
            } else {
                console.log(`${item.label}=${item.value}`)
            }
        }
    });
    if (!hasEntry) {
        spinner.error({text: "No items found. Please make sure your values are correct and try again."});
        process.exit(1);
    }
    process.exit(0);
  }).catch(() => {
    spinner.error({text: "Oops, no results could be found matching those values. Please make sure your values are correct and try again."});
    process.exit(1);
  })
  