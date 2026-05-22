import os
import pandas as pd

# ==========================================
# RUTAS
# ==========================================

BASE_PATH = "/data/streaming"

SERVICIOS_PATH = f"{BASE_PATH}/output/servicios_top"

ACTIVIDAD_PATH = f"{BASE_PATH}/output/actividad_tiempo_real"

OUTPUT_PATH = f"{BASE_PATH}/consolidado"

os.makedirs(OUTPUT_PATH, exist_ok=True)

# ==========================================
# FUNCIÓN
# EXTRAER WINDOW END
# ==========================================

def extraer_window_end(window_obj):

    return pd.to_datetime(window_obj["end"])

# ==========================================
# FUNCIÓN
# LEER PARQUETS VÁLIDOS
# ==========================================

def leer_parquets_validos(path, limite=30):

    dataframes = []

    archivos = [
        f"{path}/{f}"
        for f in os.listdir(path)
        if f.endswith(".parquet")
    ]

    # Ordenar por fecha modificación (más recientes primero)
    archivos.sort(
        key=os.path.getmtime,
        reverse=True
    )

    # Tomar solo los más recientes
    archivos = archivos[:limite]

    print(f"Parquets recientes encontrados: {len(archivos)}")

    for ruta_completa in archivos:

        archivo = os.path.basename(ruta_completa)

        try:

            # Ignorar archivos sospechosamente pequeños
            if os.path.getsize(ruta_completa) < 100:

                print(f"[IGNORADO] {archivo}")
                continue

            df = pd.read_parquet(ruta_completa)

            dataframes.append(df)

            print(f"[OK] {archivo}")

        except Exception as e:

            print(f"[ERROR] {archivo}")
            print(e)

    if not dataframes:

        return pd.DataFrame()

    return pd.concat(dataframes, ignore_index=True)

# ==========================================
# CONSOLIDAR SERVICIOS
# ==========================================

print("===================================")
print("LEYENDO SERVICIOS TOP")
print("===================================")

df_servicios = leer_parquets_validos(
    SERVICIOS_PATH
)

if df_servicios.empty:

    print("No hay datos válidos en servicios_top")
    exit()

print(f"Registros servicios: {len(df_servicios)}")

# Extraer window_end
df_servicios["window_end"] = df_servicios[
    "window"
].apply(extraer_window_end)

# Última ventana
ultima_ventana = df_servicios[
    "window_end"
].max()

print(f"Última ventana: {ultima_ventana}")

# Filtrar última ventana
df_servicios_actual = df_servicios[
    df_servicios["window_end"] == ultima_ventana
]

# Ordenar
df_servicios_actual = df_servicios_actual.sort_values(
    by="total_consumido",
    ascending=False
)

# Guardar snapshot
output_servicios = (
    f"{OUTPUT_PATH}/servicios_top_actual.parquet"
)

df_servicios_actual.to_parquet(
    output_servicios,
    index=False
)

print(f"Snapshot guardado:")
print(output_servicios)

# ==========================================
# CONSOLIDAR ACTIVIDAD
# ==========================================

print("===================================")
print("LEYENDO ACTIVIDAD")
print("===================================")

df_actividad = leer_parquets_validos(
    ACTIVIDAD_PATH
)

if df_actividad.empty:

    print("No hay datos válidos en actividad")
    exit()

print(f"Registros actividad: {len(df_actividad)}")

# Extraer window_end
df_actividad["window_end"] = df_actividad[
    "window"
].apply(extraer_window_end)

# Última ventana
ultima_actividad = df_actividad[
    "window_end"
].max()

print(f"Última ventana: {ultima_actividad}")

# Filtrar última ventana
df_actividad_actual = df_actividad[
    df_actividad["window_end"] == ultima_actividad
]

# Guardar snapshot
output_actividad = (
    f"{OUTPUT_PATH}/actividad_actual.parquet"
)

df_actividad_actual.to_parquet(
    output_actividad,
    index=False
)

print(f"Snapshot guardado:")
print(output_actividad)

print("===================================")
print("CONSOLIDACIÓN COMPLETADA")
print("===================================")
