from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    sum,
    round,
    coalesce,
    lit
)

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("IngresosMensuales") \
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
    # Schema consumo_servicio
    # =====================================
    consumo_schema = StructType([
        StructField("id_consumo", IntegerType(), True),
        StructField("id_reserva", IntegerType(), True),
        StructField("id_huesped_reserva", IntegerType(), True),
        StructField("id_servicio", IntegerType(), True),
        StructField("nombre_servicio", StringType(), True),
        StructField("precio_aplicado", DoubleType(), True),
        StructField("cantidad", IntegerType(), True),
        StructField("anulado", IntegerType(), True),
        StructField("pagado", IntegerType(), True)
    ])

    # =====================================
    # Leer datasets
    # =====================================
    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=reservas_schema
    )

    consumo = spark.read.csv(
        "hdfs://namenode:9000/datasets/consumo_servicio.csv",
        header=True,
        schema=consumo_schema
    )

    # =====================================
    # Reservas válidas
    # =====================================
    reservas_validas = reservas.filter(
        col("estado") != "cancelada"
    )

    # =====================================
    # Procesar reservas
    # =====================================
    reservas_procesadas = reservas_validas \
        .withColumn("anio", year(col("fecha_inicio"))) \
        .withColumn("mes", month(col("fecha_inicio")))

    # =====================================
    # Ingresos por reservas
    # =====================================
    ingresos_reservas = reservas_procesadas.groupBy(
        "anio",
        "mes"
    ).agg(
        round(
            sum("precio_total"),
            2
        ).alias("ingresos_reservas")
    )

    # =====================================
    # Consumos válidos
    # =====================================
    consumo_valido = consumo.filter(
        col("anulado") == 0
    )

    # =====================================
    # Join consumo + reservas
    # =====================================
    consumo_reservas = consumo_valido.join(
        reservas_procesadas.select(
            "id_reserva",
            "anio",
            "mes"
        ),
        "id_reserva",
        "inner"
    )

    # =====================================
    # Ingresos servicios
    # =====================================
    ingresos_servicios = consumo_reservas.groupBy(
        "anio",
        "mes"
    ).agg(
        round(
            sum(
                col("precio_aplicado") * col("cantidad")
            ),
            2
        ).alias("ingresos_servicios")
    )

    # =====================================
    # Join ingresos
    # =====================================
    ingresos_totales = ingresos_reservas.join(
        ingresos_servicios,
        ["anio", "mes"],
        "outer"
    ).fillna(0)

    # =====================================
    # Calcular total
    # =====================================
    ingresos_finales = ingresos_totales.withColumn(
        "ingresos_totales",
        round(
            col("ingresos_reservas") +
            col("ingresos_servicios"),
            2
        )
    ).orderBy(
        "anio",
        "mes"
    )

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== INGRESOS MENSUALES ===")

    ingresos_finales.show()

    # =====================================
    # Guardar resultados
    # =====================================
    ingresos_finales.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/ingresos_mensuales")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()