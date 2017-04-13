#!/bin/bash
mkdir -p ftp
cd ftp
python ../data/generate.py
python -m pyftpdlib -n 172.17.0.1 -r 6000-6000
