import json
import pyodbc 
import hmac
import hashlib
import base64
import time
from decimal import Decimal

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return super(CustomEncoder, self).default(obj)

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
    
    # Extraer el método HTTP (Soporta Payload v1.0 y v2.0)
    http_method = event.get('httpMethod')
    if not http_method and 'requestContext' in event and 'http' in event['requestContext']:
        http_method = event['requestContext']['http'].get('method')
    if not http_method:
        http_method = 'GET'



    user = verify_jwt(auth_header)
    if not user:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "No autorizado"})}
        
    usuario_id = user["usuario_id"]
    
    conn = None
    cursor = None
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        if http_method == 'GET':
            # Obtener el RUC del usuario para filtrar su calendario
            cursor.execute("SELECT ruc FROM usuarios WHERE id = ?", usuario_id)
            row = cursor.fetchone()
            if not row or not row[0]:
                return {"statusCode": 404, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "Usuario no tiene RUC configurado"})}
                
            ultimo_digito = row[0][-1]
            
            cursor.execute("""
                SELECT id, ultimo_digito_ruc, periodo_mes, periodo_anio, fecha_vencimiento, estado
                FROM calendario_sunat
                WHERE ultimo_digito_ruc = ?
                ORDER BY fecha_vencimiento ASC
            """, ultimo_digito)
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "success", "data": results}, cls=CustomEncoder)}

    except Exception as e:
        return {"statusCode": 500, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": str(e)})}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
