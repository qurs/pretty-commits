check-files:
	if [ ! -f ./.env ]; then cp .env.example .env; fi;

attach:
	@docker logs -n 100 commits
	@docker attach commits

start:
	@make check-files
	@npm i
	@docker compose up -d

stop:
	@docker compose down