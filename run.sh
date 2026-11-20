#!/usr/bin/env bash
# Prueba de carga ligera con JMeter (modo no GUI) contra el staging y result.json en el formato del lab.
#   SUITE=carga  THREADS=5 LOOPS=10 RAMPUP=5  ./run.sh
# Necesita JMeter 5.6+ (JMETER_HOME o `jmeter` en el PATH), Java 17+ y Node 22.
# Sin QA_PASSWORD no se mide el caso autenticado. Son lecturas (GET) y un login por usuario virtual:
# no modifican datos, así que no hace falta reservar ni resetear el staging.
set -euo pipefail
cd "$(dirname "$0")"
SUITE=$(printf %s "${SUITE:-carga}" | tr -cd 'a-z0-9,-')
export SUITE
rm -rf resultados.jtl report result.json
here=$(pwd -W 2>/dev/null || pwd)   # ruta absoluta (en Windows, con letra de unidad)
args=(-n -t "$here/plan.jmx" -l "$here/resultados.jtl" -e -o "$here/report"
  -Jthreads="$(printf %s "${THREADS:-5}" | tr -cd '0-9')"
  -Jloops="$(printf %s "${LOOPS:-10}" | tr -cd '0-9')"
  -Jrampup="$(printf %s "${RAMPUP:-5}" | tr -cd '0-9')"
  -Jqa_password="${QA_PASSWORD:-}")
if [ "${OS:-}" = "Windows_NT" ] && [ -n "${JMETER_HOME:-}" ]; then
  # jmeter.bat falla con rutas con espacios: se lanza el JAR directamente
  (cd "$JMETER_HOME/bin" && java -jar ApacheJMeter.jar "${args[@]}") || true
else
  "${JMETER_HOME:+$JMETER_HOME/bin/}jmeter" "${args[@]}" || true
fi
node to-result.js resultados.jtl result.json
