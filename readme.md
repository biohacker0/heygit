# GitSwitch CLI

<!-- ![GitSwitch CLI Logo](https://raw.githubusercontent.com/biohacker0/GitSwitch-Cli/main/assets/logo.png) -->

GitSwitch CLI is a powerful command-line tool designed to simplify the management of multiple Git profiles. Seamlessly switch between different Git accounts, manage SSH keys, and streamline your development workflow across various projects and platforms.

[![npm version](https://img.shields.io/npm/v/gitswitchcli.svg)](https://www.npmjs.com/package/gitswitchcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔄 Easily switch between multiple Git profiles
- 🔑 Automatic SSH key management
- 📋 List all configured accounts
- ➕ Add new Git accounts on the fly
- 🗑️ Remove accounts when no longer needed
- 🔒 Secure local storage of account information
- 🖥️ Cross-platform compatibility (Windows, macOS, Linux)

## Installation

Install GitSwitch CLI globally using npm:

```bash
npm i @biohacker0/gitswitch-cli
```

## Usage

After installation, you can run GitSwitch CLI by typing `gitswitch` in your terminal:

```bash
gitswitch
```

This will launch an interactive menu with the following options:

1. List all accounts
2. Add a new account
3. Switch account
4. Remove an account
5. Remove all accounts
6. Show SSH key of current user
7. Show SSH key of specific user
8. Exit

Follow the on-screen prompts to manage your Git profiles effortlessly.

## Examples

### Adding a new account

```bash
$ gitswitch
? Choose an action: Add a new account
? Enter your name: John Doe
? Enter your email: john@example.com
Account added for John Doe (john@example.com)
Public SSH key:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG...
```

### Switching accounts

```bash
$ gitswitch
? Choose an action: Switch account
? Select an account to switch to: John Doe (john@example.com)
Switched to account: john@example.com
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by [biohacker0](https://github.com/biohacker0)

## Support

If you find GitSwitch CLI useful, consider [buying me a coffee](https://buymeacoffee.com/biohacker0)!

---

GitSwitch CLI - Simplify your Git profile management and boost your productivity!
