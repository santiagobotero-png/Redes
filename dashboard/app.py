import streamlit as st
import pandas as pd
import glob
import os

from streamlit_autorefresh import st_autorefresh

# ======================================================
# CONFIGURACIÓN PRINCIPAL
# ======================================================

st.set_page_config(
    page_title="Dashboard Hotelero Big Data",
    layout="wide"
)

# ======================================================
# AUTO REFRESH
# ======================================================

st_autorefresh(
    interval=20000,
    key="dashboard_refresh"
)

# ======================================================
# TÍTULO
# ======================================================

st.title("🏨 Dashboard Hotelero Big Data")
st.markdown("---")

# ======================================================
# RUTA BASE
# ======================================================

BASE = "/data/dashboard"

# ======================================================
# FUNCIONES AUXILIARES
# ======================================================

def cargar_csv(ruta):

    archivos = glob.glob(
        os.path.join(ruta, "part-*.csv")
    )

    if not archivos:

        st.warning(
            f"No se encontraron archivos en: {ruta}"
        )

        return pd.DataFrame()

    dfs = []

    for archivo in archivos:

        try:

            df = pd.read_csv(archivo)
            dfs.append(df)

        except Exception as e:

            st.error(
                f"Error leyendo CSV {archivo}: {e}"
            )

    if not dfs:
        return pd.DataFrame()

    return pd.concat(
        dfs,
        ignore_index=True
    )

# ======================================================
# CARGA DATOS HISTÓRICOS
# ======================================================

df_ocupacion = cargar_csv(
    f"{BASE}/ocupacion_hotelera"
)



df_ingresos = cargar_csv(
    f"{BASE}/ingresos_mensuales"
)


df_reservas = cargar_csv(
    f"{BASE}/reservas_por_mes"
)


df_servicios = cargar_csv(
    f"{BASE}/servicios_mas_consumidos"
)

df_cancelacion = cargar_csv(
    f"{BASE}/tasa_cancelacion"
)

df_usuarios = cargar_csv(
    f"{BASE}/usuarios_frecuentes"
)

df_habitaciones = cargar_csv(
    f"{BASE}/habitaciones_populares"
)

df_visitas = cargar_csv(
    f"{BASE}/frecuencia_visitas"
)

# ======================================================
# KPIs PRINCIPALES
# ======================================================

st.header("📌 Indicadores Principales")

col1, col2, col3, col4 = st.columns(4)

# ======================================================
# KPI 1 - OCUPACIÓN
# ======================================================

with col1:

    if not df_ocupacion.empty:

        try:

            ocupacion = round(
                df_ocupacion[
                    "ocupacion_porcentaje"
                ].mean(),
                2
            )

            st.metric(
                "🏨 Ocupación Hotelera",
                f"{ocupacion}%"
            )

        except Exception as e:

            st.error(e)

    else:

        st.metric(
            "🏨 Ocupación Hotelera",
            "Sin datos"
        )

# ======================================================
# KPI 2 - INGRESOS
# ======================================================

with col2:

    if not df_ingresos.empty:

        try:

            ingresos = round(
                df_ingresos[
                    "ingresos_totales"
                ].sum(),
                2
            )

            st.metric(
                "💰 Ingresos Totales",
                f"${ingresos}"
            )

        except Exception as e:

            st.error(e)

    else:

        st.metric(
            "💰 Ingresos Totales",
            "Sin datos"
        )

# ======================================================
# KPI 3 - CANCELACIÓN
# ======================================================

with col3:

    if not df_cancelacion.empty:

        try:

            cancelacion = round(
                df_cancelacion[
                    "tasa_cancelacion"
                ].mean(),
                2
            )

            st.metric(
                "❌ Tasa Cancelación",
                f"{cancelacion}%"
            )

        except Exception as e:

            st.error(e)

    else:

        st.metric(
            "❌ Tasa Cancelación",
            "Sin datos"
        )

# ======================================================
# KPI 4 - USUARIOS
# ======================================================

with col4:

    if not df_usuarios.empty:

        try:

            usuarios = len(df_usuarios)

            st.metric(
                "👥 Usuarios Frecuentes",
                usuarios
            )

        except Exception as e:

            st.error(e)

    else:

        st.metric(
            "👥 Usuarios Frecuentes",
            "Sin datos"
        )

# ======================================================
# ANALÍTICA HISTÓRICA
# ======================================================

st.markdown("---")
st.header("📊 Analítica Histórica")

# ======================================================
# FILA 1
# ======================================================

col5, col6 = st.columns(2)

# ======================================================
# RESERVAS POR MES
# ======================================================

with col5:

    st.subheader("📅 Reservas por Mes")

    if not df_reservas.empty:

        try:

            st.bar_chart(
                data=df_reservas,
                x="mes",
                y="total_reservas"
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de reservas"
        )

# ======================================================
# INGRESOS MENSUALES
# ======================================================

with col6:

    st.subheader("💵 Ingresos Mensuales")

    if not df_ingresos.empty:

        try:

            st.line_chart(
                data=df_ingresos,
                x="mes",
                y="ingresos_totales"
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de ingresos"
        )

# ======================================================
# FILA 2
# ======================================================

col7, col8 = st.columns(2)

# ======================================================
# HABITACIONES POPULARES
# ======================================================

with col7:

    st.subheader(
        "🛏️ Habitaciones Más Populares"
    )

    if not df_habitaciones.empty:

        try:

            st.bar_chart(
                data=df_habitaciones,
                x="tipo",
                y="total_reservas"
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de habitaciones"
        )

# ======================================================
# SERVICIOS MÁS CONSUMIDOS
# ======================================================

with col8:

    st.subheader(
        "🍽️ Servicios Más Consumidos"
    )

    if not df_servicios.empty:

        try:

            st.bar_chart(
                data=df_servicios,
                x="nombre",
                y="total_consumido"
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de servicios"
        )

# ======================================================
# FILA 3
# ======================================================

col9, col10 = st.columns(2)

# ======================================================
# FRECUENCIA VISITAS
# ======================================================

with col9:

    st.subheader(
        "🔁 Frecuencia de Visitas"
    )

    if not df_visitas.empty:

        try:

            st.bar_chart(
                data=df_visitas,
                x="nombre_completo",
                y="total_visitas"
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de visitas"
        )

# ======================================================
# USUARIOS FRECUENTES
# ======================================================

with col10:

    st.subheader(
        "⭐ Top Usuarios Frecuentes"
    )

    if not df_usuarios.empty:

        try:

            st.dataframe(
                df_usuarios.head(10),
                use_container_width=True
            )

        except Exception as e:

            st.error(e)

    else:

        st.warning(
            "No hay datos de usuarios"
        )

# ======================================================
# FOOTER
# ======================================================

st.markdown("---")

st.caption(
    "Dashboard Big Data Hotelero | "
    "Spark + HDFS + Streamlit"
)
