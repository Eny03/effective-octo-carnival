import os
import sys
import time
import subprocess

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")

    print("=" * 70)
    print("   POLITICLENS - Analizzatore e Comparatore Politico Autonomo")
    print("   100% Open-Source | Architettura Unificata Tutto-in-Uno")
    print("=" * 70)
    print("\nAvvio dell'applicazione unificata (FastAPI + PWA Web App)...")

    # Start Unified FastAPI (Serves both Web App UI and REST API)
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    proc = subprocess.Popen(cmd, cwd=backend_dir)

    time.sleep(2)

    print("\n" + "=" * 70)
    print("   POLITICLENS È ORA ATTIVO (TUTTO IN UNO)!")
    print("   👉 Applicazione Web & Mobile:  http://localhost:8000")
    print("   👉 Manifesto Dinamico:         http://localhost:8000/compare")
    print("   👉 PoliticLens AI Chatbot:      http://localhost:8000/chat")
    print("   👉 Fact-Checking Monitor:      http://localhost:8000/fact-check")
    print("   👉 Documentazione API Swagger: http://localhost:8000/docs")
    print("=" * 70)
    print("\nPremi CTRL+C per arrestare il servizio.\n")

    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\nArresto di PoliticLens in corso...")
        proc.terminate()
        proc.wait()
        print("Servizio arrestato con successo.")

if __name__ == "__main__":
    main()
