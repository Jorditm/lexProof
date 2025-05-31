# Instalar bun 
 curl -fsSL https://bun.sh/install | bash

 # Bun install in repo vlayer 
 cd web
 bun install

 # Run the docker server
 bun run devnet:up

 # Forge build
forge build

# Up the prove devnet
bun run prove:dev

# Start frontend test 
bun run web:dev