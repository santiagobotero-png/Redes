from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    count,
    avg,
    datediff,
    round,
    countDistinct
)

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("FrecuenciaVisitas") \
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
    # Schema huesped_reserva
    # =====================================
    huesped_schema = StructType([
        StructField("id_huesped_reserva", IntegerType(), True),
        StructField("id_reserva", IntegerType(), True),
        StructField("id_cliente", IntegerType(), True),
        StructField("rol", StringType(), True)
    ])

    # =====================================
    # Schema usuarios
    # =====================================
    usuarios_schema = StructType([
        StructField("id", IntegerType(), True),
        StructField("username", StringType(), True),
        StructField("password", StringType(), True),
        StructField("email", StringType(), True),
        StructField("nombre_completo", StringType(), True),
        StructField("rol", StringType(), True),
        StructField("activo", IntegerType(), True),
        StructField("fecha_registro", TimestampType(), True)
    ])

    # =====================================
    # Leer datasets
    # =====================================
    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=reservas_schema
    )

    huespedes = spark.read.csv(
        "hdfs://namenode:9000/datasets/huesped_reserva.csv",
        header=True,
        schema=huesped_schema
    )

    usuarios = spark.read.csv(
        "hdfs://namenode:9000/datasets/usuarios.csv",
        header=True,
        schema=usuarios_schema
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
        .withColumn("mes", month(col("fecha_inicio"))) \
        .withColumn(
            "dias_estadia",
            datediff(col("fecha_fin"), col("fecha_inicio"))
        )

    # =====================================
    # Aliases
    # =====================================
    r = reservas_procesadas.alias("r")
    h = huespedes.alias("h")
    u = usuarios.alias("u")

    # =====================================
    # Join reservas + huéspedes
    # =====================================
    reservas_huespedes = r.join(
        h,
        col("r.id_reserva") == col("h.id_reserva"),
        "inner"
    )

    # =====================================
    # Join usuarios
    # =====================================
    datos_completos = reservas_huespedes.join(
        u,
        col("h.id_cliente") == col("u.id"),
        "inner"
    )

    # =====================================
    # Calcular frecuencia visitas
    # =====================================
    frecuencia_visitas = datos_completos.groupBy(
        col("r.anio"),
        col("r.mes"),
        col("u.id"),
        col("u.nombre_completo")
    ).agg(

        count("h.id_huesped_reserva")
        .alias("total_visitas"),

        countDistinct("r.id_reserva")
        .alias("reservas_distintas"),

        round(
            avg("r.dias_estadia"),
            2
        ).alias("promedio_dias_estadia")

    ).orderBy(
        col("anio"),
        col("mes"),
        col("total_visitas").desc()
    )

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== FRECUENCIA DE VISITAS ===")

    frecuencia_visitas.show()

    # =====================================
    # Guardar resultados
    # =====================================
    frecuencia_visitas.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/frecuencia_visitas")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()