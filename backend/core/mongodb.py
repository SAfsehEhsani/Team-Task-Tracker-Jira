import os
import mongoengine

_connected = False

def init_mongodb():
    global _connected
    if not _connected:
        mongo_uri = os.environ.get('MONGO_URI')
        db_name = os.environ.get('MONGO_DB', 'tasktracker_db')
        
        if mongo_uri:
            mongoengine.connect(host=mongo_uri)
            print(f"[MongoDB] Connected via MONGO_URI to database")
        else:
            host = os.environ.get('MONGO_HOST', '127.0.0.1')
            port = int(os.environ.get('MONGO_PORT', 27017))
            mongoengine.connect(
                db=db_name,
                host=host,
                port=port
            )
            print(f"[MongoDB] Connected to {host}:{port}/{db_name}")
        _connected = True
