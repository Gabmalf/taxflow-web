import json
import pyodbc 
import hmac
import hashlib
import base64
import time

def create_jwt(usuario_id, correo):
    # Generador de JWT super simple (sin librerias externas)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"usuario_id": usuario_id, "correo": correo, "exp": int(time.time()) + 86400}
    secret = "secreto123" # Clave para el token
    
    enc_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    enc_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
    
    signature = hmac.new(secret.encode(), f"{enc_header}.{enc_payload}".encode(), hashlib.sha256).digest()
    enc_sig = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    
    return f"{enc_header}.{enc_payload}.{enc_sig}"

def lambda_handler(event, context):
    try:
        body = event.get('body')
        if body and isinstance(body, str):
            body = json.loads(body)
        else:
            body = event
            
        correo = body.get('correo')
        password = body.get('password')
        nombres = body.get('nombres', '')
        apellidos = body.get('apellidos', '')
        ruc = body.get('ruc', '')

        # Validaciones basicas
        if not correo or not password:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"status": "error", "message": "Faltan datos obligatorios"})
            }

        conn = pyodbc.connect(
            "Driver={ODBC Driver 18 for SQL Server};"
            "Server=dbweb.cyiiinurskzo.us-east-1.rds.amazonaws.com;"
            "Database=TaxFlow;"
            "UID=admin;"
            "PWD=Macarron1302;"
            "TrustServerCertificate=yes;"
        )
        cursor = conn.cursor()
        
        # Verificar si ya existe
        cursor.execute("SELECT id FROM usuarios WHERE correo = ?", correo)
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"status": "error", "message": "El correo ya está registrado"})
            }
        
        # Insertar nuevo usuario
        cursor.execute(
            "INSERT INTO usuarios (correo, password_hash, nombres, apellidos, ruc) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?)",
            (correo, password, nombres, apellidos, ruc)
        )
        row = cursor.fetchone()
        new_id = row[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        token = create_jwt(new_id, correo)
        
        user_data = {
            "usuario_id": new_id,
            "correo": correo,
            "nombres": nombres,
            "apellidos": apellidos,
            "ruc": ruc,
            "token": token
        }
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            "body": json.dumps({"status": "success", "data": user_data})
        }
            
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"status": "error", "message": str(e)})
        }
