#!/usr/bin/env bash
# Prueba de carga ligera con JMeter (modo no GUI) contra el staging y result.json en el formato del lab.
#   SUITE=carga  THREADS=5 LOOPS=10 RAMPUP=5  ./run.sh
# Necesita JMeter 5.6+ en el PATH (o JMETER_HOME) y Node 22. Sin QA_PASSWORD no se mide el caso autenticado.
# Son lecturas (GET) y un login: no modifican datos, así que no hace falta reservar ni resetear el staging.
set -euo pipefail
cd "$(dirname "$0")"
SUITE=$(printf %s "${SUITE:-carga}" | tr -cd 'a-z0-9,-')
export SUITE
JM="${JMETER_HOME:+$JMETER_HOME/bin/}jmeter"
rm -rf resultados.jtl report result.json
"$JM" -n -t plan.jmx -l resultados.jtl \
  -Jthreads="$(printf %s "${THREADS:-5}" | tr -cd '0-9')" \
  -Jloops="$(printf %s "${LOOPS:-10}" | tr -cd '0-9')" \
  -Jrampup="$(printf %s "${RAMPUP:-5}" | tr -cd '0-9')" \
  -Jqa_password="${QA_PASSWORD:-}" -e -o report || true
node to-result.js resultados.jtl result.json
