# Define shell & grunt commands
SHELL := /bin/bash
GRUNT := $(shell command -v grunt 2>/dev/null)


# Define Color Constants
NO_COLOR=\x1b[0m
OK_COLOR=\x1b[32;01m
ERROR_COLOR=\x1b[31;01m
WARN_COLOR=\x1b[33;01m


# Define Log Prefixes with Color Schemes
INFO=$(OK_COLOR)[INFO]$(NO_COLOR)
ERRR=$(ERROR_COLOR)[ERRR]$(NO_COLOR)
WARN=$(WARN_COLOR)[WARN]$(NO_COLOR)


# all Target. Default Target
all: get_grunt install build clean makedir server


# Fetches Grunt, and if not found, installs it
get_grunt:
ifdef GRUNT
	@echo -e "$(INFO) Found Grunt @$(GRUNT)"
else
	@echo -e "$(INFO) Did not find Grunt. Installing it ..."
	@npm install grunt@0.4.5 -g
endif


# Installs NPM Modules
install:
	@echo -e "$(INFO) Performing npm install"
	@npm install


# Does Build Steps, using Gruntfile.js
build:
	@echo -e "$(INFO) Building assets with Grunt"
	@grunt


# Cleans var/ directory
clean:
	@echo -e "$(INFO) Cleaning var/ directory"
	@rm -rf var


# Makes var/ directory
makedir:
	@echo -e "$(INFO) Preparing var/ directory"
	@mkdir var
	@mkdir var/log
	@mkdir var/run


# Starts the Server & makes it a background process
# Saves the PID to var/run/server.pid
server:
	@echo -e "$(INFO) Booting the Server. Please wait !!"
	@bin/www > var/log/system.log 2>&1 &
	@echo `ps -ef | grep bin/www  | grep -v grep | awk '{print $$2}'` > var/run/server.pid
	@echo -e "$(INFO) Successfully started the Server."
	@echo -e "$(INFO) You can check the Logs using: tail -f var/log/system.log"


# Stops the Server, by reading the PID
# from var/run/server.pid
stop:
	@echo -e "$(INFO) Stopping the Server"
	@kill -9 `cat var/run/server.pid` || (@echo -e "$(ERRR) Error in Stopping the Server .."; exit 1)
	@rm -rf var/run/server.pid
	@echo -e "$(INFO) Successfully halted the Server !!"


# Declare what to run by default, if not provided a Target
.PHONY: all
