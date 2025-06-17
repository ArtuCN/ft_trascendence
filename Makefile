all:
	docker compose -f web/docker-compose.yml build
	docker compose -f web/docker-compose.yml up -d

clean:
	docker compose -f web/docker-compose.yml down

re:
	make clean
	make all
