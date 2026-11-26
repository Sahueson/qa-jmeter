#!/usr/bin/env bash
# Prueba de carga ligera con JMeter (modo no GUI) contra el staging y result.json en el formato del lab.
#   SUITE=a-auth[,b-eventos...] (por defecto todas)  THREADS=5 LOOPS=10 RAMPUP=5  ./run.sh
# Necesita JMeter 5.6+ (JMETER_HOME o `jmeter` en el PATH), Java 17+ y Node 22.
# Sin QA_PASSWORD no se mide el caso autenticado. Son lecturas (GET) y un login por usuario virtual:
# no modifican datos, así que no hace falta reservar ni resetear el staging.
set -euo pipefail
cd "$(dirname "$0")"
ALL="a-auth,b-eventos,c-inscripciones,d-asistencia,e-gobernanza,f-excedencias,g-jugadores,h-calendario,i-normas"
SUITE=$(printf %s "${SUITE:-$ALL}" | tr -cd 'a-z0-9,-')
export SUITE
rm -rf resultados.jtl report result.json
here=$(pwd -W 2>/dev/null || pwd)   # ruta absoluta (en Windows, con letra de unidad)
args=(-n -t "$here/plan.jmx" -l "$here/resultados.jtl" -e -o "$here/report"
  -Jthreads="$(printf %s "${THREADS:-5}" | tr -cd '0-9')"
  -Jloops="$(printf %s "${LOOPS:-10}" | tr -cd '0-9')"
  -Jrampup="$(printf %s "${RAMPUP:-5}" | tr -cd '0-9')"
  -Jsummariser.interval=3
  -Jsuites="$SUITE" -Jqa_password="${QA_PASSWORD:-}")
# Pantalla en vivo de la web: convierte el resumen de JMeter en eventos (solo si existe shared/live-tail.js).
TAIL=(); [ -f shared/live-tail.js ] && TAIL=(node "$PWD/shared/live-tail.js" jmeter --)
if [ "${OS:-}" = "Windows_NT" ] && [ -n "${JMETER_HOME:-}" ]; then
  # jmeter.bat falla con rutas con espacios: se lanza el JAR directamente
  (cd "$JMETER_HOME/bin" && "${TAIL[@]}" java -jar ApacheJMeter.jar "${args[@]}") || true
else
  "${TAIL[@]}" "${JMETER_HOME:+$JMETER_HOME/bin/}jmeter" "${args[@]}" || true
fi
node to-result.js resultados.jtl result.json
