from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    countDistinct,
    round
)

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("OcupacionHotelera") \
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
    # Excluir canceladas
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
    # Calcular total habitaciones
    # =====================================
    total_habitaciones = habitaciones.count()

    # =====================================
    # Habitaciones ocupadas por mes
    # =====================================
    ocupacion = reservas_procesadas.groupBy(
        "anio",
        "mes"
    ).agg(
        countDistinct("id_habitacion")
        .alias("habitaciones_ocupadas")
    )

    # =====================================
    # Calcular porcentaje ocupación
    # =====================================
    ocupacion_final = ocupacion.withColumn(
        "total_habitaciones",
        col("habitaciones_ocupadas") * 0 + total_habitaciones
    ).withColumn(
        "ocupacion_porcentaje",
        round(
            (
                col("habitaciones_ocupadas") /
                col("total_habitaciones")
            ) * 100,
            2
        )
    ).orderBy("anio", "mes")

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== OCUPACION HOTELERA ===")

    ocupacion_final.show()

    # =====================================
    # Guardar resultados
    # =====================================
    ocupacion_final.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/ocupacion_hotelera")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()