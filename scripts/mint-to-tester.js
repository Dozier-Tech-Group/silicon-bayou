/**
 * Genesis supply is capped at 4. Extra tester mints are impossible after
 * deploy:mainnet. Transfer an existing token from the owner wallet instead.
 */
console.error(
  "HOLD: MAX_SUPPLY is 4. Tokens 1-4 mint in npm run deploy:mainnet. Do not mint extras. Transfer from the owner if a tester needs a token."
);
process.exit(2);
