import os
import mongoengine

_connected = False

def init_mongodb():
    global _connected
    if not _connected:
        raw_uri = os.environ.get('MONGO_URI') or os.environ.get('MONGO_URL') or os.environ.get('MONGODB_URL')
        db_name = (os.environ.get('MONGO_DB') or 'tasktracker_db').strip().strip("'\"")
        
        if raw_uri and raw_uri.strip():
            mongo_uri = raw_uri.strip().strip("'\"")
            
            # Ensure authSource=admin is specified for root/cloud accounts if missing
            if 'authSource' not in mongo_uri and '@' in mongo_uri:
                sep = '&' if '?' in mongo_uri else '?'
                effective_uri = f"{mongo_uri}{sep}authSource=admin"
            else:
                effective_uri = mongo_uri

            try:
                mongoengine.connect(host=effective_uri, db=db_name)
                print(f"[MongoDB] Connected via MONGO_URI with authSource=admin ({db_name})")
            except Exception as e:
                print(f"[MongoDB] First attempt notice: {e}. Trying raw URI...")
                mongoengine.connect(host=mongo_uri, db=db_name)
                print(f"[MongoDB] Connected via raw MONGO_URI ({db_name})")

        else:
            host = (os.environ.get('MONGO_HOST') or '127.0.0.1').strip().strip("'\"")
            port = int(str(os.environ.get('MONGO_PORT', 27017)).strip())
            mongoengine.connect(
                db=db_name,
                host=host,
                port=port
            )
            print(f"[MongoDB] Connected to {host}:{port}/{db_name}")
        _connected = True

