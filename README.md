# Plataforma Hotelera Distribuida con Microservicios y Big Data

## Descripción General

Este proyecto consiste en una plataforma hotelera distribuida desarrollada bajo una arquitectura de microservicios, cuyo objetivo principal fue simular un entorno real de gestión hotelera aplicando tecnologías modernas de infraestructura, contenerización y procesamiento de datos.

El sistema fue diseñado inicialmente para implementar y desplegar microservicios independientes encargados de diferentes dominios funcionales del hotel, incluyendo la gestión de usuarios, reservas, habitaciones y servicios. Cada microservicio cuenta con su propia base de datos SQL, siguiendo principios de desacoplamiento y escalabilidad propios de arquitecturas distribuidas.

Posteriormente, el proyecto evolucionó hacia una infraestructura más completa orientada al despliegue distribuido y al procesamiento analítico de datos. Para ello se integraron tecnologías como Docker Swarm para la orquestación de contenedores, HAProxy como balanceador de carga y herramientas Big Data como Apache Hadoop y Apache Spark para el almacenamiento y procesamiento distribuido de información.

La plataforma permite:

- Registrar usuarios.
- Crear habitaciones y servicios hoteleros.
- Gestionar reservas.
- Calcular costos de hospedaje por noche.
- Calcular consumos adicionales de servicios.
- Generar información consolidada para procesos analíticos.

Como complemento analítico, se desarrolló un dashboard interactivo utilizando Streamlit, alimentado mediante procesamiento batch realizado con Apache Spark sobre datos almacenados en Hadoop HDFS. Los datasets utilizados durante las pruebas y simulaciones fueron de carácter sintético.

El sistema fue desarrollado en el contexto académico de la asignatura Redes e Infraestructura del programa de Ingeniería de Datos e Inteligencia Artificial de la Universidad Autónoma de Occidente.

---

# Tecnologías Utilizadas

## Infraestructura y Contenerización

- Docker
- Docker Swarm
- HAProxy
- Vagrant
- VirtualBox

## Backend y Microservicios

- Node.js
- Express.js
- MySQL

## Big Data y Procesamiento Distribuido

- Apache Hadoop HDFS
- Apache Spark

## Visualización y Analítica

- Streamlit
- Python
- Pandas

## Frontend

- HTML5
- CSS3
- JavaScript

---

# Arquitectura General

```text
Usuario
   │
   ▼
HAProxy
   │
   ├── Frontend
   │
   ├── Microservicio Usuarios
   ├── Microservicio Servicios
   └── Microservicio Órdenes
            │
            ▼
         MySQL

Datasets CSV
      │
      ▼
 Hadoop HDFS
      │
      ▼
 Apache Spark
      │
      ▼
 Dashboard Streamlit

```

---

## Estructura del Proyecto
```text
hotel-platform/
│
├── batch/
│   ├── frecuencia_de_visitas.py
│   ├── habitaciones_populares.py
│   ├── ingresos_mensuales.py
│   ├── ocupacion_hotel.py
│   ├── reservas_por_mes.py
│   ├── servicios_mas_consumidos.py
│   ├── tasa_cancelacion.py
│   └── usuarios_frecuentes.py
│
├── capasFront/
│   ├── Dockerfile
│   ├── index.html
│   ├── login.html
│   ├── login.js
│   ├── ordenes/
│   ├── servicios/
│   └── usuarios/
│
├── dashboard/
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── scripts/
│   └── data/
│       ├── historico/
│       └── streaming/
│
├── datasets/
│   ├── consumo_servicio.csv
│   ├── habitaciones.csv
│   ├── huesped_reserva.csv
│   ├── reservas.csv
│   ├── servicios.csv
│   └── usuarios.csv
│
├── haproxy/
│   ├── Dockerfile
│   └── haproxy.cfg
│
├── microservicios/
│   ├── docker-compose.yml
│   ├── docker-stack.yml
│   ├── mysql_ordenes/
│   ├── mysql_servicios/
│   ├── mysql_usuarios/
│   ├── ordenes/
│   ├── servicios/
│   └── usuarios/
│
├── streaming/
│
└── stack.yml

```

---

## Infraestructura Virtual

El proyecto fue desarrollado utilizando dos máquinas virtuales Ubuntu 22.04 desplegadas mediante Vagrant y VirtualBox.

```text
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  if Vagrant.has_plugin? "vagrant-vbguest"
    config.vbguest.no_install = true
    config.vbguest.auto_update = false
    config.vbguest.no_remote = true
  end

  config.vm.boot_timeout = 600

  # =====================================================
  # CONFIGURACIÓN: SERVIDOR UBUNTU 1
  # =====================================================
  config.vm.define :servidorUbuntu1 do |servidorUbuntu1|
    servidorUbuntu1.vm.box = "bento/ubuntu-22.04"
    servidorUbuntu1.vm.network :private_network, ip: "192.168.100.2"
    servidorUbuntu1.vm.hostname = "servidorUbuntu1"
    servidorUbuntu1.vm.box_download_insecure = true

    servidorUbuntu1.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "6144"
      vb.cpus = "3"
      vb.customize ["modifyvm", :id, "--hwvirtex", "on"]
    end
  end

  # =====================================================
  # CONFIGURACIÓN: SERVIDOR UBUNTU 2
  # =====================================================
  config.vm.define :servidorUbuntu2 do |servidorUbuntu2|
    servidorUbuntu2.vm.box = "bento/ubuntu-22.04"
    servidorUbuntu2.vm.network :private_network, ip: "192.168.100.3"
    servidorUbuntu2.vm.hostname = "servidorUbuntu2"
    servidorUbuntu2.vm.box_download_insecure = true

    servidorUbuntu2.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "1024"
      vb.cpus = "1"
    end
  end
end

```

---

# Clonar el Repositorio

Clonar el proyecto desde GitHub:

```bash
git clone https://github.com/santiagobotero-png/Redes.git
```
Ingresar a la carpeta del proyecto

```
cd Redes
```

---
# Instalación y Despliegue

## Requisitos Previos
Antes de iniciar el proyecto es necesario contar con:

## VirtualBox
Vagrant
Docker
Docker Swarm
Git

## Versiones Utilizadas
Ubuntu 22.04.5 LTS
Docker 29.3.1
Apache Spark 3.5.1
Hadoop 3.2.1
Python 3.10

## Inicialización de Máquinas Virtuales
vagrant up

## Acceder a las máquinas virtuales:
vagrant ssh servidorUbuntu1
vagrant ssh servidorUbuntu2


# Configuración de Docker Swarm

## Inicializar Swarm en el nodo manager

Desde servidorUbuntu1 ejecutar:
docker swarm init --advertise-addr 192.168.100.2

El comando generará un token similar a:
docker swarm join --token <TOKEN> 192.168.100.2:2377


Unir nodo worker al clúster

Desde servidorUbuntu2 ejecutar el comando generado anteriormente:
docker swarm join --token <TOKEN> 192.168.100.2:2377

## Verificar nodos del clúster

Desde el manager:
docker node ls

Debe visualizarse:
servidorUbuntu1 como Leader
servidorUbuntu2 como Ready

Despliegue del Stack
Ubicarse en la carpeta raíz del proyecto:
cd /vagrant/hotel-platform

Desplegar todos los servicios:
docker stack deploy -c stack.yml hotel

Verificar servicios:
docker service ls

Verificar contenedores:
docker ps


# Verificación de Hadoop HDFS

## Ingresar al contenedor del NameNode:
sudo docker exec -it $(sudo docker ps -qf name=namenode) bash

## Verificar estado de HDFS:
hdfs dfsadmin -report

## Salir del modo seguro si es necesario:
hdfs dfsadmin -safemode leave

# Carga de Datasets en HDFS

## Crear directorios en HDFS:
hdfs dfs -mkdir -p /datasets
hdfs dfs -mkdir -p /resultados/dashboard

## Copiar datasets al contenedor NameNode:
sudo docker cp ~/hotel-platform/datasets/. $(sudo docker ps -qf name=namenode):/tmp/datasets

## Ingresar al contenedor:
sudo docker exec -it $(sudo docker ps -qf name=namenode) bash

## Subir datasets a HDFS:
hdfs dfs -put /tmp/datasets/* /datasets/

## Verificar archivos:
hdfs dfs -ls /datasets




# Ejecución de Procesamiento Batch con Spark

## Ingresar al contenedor Spark Master:
sudo docker exec -it $(sudo docker ps -qf name=spark-master) bash

## Copiar scripts batch al contenedor:
sudo docker cp ~/hotel-platform/batch/frecuencia_de_visitas.py $(sudo docker ps -qf name=spark-master):/batch/

## Ejecutar procesamiento:
spark-submit /batch/frecuencia_de_visitas.py

El mismo procedimiento aplica para los demás scripts batch:
habitaciones_populares.py
ingresos_mensuales.py
ocupacion_hotel.py
reservas_por_mes.py
servicios_mas_consumidos.py
tasa_cancelacion.py
usuarios_frecuentes.py


# Flujo de Procesamiento Analítico

Los datasets CSV son cargados en Hadoop HDFS.
Apache Spark ejecuta procesamiento batch sobre los datos.
Los resultados se almacenan nuevamente en HDFS.
Los archivos procesados son transferidos manualmente al dashboard.
Streamlit consume los resultados para generar visualizaciones analíticas.

# Acceso a Servicios

Frontend principal
http://192.168.100.2

Dashboard Analítico
http://192.168.100.2:8501

Spark Master UI
http://192.168.100.2:8080

Hadoop NameNode UI
http://192.168.100.2:9870


# Balanceo de Carga

El sistema utiliza HAProxy como balanceador de carga para distribuir tráfico entre réplicas de microservicios desplegadas mediante Docker Swarm.

Los servicios balanceados incluyen:

Usuarios
Reservas
Habitaciones y servicios


# Estado Actual del Proyecto

## Funcionalidades Implementadas
Arquitectura basada en microservicios.
Balanceo de carga con HAProxy.
Orquestación distribuida con Docker Swarm.
Persistencia mediante bases de datos MySQL independientes.
Procesamiento batch con Apache Spark.
Almacenamiento distribuido con Hadoop HDFS.
Dashboard analítico interactivo con Streamlit.

## Funcionalidades Experimentales
Procesamiento streaming.
Automatización del dashboard.
Sincronización automática entre HDFS y Streamlit.

Limitaciones Conocidas
La actualización del dashboard es manual.
Los resultados batch deben transferirse manualmente desde HDFS.
El módulo streaming no quedó completamente integrado.
