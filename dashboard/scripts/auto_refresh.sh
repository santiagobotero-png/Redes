#!/bin/bash

echo "================================="
echo "INICIANDO AUTO REFRESH DASHBOARD"
echo "================================="

while true
do
    echo ""
    echo "Sincronizando HDFS..."

    bash sync_hdfs.sh

    echo ""
    echo "Consolidando streaming..."

    python3 consolidar_streaming.py

    echo ""
    echo "Esperando 20 segundos..."

    sleep 20

done
