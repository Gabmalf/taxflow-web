import json
import pyodbc 
import hmac
import hashlib
import base64
import time

def verify_jwt(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        secret = "secreto123"
        expected_sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()).decode().rstrip('=')
        if signature_b64 != expected_sig:
            return None
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        if payload.get("exp") < int(time.time()):
            return None
        return payload
    except Exception:
        return None

def get_connection():
    return pyodbc.connect(
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=dbweb.cyiiinurskzo.us-east-1.rds.amazonaws.com;"
        "Database=TaxFlow;"
        "UID=admin;"
        "PWD=Macarron1302;"
        "TrustServerCertificate=yes;"
    )

def lambda_handler(event, context):
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization') or headers.get('authorization')
    
    http_method = event.get('httpMethod')
    if not http_method and 'requestContext' in event and 'http' in event['requestContext']:
        http_method = event['requestContext']['http'].get('method')
    if not http_method:
        http_method = 'POST'

    user = verify_jwt(auth_header)
    if not user:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "No autorizado"})}
        
    usuario_id = user["usuario_id"]
    
    if http_method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            asunto = body.get('asunto')
            categoria = body.get('categoria')
            mensaje = body.get('mensaje')

            if not asunto or not mensaje:
                return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "Faltan datos obligatorios"})}

            conn = get_connection()
            cursor = conn.cursor()
            
            # Crear la tabla dinámicamente si no existe, ya que es un requerimiento nuevo
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='consultas_soporte' and xtype='U')
                CREATE TABLE consultas_soporte (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    asunto VARCHAR(255) NOT NULL,
                    categoria VARCHAR(100),
                    mensaje TEXT NOT NULL,
                    fecha_creacion DATETIME DEFAULT GETDATE()
                )
            """)
            
            cursor.execute("""
                INSERT INTO consultas_soporte (usuario_id, asunto, categoria, mensaje)
                VALUES (?, ?, ?, ?)
            """, usuario_id, asunto, categoria, mensaje)
            
            conn.commit()
            
            return {
                "statusCode": 201, 
                "headers": {"Access-Control-Allow-Origin": "*"}, 
                "body": json.dumps({"status": "success", "message": "Consulta guardada correctamente en la base de datos."})
            }
        except Exception as e:
            return {"statusCode": 500, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": str(e)})}
        finally:
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conn' in locals() and conn: conn.close()
    else:
        return {"statusCode": 405, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "Method Not Allowed"})}
