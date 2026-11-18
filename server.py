#!/usr/bin/env python3
"""Servidor local de Lupa UABCS.

Sirve el sitio estatico y guarda las respuestas de la encuesta en
`data/encuestas.json`, con estadisticas agregadas en /api/encuestas/stats.

Uso:
    python server.py            # http://localhost:3000
    python server.py 8080       # otro puerto

Solo libreria estandar: no requiere instalar nada.
"""

import json
import os
import sys
import threading
import uuid
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
DATA_FILE = os.path.join(DATA_DIR, "encuestas.json")

# Preguntas de opcion multiple que se agregan en las estadisticas, en orden.
QUESTIONS = [
    "semestre",
    "carrera",
    "traslado_tiempo",
    "transporte",
    "estadia",
    "condiciones",
    "tramites",
    "seguridad",
    "acoso",
    "prioridad",
    "ambiente_aula",
]

MAX_BODY = 64 * 1024
LOCK = threading.Lock()


def load_responses():
    """Lee data/encuestas.json; devuelve lista (vacia si no existe o esta roto)."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (json.JSONDecodeError, OSError):
        return []
    return data if isinstance(data, list) else []


def save_responses(responses):
    os.makedirs(DATA_DIR, exist_ok=True)
    temp_path = DATA_FILE + ".tmp"
    with open(temp_path, "w", encoding="utf-8") as handle:
        json.dump(responses, handle, ensure_ascii=False, indent=2)
    os.replace(temp_path, DATA_FILE)


def build_stats(responses):
    """Cuenta respuestas por opcion para cada pregunta cerrada."""
    stats = {"total": len(responses), "actualizado": datetime.now(timezone.utc).isoformat(), "preguntas": {}}
    for question in QUESTIONS:
        counts = {}
        for response in responses:
            value = response.get(question)
            if isinstance(value, str) and value:
                counts[value] = counts.get(value, 0) + 1
        stats["preguntas"][question] = counts

    comentarios = 0
    for response in responses:
        for key, value in response.items():
            if key.endswith("_comentario") or key.endswith("_otra"):
                if isinstance(value, str) and value.strip():
                    comentarios += 1
    stats["comentarios"] = comentarios
    return stats


class LupaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write("[lupa] %s\n" % (format % args))

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def route(self):
        return self.path.split("?", 1)[0].rstrip("/") or "/"

    def do_GET(self):
        raw_path = self.path.split("?", 1)[0]
        route = self.route()

        if route == "/api/encuestas/stats":
            with LOCK:
                responses = load_responses()
            return self.send_json(build_stats(responses))

        if route == "/api/encuestas":
            with LOCK:
                responses = load_responses()
            return self.send_json({"total": len(responses), "respuestas": responses})

        if raw_path == "/encuesta":
            self.send_response(301)
            self.send_header("Location", "/encuesta/")
            self.end_headers()
            return

        return super().do_GET()

    def do_POST(self):
        if self.route() != "/api/encuestas":
            return self.send_json({"error": "Ruta no encontrada."}, 404)

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return self.send_json({"error": "Content-Length invalido."}, 400)

        if length <= 0 or length > MAX_BODY:
            return self.send_json({"error": "Cuerpo vacio o demasiado grande."}, 400)

        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return self.send_json({"error": "El cuerpo no es JSON valido."}, 400)

        if not isinstance(payload, dict):
            return self.send_json({"error": "Se esperaba un objeto JSON."}, 400)

        faltantes = [key for key in QUESTIONS if not isinstance(payload.get(key), str) or not payload.get(key)]
        if faltantes:
            return self.send_json({"error": "Faltan respuestas obligatorias.", "faltantes": faltantes}, 422)

        registro = {"id": uuid.uuid4().hex[:12], "fecha": datetime.now(timezone.utc).isoformat()}
        for key, value in payload.items():
            if isinstance(value, str):
                registro[key] = value.strip()[:2000]

        with LOCK:
            responses = load_responses()
            responses.append(registro)
            save_responses(responses)
            total = len(responses)

        print("[lupa] encuesta guardada %s (total %d)" % (registro["id"], total))
        return self.send_json({"ok": True, "id": registro["id"], "total": total}, 201)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    os.makedirs(DATA_DIR, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", port), LupaHandler)
    print("Lupa UABCS -> http://localhost:%d" % port)
    print("Encuesta   -> http://localhost:%d/encuesta" % port)
    print("API stats  -> http://localhost:%d/api/encuestas/stats" % port)
    print("JSON       -> %s" % DATA_FILE)
    print("Ctrl+C para detener.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
