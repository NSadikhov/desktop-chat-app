<img align="right" width="25%" src="src/assets/images/telex-new.svg" />

# Desktop Chat App - Telex

Telex is a desktop communication application, built with [Electron](https://www.electronjs.org/) framework using (JavaScript - React JS, HTML and CSS) for the frontend and (Node.js - JavaScript runtime environment) for the backend. 

- [Firebase](https://firebase.google.com/) Cloud Service - is used for the data exchange through the network. Its features, such as Cloud Firestore, Authentication, Performance monitoring and Google analytics, are utilized in the application.
- [Redux](https://redux.js.org/) - a predictable state container, is used to centralize/organize and manage application's state and logic.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js
- npm (Node Package Manager)

### Installation

Clone the repository:
```
git clone https://github.com/NSadikhov/desktop-chat-app.git
```

Navigate to the project directory:
```
cd desktop-chat-app
```

Install the dependencies:
```
npm install
```

### Running the Application

Start the application:
```
npm start
```

## Project Structure

The project is structured as follows:

- **src**: Contains the source code for the application.
  - **assets**: Contains static assets like fonts and images.
  - **components**: Contains React components used in the application.
  - **db**: Contains Firebase configuration and initialization.
  - **store**: Contains Redux store configuration, actions, and reducers.
  - **styles**: Contains CSS modules for styling components.
  - **utils**: Contains utility functions.
  - **views**: Contains React components representing different views/screens of the application.
  - **main.js**: Entry point for the Electron main process.
  - **preload.js**: Preload script for Electron to expose APIs to the renderer process.
  - **renderer.js**: Entry point for the Electron renderer process.
  - **index.html**: HTML template for the Electron renderer process.
  - **index.css**: Global CSS styles.

- **.gitignore**: Specifies files and directories to be ignored by Git.
- **package.json**: Contains project metadata and dependencies.
- **webpack.main.config.js**: Webpack configuration for the Electron main process.
- **webpack.renderer.config.js**: Webpack configuration for the Electron renderer process.
- **webpack.rules.js**: Webpack loader rules.

## Encryption

Public/Private key encryption is applied to data, such as messages and files exchanged by peers. 
Encrypted data is converted into unsigned 8-bit integer array to be delivered through the network.

**Protocol**: Elliptic curve DiffieHelman anonymous key agreement (_ECDH_).

**Algorithm**: _AES_256_GCM_ (GCM => Galois/Counter mode). 

This algorithm is intended to be used to verify data confidentiality, integrity, and authenticity. 
* **Confidentiality**: Nobody without the key can read the message. 
* **Integrity**: Nobody has changed the content of the message. 
* **Authenticity**: The originator of the message can be verified.
