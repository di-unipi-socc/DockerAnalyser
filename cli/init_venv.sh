#!/bin/bash

if [ ! -d "venv" ]; then
  virtualenv venv
fi

source venv/bin/activate

