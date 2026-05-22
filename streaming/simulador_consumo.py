import random
import time
import json
from datetime import datetime

# =====================================
# Cargar dataset UNA vez (sin Spark writes)
# =====================================
import pandas as pd

df = pd.read_csv("/data/datasets/consumo_servicio.csv")

df = df[df["anulado"] == 0]
datos = df.to_dict("records")

print("=====================================")
print("Simulador iniciado (modo ligero)")
print("Enviando eventos cada 10 segundos...")
print("=====================================")

while True:

    try:

        consumo = random.choice(datos)

        evento = {
            "id_consumo": int(consumo["id_consumo"]),
            "id_reserva": int(consumo["id_reserva"]),
            "id_huesped": int(consumo["id_huesped_reserva"]),
            "id_servicio": int(consumo["id_servicio"]),
            "nombre_servicio": str(consumo["nombre_servicio"]),
            "precio_aplicado": float(consumo["precio_aplicado"]),
            "cantidad": int(consumo["cantidad"]),
            "total": float(consumo["precio_aplicado"]) * int(consumo["cantidad"]),
            "timestamp": datetime.now().isoformat()
        }

        filename = f"/data/streaming/input/event_{int(time.time()*1000)}.json"

        with open(filename, "w") as f:
            json.dump(evento, f)

        print(
            f"Evento enviado -> "
            f"{evento['nombre_servicio']} | "
            f"Cantidad: {evento['cantidad']} | "
            f"Total: ${evento['total']}"
        )

    except Exception as e:
        print(f"ERROR generando evento: {e}")

    time.sleep(10)
