#!/bin/bash

echo "======================================="
echo "Sincronizando datos desde HDFS..."
echo "======================================="

# =====================================================
# RUTA LOCAL
# =====================================================

BASE_LOCAL=/data/dashboard

# =====================================================
# CREAR ESTRUCTURA
# =====================================================

mkdir -p $BASE_LOCAL/historico

# =====================================================
# LIMPIAR DATOS ANTERIORES
# =====================================================

echo "Limpiando datos anteriores..."

rm -rf $BASE_LOCAL/historico/*

# =====================================================
# HISTÓRICOS
# =====================================================

echo "Copiando datos históricos..."

for carpeta in \
ocupacion_hotelera \
ingresos_mensuales \
reservas_por_mes \
habitaciones_populares \
servicios_mas_consumidos \
tasa_cancelacion \
usuarios_frecuentes \
frecuencia_visitas
do

    echo "---------------------------------------"
    echo "Copiando: $carpeta"
    echo "---------------------------------------"

    hdfs dfs -test -e /resultados/dashboard/$carpeta

    if [ $? -eq 0 ]; then

        hdfs dfs -copyToLocal \
        /resultados/dashboard/$carpeta \
        $BASE_LOCAL/historico/

        echo "OK -> $carpeta copiado"

    else

        echo "No existe en HDFS: $carpeta"

    fi

done

echo "======================================="
echo "Sincronización completada"
echo "======================================="
