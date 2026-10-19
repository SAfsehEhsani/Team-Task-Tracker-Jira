import os
import subprocess
import sys

def main():
    port = os.environ.get('PORT', '8000')
    print(f"[Launcher] Starting Gunicorn server on 0.0.0.0:{port} ...")
    cmd = [
        "gunicorn",
        "--bind", f"0.0.0.0:{port}",
        "--workers", "3",
        "core.wsgi:application"
    ]
    sys.exit(subprocess.call(cmd))

if __name__ == "__main__":
    main()
