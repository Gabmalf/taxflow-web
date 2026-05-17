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
        # 1. Extraer los datos que envía Angular o la prueba de AWS
        body = event.get('body')
        if body and isinstance(body, str):
            body = json.loads(body)
        else:
            body = event
            
        correo = body.get('correo')
        password = body.get('password')

        # 2. Conectarse a la BD al estilo de tu profesor (AQUÍ PON TUS DATOS)
        # Nota: Usamos Driver 18 que es el que soporta tu capa
        conn = pyodbc.connect(
            "Driver={ODBC Driver 18 for SQL Server};"
            "Server=dbweb.cyiiinurskzo.us-east-1.rds.amazonaws.com;"
            "Database=TaxFlow;"
            "UID=admin;"
            "PWD=Macarron1302;"
            "TrustServerCertificate=yes;" # El Driver 18 a veces exige esto por temas académicos
        )
        cursor = conn.cursor()
        
        # 3. Ejecutar la consulta
        cursor.execute("SELECT id, correo, password_hash, nombres, apellidos, ruc FROM usuarios WHERE correo = ?", correo)
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # 4. Validar si encontró el usuario y la contraseña es igual (row[2] es password_hash)
        if row and row[2] == password:
            token = create_jwt(row[0], row[1])
            
            user_data = {
                "usuario_id": row[0],
                "correo": row[1],
                "nombres": row[3],
                "apellidos": row[4],
                "ruc": row[5],
                "token": token
            }
            
            # Formato estándar para que API Gateway y Angular lo entiendan bien (CORS)
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" 
                },
                "body": json.dumps({"status": "success", "data": user_data})
            }
        else:
            return {
                "statusCode": 401,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"status": "error", "message": "Credenciales inválidas"})
            }
            
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"status": "error", "message": str(e)})
        }
