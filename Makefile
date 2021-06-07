.PHONY stop-env-update start-env-update

stop-env-update:
	git update-index --assume-unchanged .env

start-env-update:
	git update-index --no-assume-unchanged .env