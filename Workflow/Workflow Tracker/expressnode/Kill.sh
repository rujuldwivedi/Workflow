#!/bin/bash
kill -9 $(sudo lsof -i:5000 | grep 'node' |  awk '{print $2}')

