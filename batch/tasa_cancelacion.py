from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    count,
    when,
    round
)

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("TasaCancelacion") \
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
    # Leer dataset
    # =====================================
    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=reservas_schema
    )

    # =====================================
    # Extraer año y mes
    # =====================================
    reservas_procesadas = reservas \
        .withColumn("anio", year(col("fecha_inicio"))) \
        .withColumn("mes", month(col("fecha_inicio")))

    # =====================================
    # Calcular tasa cancelación
    # =====================================
    tasa_cancelacion = reservas_procesadas.groupBy(
        "anio",
        "mes"
    ).agg(

        # Total reservas
        count("id_reserva").alias("total_reservas"),

        # Reservas canceladas
        count(
            when(
                col("estado") == "cancelada",
                True
            )
        ).alias("reservas_canceladas")

    )

    # =====================================
    # Calcular porcentaje
    # =====================================
    tasa_cancelacion_final = tasa_cancelacion.withColumn(
        "tasa_cancelacion",
        round(
            (
                col("reservas_canceladas") /
                col("total_reservas")
            ) * 100,
            2
        )
    ).orderBy("anio", "mes")

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== TASA DE CANCELACION ===")

    tasa_cancelacion_final.show()

    # =====================================
    # Guardar resultados
    # =====================================
    tasa_cancelacion_final.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/tasa_cancelacion")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()