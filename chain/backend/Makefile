# Makefile: Foundry helper for build / test / deployment / calls
# Usage examples:
#   make build
#   make install-oz
#   make test
#   make deploy        # deploys the contract file in $(CONTRACT_DIR) (override with CONTRACT=Your.sol:Name)
#   make deploy CONTRACT=MyOther.sol:MyOther OWNER=0xabc... RPC_URL=https://rpc
#   make call VIEW="checkTournamentStatus(uint256) 0" CONTRACT_ADDR=0xContract RPC_URL=...
#   make send CONTRACT_ADDR=0xC SIG="stake(uint256,uint256,string,address,uint256)" \
#        ARGS="1 123 'bob' 0xabc... 1000000000000000000" VALUE=1000000000000000000 PK=0x...

# load .env into Make variables and export them into the environment for recipe commands
ifneq (,$(wildcard .env))
include .env
# export every var name present in .env into the environment (so commands run by make see them)
export $(shell sed -n 's/^\([^#=]*\)=.*/\1/p' .env)
endif
# -----------------------
# configuration (can be overridden via env or make VAR=...)
RPC_URL ?= fuji-c
PK ?= $(PK)                            # private key (from env)
FUNDED_ADDRESS ?= $(FUNDED_ADDRESS)
OWNER ?= $(FUNDED_ADDRESS)

# Build / deploy settings
CONTRACT_DIR = contracts/
# default contract file:name to build/deploy (can be overridden by env CONTRACT)
DEPLOY_CONTRACT ?= transcendence/Staking.sol:Staking.sol

# Contract address used for calls/send (separate from CONTRACT file)
# Default to an environment var you already have (GETNUM_CONT), override with CONTRACT_ADDR=0x...
CONTRACT_ADDR ?= $(GETNUM_CONT)

# Remappings file used by forge (created by `forge remappings`)
REMAPS_FILE := remappings.txt

# -----------------------
# Helper flags (overridable)
FORGE ?= forge
CAST ?= cast

# -----------------------
.PHONY: all build clean test install-oz remap deploy deploy-local call send call_view script verify help

all: build

# Build the project (builds a single contract file by default; override with CONTRACT=Other.sol:Other)
build:
	@echo ">>> $(FORGE) build --contracts $(CONTRACT_DIR)$${CONTRACT:-$(DEPLOY_CONTRACT)}"
	@$(FORGE) build --contracts $(CONTRACT_DIR)$${CONTRACT:-$(DEPLOY_CONTRACT)}

# Run tests
test:
	@echo ">>> $(FORGE) test"
	@$(FORGE) test

# Clean build artifacts
clean:
	@echo ">>> $(FORGE) clean"
	@$(FORGE) clean
	@echo ">>> removing $(REMAPS_FILE)"
	@rm -f $(REMAPS_FILE)

# Install OpenZeppelin contracts via foundry
install-oz:
	@echo ">>> $(FORGE) install OpenZeppelin/openzeppelin-contracts"
	@$(FORGE) install OpenZeppelin/openzeppelin-contracts
	@echo ">>> generating remappings into $(REMAPS_FILE)"
	@$(FORGE) remappings > $(REMAPS_FILE) || true
	@echo ">>> done. remappings saved in $(REMAPS_FILE)"

# regenerate remappings (useful after editing lib/ or remappings)
remap:
	@echo ">>> $(FORGE) remappings > $(REMAPS_FILE)"
	@$(FORGE) remappings > $(REMAPS_FILE) || true
	@echo ">>> wrote $(REMAPS_FILE)"

# -----------------------
# Deploy helpers
# Default deploy target: deploys the contract file $(CONTRACT_DIR)${CONTRACT:-$(DEPLOY_CONTRACT)}
# Set RPC_URL and PK in your env before calling (or pass as make args)
deploy:
ifndef PK
	$(error PK (private key) is not set in env; pass PK=0x...)
endif
ifndef RPC_URL
	$(error RPC_URL must be set; e.g. RPC_URL=https://rpc.example)
endif
	@echo ">>> $(FORGE) create --rpc-url $(RPC_URL) --private-key $(PK) $(CONTRACT_DIR)$${CONTRACT:-$(DEPLOY_CONTRACT)} $(OWNER)"
	@$(FORGE) create --rpc-url $(RPC_URL) --private-key $(PK) $(CONTRACT_DIR)$${CONTRACT:-$(DEPLOY_CONTRACT)} $(OWNER)

# local deploy (to local node with default RPC_URL)
deploy-local: RPC_URL := http://127.0.0.1:8545
deploy-local: deploy

# -----------------------
# Generic read-only call
# Provide VIEW string like: "checkTournamentStatus(uint256) 0"
# Example:
#   make call VIEW="checkTournamentStatus(uint256) 0" CONTRACT_ADDR=0xContract RPC_URL=https://rpc
#
call:
ifndef VIEW
	$(error VIEW must be provided. Example: make call VIEW="checkTournamentStatus(uint256) 0")
endif
ifndef RPC_URL
	$(error RPC_URL must be set)
endif
	@echo ">>> $(CAST) call ${CONTRACT_ADDR} $(VIEW) --rpc-url $(RPC_URL)"
	@$(CAST) call ${CONTRACT_ADDR} $(VIEW) --rpc-url $(RPC_URL)

# Generic send transaction using cast
# Provide SIG and ARGS and optionally VALUE
# Example:
#  make send CONTRACT_ADDR=0xC SIG="stake(uint256,uint256,string,address,uint256)" \
#       ARGS="1 123 'bob' 0xabc... 1000000000000000000" VALUE=1000000000000000000 PK=0x...
#
send:
ifndef PK
	$(error PK must be set to sign transactions)
endif
ifndef SIG
	$(error SIG (signature) must be provided, example: SIG="stake(uint256,uint256,string,address,uint256)")
endif
ifndef ARGS
	$(error ARGS must be provided, example: ARGS="1 123 'bob' 0xabc 1000000000000000000")
endif
ifndef RPC_URL
	$(error RPC_URL must be set)
endif
	@echo ">>> $(CAST) send --private-key $(PK) ${CONTRACT_ADDR} \"$(SIG)\" $(ARGS) --rpc-url $(RPC_URL) $(if $(VALUE),--value $(VALUE))"
	@$(CAST) send --private-key $(PK) ${CONTRACT_ADDR} "$(SIG)" $(ARGS) --rpc-url $(RPC_URL) $(if $(VALUE),--value $(VALUE))

# Example for calling contract view functions that are pure/view via JSON RPC
# Example call format: make call_view FUNC=balanceOf ARGS="0xabc..." CONTRACT_ADDR=0x...
call_view:
ifndef FUNC
	$(error FUNC must be provided, example: FUNC=checkTournamentStatus)
endif
ifndef ARGS
	$(error ARGS must be provided, example: ARGS=0)
endif
ifndef RPC_URL
	$(error RPC_URL must be set)
endif
	@echo ">>> $(CAST) call ${CONTRACT_ADDR} \"$(FUNC)(uint256)\" $(ARGS) --rpc-url $(RPC_URL)"
	@$(CAST) call ${CONTRACT_ADDR} "$(FUNC)(uint256)" $(ARGS) --rpc-url $(RPC_URL)

# -----------------------
# Run a forge script (useful for scripted deployments)
# Example:
#  make script FILE=script/Deploy.s.sol RPC_URL=... PK=...
script:
ifndef FILE
	$(error FILE must be provided, example: FILE=script/Deploy.s.sol)
endif
ifndef RPC_URL
	$(error RPC_URL must be set)
endif
ifndef PK
	$(error PK must be set)
endif
	@echo ">>> $(FORGE) script $(FILE) --rpc-url $(RPC_URL) --private-key $(PK) --broadcast"
	@$(FORGE) script $(FILE) --rpc-url $(RPC_URL) --private-key $(PK) --broadcast

# -----------------------
# Verify contract on Etherscan (template)
# Set ETHERSCAN_API_KEY in env and CONTRACT_ADDRESS and CONTRACT_NAME
verify:
ifndef ETHERSCAN_API_KEY
	$(error ETHERSCAN_API_KEY must be set to verify on Etherscan)
endif
ifndef CONTRACT_ADDRESS
	$(error CONTRACT_ADDRESS must be provided)
endif
ifndef CONTRACT_NAME
	$(error CONTRACT_NAME must be provided, example: src/Staking.sol:Staking)
endif
	@echo ">>> $(FORGE) verify-contract --constructor-args $(OWNER) $(CONTRACT_ADDRESS) $(CONTRACT_NAME) $(ETHERSCAN_API_KEY)"
	@$(FORGE) verify-contract --constructor-args $(OWNER) $(CONTRACT_ADDRESS) $(CONTRACT_NAME) $(ETHERSCAN_API_KEY)

# -----------------------
help:
	@echo "Foundry Makefile helper"
	@echo ""
	@echo "Targets:"
	@echo "  make build                -> $(FORGE) build (builds file in $(CONTRACT_DIR); override with CONTRACT=File.sol:Name)"
	@echo "  make test                 -> $(FORGE) test"
	@echo "  make install-oz           -> $(FORGE) install OpenZeppelin and write remappings.txt"
	@echo "  make deploy               -> deploy contract file $(CONTRACT_DIR)$${CONTRACT:-$(DEPLOY_CONTRACT)} using PK and RPC_URL"
	@echo "  make deploy-local         -> deploy to local node (http://127.0.0.1:8545)"
	@echo "  make call VIEW=\"sig args\" -> read-only call using $(CAST); e.g. VIEW=\"checkTournamentStatus(uint256) 0\" CONTRACT_ADDR=0x..."
	@echo "  make send SIG=\"sig\" ARGS=\"...\" PK=0x... -> signed transaction using $(CAST) send against CONTRACT_ADDR"
	@echo "  make script FILE=script/Deploy.s.sol PK=... RPC_URL=... -> run and broadcast a forge script"
	@echo ""
	@echo "You can override variables on the make command line, e.g.:"
	@echo "  make deploy RPC_URL=https://rpc.example PK=0x... CONTRACT=My.sol:My OWNER=0x..."

