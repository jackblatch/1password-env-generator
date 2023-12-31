# 1Password .env Generator

Quickly and easily generate your .env file from credentials stored in 1Password.

## About

This script is designed to be used with the 1Password CLI. The generator will ask you a few questions about the item you want to use, and then generate formatted .env key/value pairs for you.

## Requirements

To use this package, the 1Password CLI must be installed on your device and logged in.

## Running the script

To run the script simply enter `npx 1p-env` in your terminal.

Example CLI output:

```
? What is the item's name? env_variables
? What vault is this item in? Dev
? What section is this item in? demo-app
? How would you like the output? 1Password reference values

✔ Entries found! Copy the following value(s) into your env file:

DB_URL="op://Dev/env_variables/demo-app/DB_URL"
DB_USER="op://Dev/env_variables/demo-app/DB_USER"
```

## Documentation

In order for the script to run correctly, it expects that an item is created in 1Password with the following:

1. Sections are used to group each of your app's credentials.
2. Password fields are used to store credentials, with the label of each field named after the environment variable you want to create.

### Example Setup

![Example Setup](/.github/assets/example-setup.png?raw=0)

## CLI Guide

When running the CLI, you will be asked the following questions:

1. "What is the item's name?" - This is the name of the item in 1Password that contains your credentials.
2. "What vault is the item in?" - This is the vault that the item is stored in.
3. "What section is this item in?" - This is the name of the section in the item that contains the credentials.
4. "How would you like the output?" - This is the format of the output. Currently, there are two options:
   1. Actual values: This will output the actual values of the credentials. (e.g., `DB_USER=admin`)
   2. 1Password reference values: This will output the 1Password reference values of the credentials. (e.g., `DB_USER="op://<vault>/<item_name>/<section>/DB_USER"`). To run your app when using this format in your `.env`, prefix your app's run command with `op run --no-masking --env-file=".env" -- `. For example, for a Next.js Application you would run `op run --no-masking --env-file=".env" -- npm run dev`. Make sure to replace `.env` with the name of your .env file. See more on the official 1Password developer docs [here](https://developer.1password.com/docs/cli/secrets-environment-variables/).

## Notes

This is an open-source tool and is not affiliated with 1Password.
