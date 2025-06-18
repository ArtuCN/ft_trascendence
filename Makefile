# Makefile for Docker Compose management
DOCKER_COMPOSE = docker compose -f docker-compose.yml

# --- Default Target (Help) ---
help:  ## help menu
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- Main Commands ---
build:  ## Only build containers
	@$(DOCKER_COMPOSE) build

up:  ## Start with build/rebuild
	@$(DOCKER_COMPOSE) up -d --build

down:  ## Stop and remove containers
	@$(DOCKER_COMPOSE) down

clean: down  ## Remove images
	@$(DOCKER_COMPOSE) down --rmi all --remove-orphans

fclean: clean ## remove volumes and build cache
	@$(DOCKER_COMPOSE) down -v 
	@docker network prune -f
	@docker system prune -a --volumes -f
	@docker volume prune -f

# clean_host_data: fclean ## removes host data; needs sudo



# --- Checks and Monitoring ---

status: ## Extensive Info on containers
	@./docker-status.sh

logs:  ## Tail container logs
	@$(DOCKER_COMPOSE) logs -f --tail=100

check: ## Check DB connectivity and health
	# @echo "Database check:"
	# @docker ps --format {{.Names}} | grep -q mariadb || (echo "mariadb not running"; exit 1)
	# @docker inspect --format='{{.State.Health.Status}}' mariadb | grep -q healthy || (echo "DB not healthy"; exit 1)
	# @echo  "database health: OK"
	# @docker exec mariadb mysql -u n1smm -p$$(grep MYSQL_PASSWORD srcs/.env | cut -d '=' -f2) -e "SHOW DATABASES;"

re: down up  ## Rebuild and restart containers

.PHONY: help build up down clean status logs check re



# initial makefile (if something doesn't work and quickly check where the problem is)
# all:
# 	docker compose -f docker-compose.yml build
# 	docker compose -f docker-compose.yml up -d

# clean:
# 	docker compose -f docker-compose.yml down

# re:
# 	make clean
# 	make all
