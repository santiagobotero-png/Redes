from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    count
)

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("HabitacionesPopulares") \
        .getOrCreate()

    # =====================================
    # Schema reservas
    # =====================================
    reservas_schema = StructType([
        StructField("id_reserva", IntegerType(), True),
        StructField("id_cliente", IntegerType(), True),
        StructField("id_habitacion", IntegerType(), True),
        StructField("fecha_inicio", DateType(), True),
        StructField("fecha_fin", DateType(), True),
        StructField("estado", StringType(), True),
        StructField("precio_total", DoubleType(), True)
    ])

    # =====================================
    # Schema habitaciones
    # =====================================
    habitaciones_schema = StructType([
        StructField("id", IntegerType(), True),
        StructField("numero_habitacion", IntegerType(), True),
        StructField("piso", IntegerType(), True),
        StructField("tipo", StringType(), True),
        StructField("capacidad", IntegerType(), True),
        StructField("precio", DoubleType(), True),
        StructField("estado", StringType(), True)
    ])

    # =====================================
    # Leer datasets
    # =====================================
    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=reservas_schema
    )

    habitaciones = spark.read.csv(
        "hdfs://namenode:9000/datasets/habitaciones.csv",
        header=True,
        schema=habitaciones_schema
    )

    # =====================================
    # Filtrar canceladas
    # =====================================
    reservas_validas = reservas.filter(
        col("estado") != "cancelada"
    )

    # =====================================
    # Extraer año y mes
    # =====================================
    reservas_procesadas = reservas_validas \
        .withColumn("anio", year(col("fecha_inicio"))) \
        .withColumn("mes", month(col("fecha_inicio")))

    # =====================================
    # Contar reservas por habitación
    # =====================================
    habitaciones_populares = reservas_procesadas.groupBy(
        "anio",
        "mes",
        "id_habitacion"
    ).agg(
        count("id_reserva").alias("total_reservas")
    )

    # =====================================
    # Join con habitaciones
    # =====================================
    resultado = habitaciones_populares.join(
        habitaciones,
        habitaciones_populares.id_habitacion == habitaciones.id,
        "inner"
    ).select(
        "anio",
        "mes",
        "numero_habitacion",
        "tipo",
        "piso",
        "capacidad",
        "precio",
        "total_reservas"
    ).orderBy(
        col("anio"),
        col("mes"),
        col("total_reservas").desc()
    )

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== HABITACIONES MAS RESERVADAS ===")

    resultado.show()

    # =====================================
    # Guardar resultados
    # =====================================
    resultado.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/habitaciones_populares")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()