# heygit
<!-- ![heygit Logo](https://raw.githubusercontent.com/biohacker0/heygit/main/assets/logo.png) -->
heygit is a command-line tool designed to simplify the management of multiple Git profiles. Seamlessly switch between different Git accounts, manage SSH keys, and streamline your development workflow across various projects and platforms.
<div align="center">
![heygit Logo](https://raw.githubusercontent.com/biohacker0/GitSwitch-Gui/main/src-tauri/icons/icon.png)
*Effortlessly manage multiple GitHub accounts from your desktop*
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/biohacker0/GitSwitch-Gui.svg)](https://github.com/biohacker0/GitSwitch-Gui/releases/)
</div>
[![npm version](https://img.shields.io/npm/v/heygit.svg)](https://www.npmjs.com/package/heygit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<div align="center">
![heygit Logo](https://raw.githubusercontent.com/biohacker0/GitSwitch-Gui/main/src-tauri/icons/icon.png)
*Effortlessly manage multiple GitHub accounts from your desktop*
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/biohacker0/GitSwitch-Gui.svg)](https://github.com/biohacker0/GitSwitch-Gui/releases/)
</div>

## What heygit Does

**Setup Git accounts on new machines**
Got a new computer and need to set up Git? heygit handles all the Git configuration and SSH key generation. Just add your account, copy the generated key to GitHub, and start coding.

**Manage multiple GitHub accounts** 
Switch between personal, work, and client GitHub accounts instantly. Each account has separate Git configs and SSH keys.

**Easy credential management**
Remove accounts, view current settings, or clean up Git configuration when needed.

## All Features

| Feature | Description |
|---------|-------------|
| Profile Switching | Switch between multiple Git profiles instantly |
| SSH Key Management | Automatic generation and management of SSH keys |
| Account Listing | View all configured accounts with their status |
| Account Addition | Add new Git accounts on the fly |
| Account Removal | Remove accounts when no longer needed |
| Secure Storage | Local storage of account information |
| Cross-platform | Windows, macOS, Linux compatibility |
| SSH Key Display | Show SSH keys for current or specific users |

## Installation

Install heygit globally using npm:

```bash
npm install -g heygit
```

## Usage

After installation, you can run heygit by typing `heygit` in your terminal:

```bash
heygit
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

Follow the on-screen prompts to manage your Git profiles effortlessly.

## Examples

**Adding a new account:**
```bash
$ heygit
? Choose an action: Add a new account
? Enter your name: John Doe
? Enter your email: john@example.com
Account added for John Doe (john@example.com)
Public SSH key:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG...
```

**Switching accounts:**
```bash
$ heygit
? Choose an action: Switch account
? Select an account to switch to: John Doe (john@example.com)
Switched to account: name: John Doe | email: (john@example.com)
SSH keys have been updated in the .ssh directory.
```

## Requirements

| Requirement | Notes |
|-------------|-------|
| Node.js | Version 14 or higher |
| Git | For version control operations |
| SSH | For key generation (usually pre-installed) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by [biohacker0](https://github.com/biohacker0)

## Support

If you find heygit useful, consider [buying me a coffee](https://buymeacoffee.com/biohacker0)!

---

heygit - Simplify your Git profile management and boost your productivity!
