# Bitcoin Paper Wallet

A tool to create and spend from old school paper wallets, i.e. with just a single address and private key. No BIP39 seed phrases or BIP32 HD wallet stuff here. 

Live demo here: https://paper-flame.vercel.app

It does BIP38 password encryption on the private key.

It's not well tested and I'm no security expert so don't use with any serious amount of money. I made it for me.

# Running locally

Build the source with `bun build`

Serve as an SPA with python:

    python3 serve_spa.py
