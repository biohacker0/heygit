#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import sqlite3 from "sqlite3";
import inquirer from "inquirer";
import chalk from "chalk";
import os from "os";

// Constants
const SSH_DIR = path.join(os.homedir(), ".ssh");
const DB_FILE = path.join(os.homedir(), ".git_ledger_cli_version.db");
const SSH_KEY_FILES = ["id_ed25519", "id_ed25519.pub"];

// Color theme using Chalk
const THEME = {
  primary: chalk.hex("#ff71ce"), // Neon pink
  secondary: chalk.hex("#01cdfe"), // Bright cyan
  accent: chalk.hex("#05ffa1"), // Bright green
  text: chalk.hex("#b967ff"), // Purple
  error: chalk.hex("#ff3855"), // Bright red
  active: chalk.hex("#fffb96"), // Light yellow
  inactive: chalk.hex("#9d9d9d"), // Light gray
  sshKey: chalk.hex("#05ffa1"), // Bright green
};

// ASCII Art for header
const ASCII_ART = `
╭─────────────────────────────────────────────────────────────────╮
│                                                                 │
|    _      _         _                   _                 ___   |
|   | |__  (_)  ___  | |__    __ _   ___ | | __ ___  _ __  / _ \\  |
|   | '_ \\ | | / _ \\ | '_ \\  / _\` | / __|| |/ // _ \\| '__|| | | | |
|   | |_) || || (_) || | | || (_| || (__ |   <|  __/| |   | |_| | |
|   |_.__/ |_| \\___/ |_| |_| \\__,_| \\___||_|\\_\\\\___||_|    \\___/  |
|                                                                 |   
|                                                                 │
│        Built By biohacker0 aka crow Nyaa :3                     │
╰─────────────────────────────────────────────────────────────────╯
`;

// Initialize the SQLite database
function initDb() {
  const db = new sqlite3.Database(DB_FILE);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        email TEXT PRIMARY KEY, 
        name TEXT, 
        is_active INTEGER
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS ssh_keys (
        email TEXT PRIMARY KEY, 
        private_key BLOB, 
        public_key BLOB, 
        FOREIGN KEY(email) REFERENCES accounts(email)
      )
    `);
  });
  db.close();
}

// Get current Git user
function getCurrentGitUser() {
  try {
    const name = execSync("git config --global user.name").toString().trim();
    const email = execSync("git config --global user.email").toString().trim();
    return { name, email };
  } catch (error) {
    return { name: null, email: null };
  }
}

// Unset Git credentials without crashing if they don't exist
function unsetGitCredentials() {
  try {
    execSync("git config --global --unset user.name");
  } catch (error) {
    // Ignore error if user.name does not exist
  }

  try {
    execSync("git config --global --unset user.email");
  } catch (error) {
    // Ignore error if user.email does not exist
  }
}

// Clear SSH keys from the .ssh directory
function clearSshKeys() {
  SSH_KEY_FILES.forEach((file) => {
    const filePath = path.join(SSH_DIR, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.log(THEME.error(`Failed to remove SSH key file: ${filePath}`));
      }
    }
  });
}

// Generate a new SSH key for a given email
function generateSshKey(email) {
  clearSshKeys();
  const privateKeyPath = path.join(SSH_DIR, "id_ed25519");
  try {
    execSync(`ssh-keygen -t ed25519 -f ${privateKeyPath} -N "" -C ${email}`);
  } catch (error) {
    console.log(THEME.error(`Failed to generate SSH key: ${error.message}`));
  }
}

// Add a new account with SSH keys and store it in the database
function addAccount(name, email) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT * FROM accounts WHERE email = ?", [email], (err, row) => {
      if (row) {
        console.log(
          THEME.accent(`Error: An account with email ${email} already exists.`)
        );
        db.close();
        resolve();
        return;
      }

      generateSshKey(email);
      const privateKey = fs.readFileSync(path.join(SSH_DIR, "id_ed25519"));
      const publicKey = fs.readFileSync(path.join(SSH_DIR, "id_ed25519.pub"));

      db.run("UPDATE accounts SET is_active = 0");
      db.run("INSERT INTO accounts (email, name, is_active) VALUES (?, ?, 1)", [
        email,
        name,
      ]);
      db.run(
        "INSERT INTO ssh_keys (email, private_key, public_key) VALUES (?, ?, ?)",
        [email, privateKey, publicKey]
      );
      db.close();

      setGitCredentials(name, email);
      console.log(THEME.primary(`Account added for ${name} (${email})`));
      console.log(THEME.secondary("Public SSH key:"));
      console.log(THEME.sshKey(publicKey.toString()));
      console.log();
      console.log(
        THEME.secondary(
          "Copy and Paste the above SSH key to your Git account under ssh/gpg keys sections on github under account settings."
        )
      );
      console.log(THEME.secondary("Git credentials have been set globally."));
      resolve();
    });
  });
}

// Set Git credentials globally
function setGitCredentials(name, email) {
  try {
    execSync(`git config --global user.name "${name}"`);
    execSync(`git config --global user.email "${email}"`);
  } catch (error) {
    console.log(THEME.error(`Failed to set Git credentials: ${error.message}`));
  }
}

// Remove an account by email
function removeAccountByEmail(email) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_FILE);
    db.get(
      "SELECT is_active, name FROM accounts WHERE email = ?",
      [email],
      (err, account) => {
        if (!account) {
          console.log(
            THEME.accent(`Error: No account found with email ${email}`)
          );
          db.close();
          resolve();
          return;
        }

        db.run("DELETE FROM accounts WHERE email = ?", [email]);
        db.run("DELETE FROM ssh_keys WHERE email = ?", [email]);

        if (account.is_active) {
          const { email: currentEmail } = getCurrentGitUser();
          if (currentEmail === email) {
            unsetGitCredentials();
            clearSshKeys();
            console.log(
              THEME.secondary(`Account removed for ${account.name} (${email})`)
            );
            switchAccount(true);
          } else {
            console.log(
              THEME.secondary(`Account removed for ${account.name} (${email})`)
            );
          }
        } else {
          console.log(
            THEME.secondary(`Account removed for ${account.name} (${email})`)
          );
        }
        db.close();
        resolve();
      }
    );
  });
}

// Switch account interactively
async function switchAccount(autoSwitch = false) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all(
      "SELECT email, name FROM accounts WHERE is_active = 0",
      async (err, accounts) => {
        if (accounts.length === 0) {
          console.log();
          console.log(THEME.accent("No other accounts available."));
          db.close();
          resolve();
          return;
        }

        if (autoSwitch) {
          const randomAccount =
            accounts[Math.floor(Math.random() * accounts.length)];
          await activateAccount(randomAccount.email, randomAccount.name);
        } else {
          console.log(THEME.primary("Available accounts:"));
          const { selectedAccount } = await inquirer.prompt([
            {
              type: "list",
              name: "selectedAccount",
              message: "Select an account to switch to:",
              choices: accounts.map((acc) => ({
                name: `${acc.name} (${acc.email})`,
                value: acc.email,
              })),
            },
          ]);
          const account = accounts.find((acc) => acc.email === selectedAccount);
          await activateAccount(account.email, account.name);
        }
        db.close();
        resolve();
      }
    );
  });
}

// Activate a specific account
function activateAccount(email, name) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_FILE);
    db.serialize(() => {
      db.run("UPDATE accounts SET is_active = 0");
      db.run("UPDATE accounts SET is_active = 1 WHERE email = ?", [email]);

      db.get(
        "SELECT private_key, public_key FROM ssh_keys WHERE email = ?",
        [email],
        (err, row) => {
          if (row) {
            clearSshKeys();
            fs.writeFileSync(path.join(SSH_DIR, "id_ed25519"), row.private_key);
            fs.writeFileSync(
              path.join(SSH_DIR, "id_ed25519.pub"),
              row.public_key
            );
            setGitCredentials(name, email);
            console.log();
            console.log(
              THEME.primary(
                `Switched to account: name: ${name} | email: (${email})`
              )
            );
            console.log(
              THEME.secondary(
                "SSH keys have been updated in the .ssh directory."
              )
            );
            console.log();
          }
          resolve();
        }
      );
    });
    db.close();
  });
}

// Remove all accounts and SSH keys
async function removeAllAccounts() {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to remove all accounts?",
      default: false,
    },
  ]);

  if (confirm) {
    const db = new sqlite3.Database(DB_FILE);
    db.run("DELETE FROM accounts");
    db.run("DELETE FROM ssh_keys");
    db.close();

    clearSshKeys();
    unsetGitCredentials();

    console.log(THEME.secondary("Removed all Git accounts and SSH keys."));
  } else {
    console.log(THEME.accent("Operation cancelled."));
  }
}

// Display all accounts with credentials and SSH keys
async function listAccounts() {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all("SELECT name, email, is_active FROM accounts", (err, rows) => {
      console.log();
      console.log(
        THEME.primary(
          "Credentials of all accounts in the database with status:"
        )
      );
      if (rows.length === 0) {
        console.log(THEME.accent("No accounts available."));
      } else {
        rows.forEach((row) => {
          console.log(
            `user.name : ${row.name} | user.email: ${row.email} - ${
              row.is_active
                ? THEME.active("Active")
                : THEME.inactive("Inactive")
            }`
          );

          const sshKeyPath = path.join(SSH_DIR, `id_ed25519.pub`);
          if (fs.existsSync(sshKeyPath)) {
            const sshKey = fs.readFileSync(sshKeyPath, "utf8");
            console.log(THEME.sshKey(`SSH Key: ${sshKey}`));
          } else {
            console.log(THEME.accent("SSH Key: Not available"));
          }
        });
      }
      console.log(
        "-------------------------------------------------------------------------"
      );
      // Show the currently active Git account details
      const { name, email } = getCurrentGitUser();
      if (name && email) {
        console.log(
          THEME.primary("\nActive Account Credentials and SSH keys:")
        );
        console.log(
          THEME.active(
            `Current Git User: user.name : ${name} | user.email : ${email}`
          )
        );
        const currentSshKeyPath = path.join(SSH_DIR, "id_ed25519.pub");
        if (fs.existsSync(currentSshKeyPath)) {
          const currentSshKey = fs.readFileSync(currentSshKeyPath, "utf8");
          console.log(THEME.sshKey(`SSH Key: ${currentSshKey}`));
        } else {
          console.log(THEME.accent("SSH Key: Not available"));
        }
      } else {
        console.log(THEME.accent("\nNo active Git user detected."));
      }

      db.close();
      resolve();
    });
  });
}

async function showSSHKey(email) {
  const db = new sqlite3.Database(DB_FILE);
  const sshKey = await new Promise((resolve) => {
    db.get(
      "SELECT public_key FROM ssh_keys WHERE email = ?",
      [email],
      (err, row) => {
        if (row) {
          resolve(row.public_key.toString());
        } else {
          resolve(null);
        }
      }
    );
  });
  db.close();

  if (sshKey) {
    console.log(THEME.primary(`SSH Public Key for ${email}:`));
    console.log(THEME.sshKey(sshKey));
  } else {
    console.log(THEME.accent(`No SSH key found for ${email}`));
  }
}

async function showSpecificUserSSH() {
  const db = new sqlite3.Database(DB_FILE);
  const accounts = await new Promise((resolve) => {
    db.all("SELECT email, name FROM accounts", (err, rows) => {
      resolve(rows);
    });
  });
  db.close();

  if (accounts.length === 0) {
    console.log(THEME.accent("No accounts available."));
    return;
  }

  const { selectedEmail } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedEmail",
      message: "Select an account to show its SSH key:",
      choices: accounts.map((acc) => ({
        name: `${acc.name} (${acc.email})`,
        value: acc.email,
      })),
    },
  ]);

  await showSSHKey(selectedEmail);
}

async function showCurrentUserSSH() {
  const { email } = getCurrentGitUser();
  if (!email) {
    console.log(THEME.accent("No active Git user detected."));
    return;
  }

  await showSSHKey(email);
}

// Display the interactive menu
function displayMenu() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "action",
          message: "Choose an action:",
          choices: [
            "List all accounts",
            "Add a new account",
            "Switch account",
            "Remove an account",
            "Remove all accounts",
            "Show SSH key of current user",
            "Show SSH key of specific user",
            "Exit",
          ],
        },
      ])
      .then((answers) => {
        resolve(answers.action);
      });
  });
}
// Handle user actions
async function handleUserAction(action) {
  switch (action) {
    case "List all accounts":
      await listAccounts();
      break;
    case "Add a new account":
      await addNewAccount();
      break;
    case "Switch account":
      await switchAccount();
      break;
    case "Remove an account":
      await removeAccount();
      break;
    case "Remove all accounts":
      await removeAllAccounts();
      break;
    case "Show SSH key of current user":
      await showCurrentUserSSH();
      await waitForEnter();
      break;
    case "Show SSH key of specific user":
      await showSpecificUserSSH();
      await waitForEnter();
      break;
    case "Exit":
      console.log(THEME.primary("Exiting..."));
      process.exit(0);
    default:
      break;
  }
}

// Add a new account
async function addNewAccount() {
  const { name, email } = await inquirer.prompt([
    { type: "input", name: "name", message: "Enter your name:" },
    { type: "input", name: "email", message: "Enter your email:" },
  ]);
  await addAccount(name, email);
  await waitForEnter();
}

// Remove an account
async function removeAccount() {
  const { email } = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Enter the email of the account to remove:",
    },
  ]);
  await removeAccountByEmail(email);
  await waitForEnter();
}

// Utility function to wait for user input
async function waitForEnter() {
  return inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to return to the main menu...",
    },
  ]);
}

// Main app loop
async function startApp() {
  console.log(ASCII_ART);
  initDb();

  while (true) {
    const action = await displayMenu();
    await handleUserAction(action);
  }
}

// Start the app
startApp();
