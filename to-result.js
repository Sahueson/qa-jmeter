// resultados.jtl (CSV de JMeter) -> result.json (formato común de ivan-qa-lab-shared/schema).
// Un "test" por muestreador: pasa si no hay errores y el percentil 95 no supera su umbral.
const fs = require("fs");
const THRESHOLDS = {
  "PERF-01 Ping keep_alive": 800,
  "PERF-02 Lectura anonima de partidas (RLS)": 800,
  "PERF-03 Lectura de partidas autenticado (jugador MAD)": 1200,
};
const parseCsv = (line) => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
const lines = fs.readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/);
const head = parseCsv(lines[0]);
const col = (n) => head.indexOf(n);
const rows = lines.slice(1).map(parseCsv);
const byLabel = {};
for (const r of rows) {
  const label = r[col("label")];
  if (!THRESHOLDS[label]) continue;
  (byLabel[label] ||= []).push({ ms: +r[col("elapsed")], ok: r[col("success")] === "true", msg: r[col("failureMessage")], code: r[col("responseCode")] });
}
const p95 = (a) => { const s = a.map((x) => x.ms).sort((x, y) => x - y); return s[Math.max(0, Math.ceil(s.length * 0.95) - 1)]; };
const tests = Object.entries(THRESHOLDS).map(([name, limit]) => {
  const rs = byLabel[name];
  if (!rs) return { name, status: "skipped", duration_ms: 0, role: name.includes("autenticado") ? "Jugador MAD" : "Anónimo", error: null, evidence_url: null };
  const errs = rs.filter((x) => !x.ok), p = p95(rs), avg = Math.round(rs.reduce((a, x) => a + x.ms, 0) / rs.length);
  console.log(`${name}: ${rs.length} peticiones, media ${avg} ms, p95 ${p} ms (umbral ${limit} ms)`);
  const problems = [];
  if (errs.length) problems.push(`${errs.length}/${rs.length} peticiones con error (${errs[0].code} ${errs[0].msg || ""})`.trim());
  if (p > limit) problems.push(`p95 ${p} ms supera el umbral de ${limit} ms`);
  return {
    name,
    status: problems.length ? "failed" : "passed", duration_ms: p, role: name.includes("autenticado") ? "Jugador MAD" : "Anónimo",
    error: problems.length ? problems.join("; ") : null, evidence_url: null,
  };
});
const count = (s) => tests.filter((t) => t.status === s).length;
const stamps = rows.map((r) => +r[col("timeStamp")]);
const start = Math.min(...stamps), end = Math.max(...rows.map((r) => +r[col("timeStamp")] + +r[col("elapsed")]));
const result = {
  tool: "jmeter", target: "tactical-calendar", suite: process.env.SUITE || "carga",
  started_at: new Date(start).toISOString(), finished_at: new Date(end).toISOString(), duration_ms: end - start,
  summary: { total: tests.length, passed: count("passed"), failed: count("failed"), skipped: count("skipped") },
  tests,
};
fs.writeFileSync(process.argv[3], JSON.stringify(result, null, 2));
console.log(`result.json: ${result.summary.passed}/${result.summary.total} pasan, ${result.summary.skipped} omitidos`);
