.PHONY: dev backend frontend test test-unit docker-up docker-down

dev:
	docker compose up --build

backend:
	cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && yarn start

test-unit:
	cd backend && pytest tests/test_api_unit.py -n 0 -v

test:
	cd backend && pytest tests/ -n 0 -v

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
