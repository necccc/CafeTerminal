#!/bin/bash

NODE=`which node` # find the node executable on this system

coffee: ; \
    ${NODE} client/index.js # run the client script using the found node above

.SILENT: coffee # no unnecesary makefile output

.PHONY: coffee