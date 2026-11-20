# qa-jmeter

Prueba de rendimiento ligera con Apache JMeter (modo no GUI) contra la API del staging de Tactical Calendar
(Supabase REST/Auth). Es una demo de carga pequeña y respetuosa (5 usuarios virtuales x 10 iteraciones por
defecto): no es una prueba de estrés y no escribe datos.

| Caso | Qué mide | Umbral (p95) |
|---|---|---|
| PERF-01 Ping keep_alive | lectura simple pública | 800 ms |
| PERF-02 Lectura anónima de partidas (RLS) | consulta con políticas de seguridad | 800 ms |
| PERF-03 Lectura autenticada (jugador MAD) | login + consulta con RLS por rol (solo con `QA_PASSWORD`) | 1200 ms |

Cada caso pasa si no hay errores HTTP/aserciones y el percentil 95 de tiempos de respuesta no supera su umbral.

    THREADS=5 LOOPS=10 RAMPUP=5 QA_PASSWORD=... ./run.sh   # genera report/ (HTML) y result.json

Requisitos: JMeter 5.6+ (en el PATH o `JMETER_HOME`), Java 17+ y Node 22.
