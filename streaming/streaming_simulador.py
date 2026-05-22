from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import (
    col,
    sum,
    count,
    window,
    to_timestamp,
    round
)

# =====================================
# Spark Session
# =====================================
spark = SparkSession.builder \
    .appName("StreamingConsumosHotel") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

spark.sparkContext.setLogLevel("ERROR")

# =====================================
# Schema
# =====================================
schema = StructType([
    StructField("id_consumo", IntegerType(), True),
    StructField("id_reserva", IntegerType(), True),
    StructField("id_huesped", IntegerType(), True),
    StructField("id_servicio", IntegerType(), True),
    StructField("nombre_servicio", StringType(), True),
    StructField("precio_aplicado", DoubleType(), True),
    StructField("cantidad", IntegerType(), True),
    StructField("total", DoubleType(), True),
    StructField("timestamp", StringType(), True)
])

# =====================================
# Stream input (NFS / HDFS mount)
# =====================================
stream_df = spark.readStream \
    .schema(schema) \
    .json("/data/streaming/input")

# =====================================
# Timestamp handling
# =====================================
stream_df = stream_df.withColumn(
    "evento_timestamp",
    to_timestamp(col("timestamp"))
).withWatermark(
    "evento_timestamp",
    "1 minute"
)

# =====================================
# MÉTRICA 1: Servicios más consumidos
# =====================================
servicios_top = stream_df.groupBy(
    window(col("evento_timestamp"), "1 minute"),
    col("nombre_servicio")
).agg(
    sum("cantidad").alias("total_consumido"),
    round(sum("total"), 2).alias("ingresos_generados")
)

# =====================================
# MÉTRICA 2: Actividad en tiempo real
# =====================================
actividad_tiempo_real = stream_df.groupBy(
    window(col("evento_timestamp"), "1 minute")
).agg(
    count("*").alias("total_eventos"),
    round(sum("total"), 2).alias("ingresos_totales")
)

# =====================================
# QUERY 1: Console - servicios
# =====================================
query_servicios_console = servicios_top.writeStream \
    .outputMode("update") \
    .format("console") \
    .option("truncate", False) \
    .option("checkpointLocation", "/data/streaming/checkpoint/servicios_console") \
    .start()

# =====================================
# QUERY 2: Console - actividad
# =====================================
query_actividad_console = actividad_tiempo_real.writeStream \
    .outputMode("update") \
    .format("console") \
    .option("truncate", False) \
    .option("checkpointLocation", "/data/streaming/checkpoint/actividad_console") \
    .start()

# =====================================
# QUERY 3: Parquet - servicios
# =====================================
query_servicios_parquet = servicios_top.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/data/streaming/output/servicios_top") \
    .option("checkpointLocation", "/data/streaming/checkpoint/servicios_parquet") \
    .start()

# =====================================
# QUERY 4: Parquet - actividad
# =====================================
query_actividad_parquet = actividad_tiempo_real.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/data/streaming/output/actividad_tiempo_real") \
    .option("checkpointLocation", "/data/streaming/checkpoint/actividad_parquet") \
    .start()

# =====================================
# Keep alive
# =====================================
spark.streams.awaitAnyTermination()
