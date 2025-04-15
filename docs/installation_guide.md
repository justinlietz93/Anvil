# Anvil Desktop Platform - Installation Guide

This guide provides detailed instructions for installing and setting up the Anvil Desktop Platform on different operating systems.

## System Requirements

Before installing Anvil, ensure your system meets the following requirements:

- **Operating System**:
  - Windows 10/11 (64-bit)
  - macOS 10.15 (Catalina) or later
  - Ubuntu 20.04 LTS or later (or other Linux distributions with equivalent libraries)

- **Hardware**:
  - 4GB RAM minimum (8GB recommended)
  - 500MB available disk space for installation
  - 1280x720 minimum screen resolution (1920x1080 recommended)

- **Additional Requirements**:
  - Internet connection for initial setup and LLM integration
  - Administrator privileges for installation

## Windows Installation

1. **Download the Installer**:
   - Download the latest `AnvilSetup-x.x.x.exe` from the official website

2. **Run the Installer**:
   - Double-click the downloaded file
   - If prompted by User Account Control, click "Yes" to allow the installer to run
   - Follow the on-screen instructions in the installation wizard

3. **Launch Anvil**:
   - After installation completes, launch Anvil from the Start menu or desktop shortcut
   - On first launch, Anvil will perform initial setup and configuration

## macOS Installation

1. **Download the Installer**:
   - Download the latest `Anvil-x.x.x.dmg` from the official website

2. **Run the Installer**:
   - Double-click the downloaded DMG file
   - Drag the Anvil application to the Applications folder
   - If prompted about an app from an unidentified developer:
     - Right-click (or Control-click) the app and select "Open"
     - Click "Open" in the dialog that appears

3. **Launch Anvil**:
   - Open Anvil from the Applications folder or Launchpad
   - On first launch, Anvil will perform initial setup and configuration

## Linux Installation

### Ubuntu/Debian-based Distributions

1. **Download the Package**:
   - Download the latest `anvil_x.x.x_amd64.deb` from the official website

2. **Install the Package**:
   - Open a terminal and navigate to the download location
   - Run the following command:
     ```
     sudo dpkg -i anvil_x.x.x_amd64.deb
     sudo apt-get install -f
     ```

3. **Launch Anvil**:
   - Launch Anvil from the Applications menu or run `anvil` in the terminal
   - On first launch, Anvil will perform initial setup and configuration

### Red Hat/Fedora-based Distributions

1. **Download the Package**:
   - Download the latest `anvil-x.x.x.rpm` from the official website

2. **Install the Package**:
   - Open a terminal and navigate to the download location
   - Run the following command:
     ```
     sudo rpm -i anvil-x.x.x.rpm
     ```

3. **Launch Anvil**:
   - Launch Anvil from the Applications menu or run `anvil` in the terminal
   - On first launch, Anvil will perform initial setup and configuration

## Manual Installation from Source

For developers or advanced users who want to install from source:

1. **Clone the Repository**:
   ```
   git clone https://github.com/anvil-platform/anvil.git
   cd anvil
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Build the Application**:
   ```
   npm run build
   ```

4. **Start the Application**:
   ```
   npm start
   ```

## Post-Installation Setup

After installing Anvil, you may want to configure the following:

1. **Database Connections**:
   - Open the Settings panel
   - Navigate to the Database Connections tab
   - Add connections to your databases

2. **LLM Providers**:
   - Open the Settings panel
   - Navigate to the LLM Providers tab
   - Add and configure your preferred LLM providers with API keys

3. **Plugins**:
   - Open the Settings panel
   - Navigate to the Plugins tab
   - Add plugins to extend Anvil's functionality

## Troubleshooting Installation Issues

### Windows Issues

- **Installation fails with "Windows protected your PC" message**:
  - Click "More info" and then "Run anyway"
  
- **Missing DLL errors**:
  - Ensure you have the latest Microsoft Visual C++ Redistributable installed

### macOS Issues

- **"App is damaged and can't be opened" message**:
  - Open System Preferences > Security & Privacy
  - Click "Open Anyway" for Anvil
  
- **App won't open due to security settings**:
  - Right-click (or Control-click) the app and select "Open"
  - Click "Open" in the dialog that appears

### Linux Issues

- **Missing dependencies**:
  - Run `sudo apt-get install -f` (Debian/Ubuntu) to install missing dependencies
  - For other distributions, install the equivalent of: libgtk-3-0, libnotify4, libnss3, libxss1, libxtst6, xdg-utils, libatspi2.0-0, libuuid1

- **Permission issues**:
  - Ensure you have proper permissions with `sudo chmod +x /usr/bin/anvil`

## Uninstalling Anvil

### Windows

1. Open Control Panel > Programs > Programs and Features
2. Select "Anvil Desktop Platform" and click "Uninstall"
3. Follow the on-screen instructions

### macOS

1. Open the Applications folder in Finder
2. Drag the Anvil application to the Trash
3. Empty the Trash

### Linux

For Debian/Ubuntu:
```
sudo apt-get remove anvil
```

For Red Hat/Fedora:
```
sudo rpm -e anvil
```

## Getting Help

If you encounter issues during installation:

- Visit the Anvil support website
- Check the troubleshooting section in the user documentation
- Contact support through the help menu in the application
- Post in the community forum for community assistance
