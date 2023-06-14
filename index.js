#!/usr/bin/env node
import {exec} from 'child_process'
import inquirer from 'inquirer';

const outputOptions = [
    {
        id: 1,
        name: "1Password reference values",
    },
    {
        id: 2,
        name: "Actual values",
    },
]

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
        choices: outputOptions.map(item => item.name),
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

execWithPromise(pwCommand).then(res => {
    const parsedData = JSON.parse(res);
    parsedData.fields.forEach(item => {
        if (item.section && item.section.label === sectionName.sectionName) {
            if (outputPreference.outputPreference === outputOptions[0].name) {
                console.log(`${item.label}="${item.reference}"`)
            } else {
                console.log(`${item.label}=${item.value}`)
            }
        }
    });
  }).catch(() => {
    console.log("Oops, an error occured. Please make sure your values are correct and try again.")
  })
  