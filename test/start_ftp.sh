#!/bin/bash
mkdir -p ftp
cd ftp
python ../data/generate.py
python -m pyftpdlib
