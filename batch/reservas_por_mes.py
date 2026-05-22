from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import year, month, col

def main():

    # =========================
    # Crear sesión Spark
    # =========================
    spark = SparkSession.builder \
        .appName("ReservasPorMes") \
        .getOrCreate()

    # =========================
    # Definir schema explícito
    # =========================
    schema = StructType([
        StructField("id_reserva", IntegerType(), True),
        StructField("id_cliente", IntegerType(), True),
        StructField("id_habitacion", IntegerType(), True),
        StructField("fecha_inicio", DateType(), True),
        StructField("fecha_fin", DateType(), True),
        StructField("estado", StringType(), True),
        StructField("precio_total", DoubleType(), True)
    ])

    # =========================
    # Leer dataset
    # =========================
    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=schema
    )

    # =========================
    # Crear columnas temporales
    # =========================
    reservas_procesadas = reservas \
        .withColumn("anio", year(col("fecha_inicio"))) \
        .withColumn("mes", month(col("fecha_inicio")))

    # =========================
    # Crear vista SQL
    # =========================
    reservas_procesadas.createOrReplaceTempView("reservas")

    # =========================
    # Consulta SQL
    # =========================
    reservas_por_mes = spark.sql("""
        SELECT
            anio,
            mes,
            COUNT(id_reserva) AS total_reservas
        FROM reservas
        GROUP BY anio, mes
        ORDER BY anio, mes
    """)

    # =========================
    # Mostrar resultados
    # =========================
    print("\n=== RESERVAS POR MES ===")
    reservas_por_mes.show()

    # =========================
    # Guardar resultados
    # =========================
    reservas_por_mes.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/reservas_por_mes")

    # =========================
    # Finalizar Spark
    # =========================
    spark.stop()


if __name__ == "__main__":
    main()