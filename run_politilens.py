import os
import sys
import time
import subprocess
import signal

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 70)
    print("   POLITILENS - Analizzatore e Comparatore Politico Autonomo")
    print("   100% Open-Source | Neutralità Assoluta | Fact-Checking")
    print("=" * 70)
    print("\n[1/2] Avvio del Backend FastAPI (Porta 8000)...")

    # Start FastAPI
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # Wait 2 seconds for backend to initialize
    time.sleep(2)

    print("\n[2/2] Avvio del Frontend Next.js (Porta 3000)...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    print("\n" + "=" * 70)
    print("   POLITILENS È ORA ATTIVO!")
    print("   👉 Dashboard & Web App:    http://localhost:3000")
    print("   👉 API REST & Swagger:     http://localhost:8000/docs")
    print("   👉 Manifesto Dinamico:     http://localhost:3000/compare")
    print("   👉 PolitiLens AI Chatbot:  http://localhost:3000/chat")
    print("   👉 Fact-Checking Monitor:  http://localhost:3000/fact-check")
    print("   👉 Ingestion & Fonti:      http://localhost:3000/sources")
    print("=" * 70)
    print("\nPremi CTRL+C per arrestare tutti i servizi.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nArresto di PolitiLens in corso...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("Servizi arrestati con successo.")

if __name__ == "__main__":
    main()
