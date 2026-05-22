from pyspark import SparkContext
import shutil
import os


def limpiar_directorio(path):
    """
    Elimina el directorio si ya existe para evitar
    errores de Spark al guardar resultados.
    """
    if os.path.exists(path):
        shutil.rmtree(path)


def main():

    # ==========================================
    # 1. Crear contexto Spark
    # ==========================================
    sc = SparkContext(appName="VentasRDD")

    # ==========================================
    # 2. Leer archivo de ventas
    # ==========================================
    archivo = "/home/vagrant/labSpark/dataset/ventas.txt"

    rdd = sc.textFile(archivo)

    # ==========================================
    # 3. Convertir cada línea a tupla
    #    (producto, precio, cantidad)
    # ==========================================
    ventas = rdd.map(lambda linea: linea.split(",")) \
                .map(lambda x: (
                    x[0],
                    float(x[1]),
                    int(x[2])
                ))

    # ==========================================
    # 4. Calcular total por producto
    # ==========================================
    totales_producto = ventas.map(
        lambda x: (x[0], x[1] * x[2])
    ).reduceByKey(
        lambda a, b: a + b
    )

    # ==========================================
    # 5. Calcular total de toda la tienda
    # ==========================================
    total_tienda = ventas.map(
        lambda x: x[1] * x[2]
    ).reduce(
        lambda a, b: a + b
    )

    # ==========================================
    # 6. Encontrar producto más vendido
    # ==========================================
    mas_vendido = totales_producto.sortBy(
        lambda x: x[1],
        ascending=False
    ).first()

    # ==========================================
    # 7. Mostrar resultados
    # ==========================================
    print("\n=== Totales por producto ===")
    for producto in totales_producto.collect():
        print(producto)

    print("\n=== Total tienda ===")
    print(total_tienda)

    print("\n=== Producto más vendido ===")
    print(mas_vendido)

    # ==========================================
    # 8. Definir rutas de salida
    # ==========================================
    base_resultados = "/home/vagrant/labSpark/ventasSpark/resultados/rdd"

    resultados_totales = f"{base_resultados}/totales_producto"
    resultados_total = f"{base_resultados}/total_tienda"
    resultados_mas_vendido = f"{base_resultados}/mas_vendido"

    # ==========================================
    # 9. Limpiar directorios si existen
    # ==========================================
    limpiar_directorio(resultados_totales)
    limpiar_directorio(resultados_total)
    limpiar_directorio(resultados_mas_vendido)

    # ==========================================
    # 10. Guardar resultados
    # ==========================================

    # Total por producto
    totales_producto.map(
        lambda x: f"{x[0]},{x[1]}"
    ).saveAsTextFile(resultados_totales)

    # Total tienda
    sc.parallelize(
        [f"Total tienda,{total_tienda}"]
    ).saveAsTextFile(resultados_total)

    # Producto más vendido
    sc.parallelize(
        [f"{mas_vendido[0]},{mas_vendido[1]}"]
    ).saveAsTextFile(resultados_mas_vendido)

    # ==========================================
    # 11. Cerrar SparkContext
    # ==========================================
    sc.stop()


if __name__ == "__main__":
    main()