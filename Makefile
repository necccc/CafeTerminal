#!/bin/bash

NODE=`which node`

coffee: ; \
    ${NODE} client/index.js

.SILENT: coffee # no unnecesary makefile output

.PHONY: coffee