# qa-jmeter

Prueba de rendimiento ligera con Apache JMeter (modo no GUI) contra la API del staging de Tactical Calendar
(Supabase REST/Auth). 16 casos (`PERF-01..16`) repartidos en las mismas 9 suites que Playwright (a-auth … i-normas).
Es una demo de carga pequeña y respetuosa (5 usuarios virtuales x 10 iteraciones por defecto): no es una prueba de estrés
y no escribe datos. Cada caso pasa si no hay errores y su percentil 95 no supera el umbral de `cases.json` (800 a 1500 ms).

El login de los 4 usuarios QA se hace una sola vez por ejecución (límite de Supabase Auth: 30 cada 5 min por IP).

    SUITE=b-eventos,i-normas THREADS=5 LOOPS=10 RAMPUP=5 QA_PASSWORD=... ./run.sh   # sin SUITE, las 9; genera report/ y result.json

Requisitos: JMeter 5.6+ (`JMETER_HOME` o `jmeter` en el PATH), Java 17+ y Node 22. En Windows, `run.sh` lanza el JAR
(`jmeter.bat` falla con rutas con espacios). `plan.jmx` y `cases.json` se generan con `ivan-qa-lab-shared/api-cases/gen-jmeter.js`.
