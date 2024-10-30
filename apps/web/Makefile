.PHONY: build-development
build-development: ## Build the development docker image.
	docker compose -f deploy/development/docker-compose.yml build

.PHONY: start-development
start-development: ## Start the development docker container.
	docker compose -f deploy/development/docker-compose.yml up -d

.PHONY: stop-development
stop-development: ## Stop the development docker container.
	docker compose -f deploy/development/docker-compose.yml down

.PHONY: build-production
build-production: ## Build the production docker image.
	docker compose -f deploy/production/docker-compose.yml build

.PHONY: start-production
start-production: ## Start the production docker container.
	docker compose -f deploy/production/docker-compose.yml up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	docker compose -f deploy/production/docker-compose.yml down