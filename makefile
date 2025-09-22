check-files:
	if [ ! -f ./.env ]; then cp .env.example .env; fi;

attach:
	@docker logs -n 100 commits
	@docker attach commits

stop:
	@docker compose down

clear:
	@docker image prune -y

pull:
	@git pull

start:
	@make stop
	@make pull
	@make check-files
	@docker compose up -d --build
	@make clear
