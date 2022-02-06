<img align="right" width="25%" src="src/assets/images/telex-new.svg" />

# Desktop Chat App - Telex

Telex is a desktop communication application, built with [Electron](https://www.electronjs.org/) framework using (JavaScript - React JS, HTML and CSS) for the frontend and (Node.js - JavaScript runtime environment) for the backend. 

- [Firebase](https://firebase.google.com/) Cloud Service - is used for the data exchange through the network. Its features, such as Cloud Firestore, Authentication, Performance monitoring and Google analytics, are utilized in the application.
- [Redux](https://redux.js.org/) - a predictable state container, is used to centralize/organize and manage application's state and logic.

## Getting Started

Clone and run from source:
```
git clone https://github.com/NSadikhov/desktop-chat-app.git
```
In a choice of command-line interpreter (<u>in administrator mode</u>), navigate to the cloned **desktop-chat-app** folder:
```
npm install && npm start
```

## Structure

Communication between backend and frontend is handled by the Electron framework in an isolated context form (main and renderer). Frontend is
to be exposed only to designated Node.js features allowed by the backend to prevent security issues (Cross-site-scripting attacks)

## Encryption

Public/Private key encryption is applied to data, such as messages and files exchanged by peers. 
Encrypted data is converted into unsigned 8-bit integer array to be delivered through the network.

**Protocol**: Elliptic curve DiffieHelman anonymous key agreement (_ECDH_).

**Algorithm**: _AES_256_GCM_ (GCM => Galois/Counter mode). 

This algorithm is intended to be used to verify data confidentiality, integrity, and authenticity. 
* **Confidentiality**: Nobody without the key can read the message. 
* **Integrity**: Nobody has changed the content of the message. 
* **Authenticity**: The originator of the message can be verified.
