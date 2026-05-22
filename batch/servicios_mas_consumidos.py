from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    year,
    month,
    col,
    sum,
    count,
    round,
    desc,
    row_number
)
from pyspark.sql.window import Window

def main():

    # =====================================
    # Crear sesión Spark
    # =====================================
    spark = SparkSession.builder \
        .appName("ServiciosMasConsumidos") \
        .getOrCreate()

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
    # Schema servicios
    # =====================================
    servicios_schema = StructType([
        StructField("id", IntegerType(), True),
        StructField("nombre", StringType(), True),
        StructField("descripcion", StringType(), True),
        StructField("precio", DoubleType(), True),
        StructField("disponibilidad", StringType(), True)
    ])

    # =====================================
    # Leer datasets
    # =====================================
    consumo = spark.read.csv(
        "hdfs://namenode:9000/datasets/consumo_servicio.csv",
        header=True,
        schema=consumo_schema
    )

    reservas = spark.read.csv(
        "hdfs://namenode:9000/datasets/reservas.csv",
        header=True,
        schema=reservas_schema
    )

    servicios = spark.read.csv(
        "hdfs://namenode:9000/datasets/servicios.csv",
        header=True,
        schema=servicios_schema
    )

    # =====================================
    # Excluir consumos anulados
    # =====================================
    consumo_valido = consumo.filter(
        col("anulado") == 0
    )

    # =====================================
    # Aliases
    # =====================================
    c = consumo_valido.alias("c")
    r = reservas.alias("r")
    s = servicios.alias("s")

    # =====================================
    # Join consumo + reservas
    # =====================================
    consumo_reservas = c.join(
        r,
        col("c.id_reserva") == col("r.id_reserva"),
        "inner"
    )

    # =====================================
    # Extraer año y mes
    # =====================================
    consumo_procesado = consumo_reservas \
        .withColumn("anio", year(col("r.fecha_inicio"))) \
        .withColumn("mes", month(col("r.fecha_inicio")))

    # =====================================
    # Join servicios
    # =====================================
    datos_completos = consumo_procesado.join(
        s,
        col("c.id_servicio") == col("s.id"),
        "inner"
    )

    # =====================================
    # Agrupar métricas
    # =====================================
    servicios_consumidos = datos_completos.groupBy(
        col("anio"),
        col("mes"),
        col("s.id"),
        col("s.nombre")
    ).agg(

        sum(col("c.cantidad"))
        .alias("total_consumido"),

        round(
            sum(
                col("c.precio_aplicado") * col("c.cantidad")
            ),
            2
        ).alias("ingresos_generados"),

        count(col("c.id_consumo"))
        .alias("veces_solicitado")

    )

    # =====================================
    # Window TOP 10 mensual
    # =====================================
    window_spec = Window.partitionBy(
        "anio",
        "mes"
    ).orderBy(
        desc("total_consumido")
    )

    top_servicios = servicios_consumidos \
        .withColumn(
            "ranking",
            row_number().over(window_spec)
        ).filter(
            col("ranking") <= 10
        ).orderBy(
            "anio",
            "mes",
            "ranking"
        )

    # =====================================
    # Mostrar resultados
    # =====================================
    print("\n=== TOP 10 SERVICIOS MAS CONSUMIDOS ===")

    top_servicios.show()

    # =====================================
    # Guardar resultados
    # =====================================
    top_servicios.coalesce(1) \
        .write \
        .mode("overwrite") \
        .option("header", True) \
        .csv("hdfs://namenode:9000/resultados/dashboard/servicios_mas_consumidos")

    # =====================================
    # Finalizar Spark
    # =====================================
    spark.stop()


if __name__ == "__main__":
    main()