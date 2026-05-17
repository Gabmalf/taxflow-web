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
    
    # Extraer el método HTTP (Soporta Payload v1.0 y v2.0)
    http_method = event.get('httpMethod')
    if not http_method and 'requestContext' in event and 'http' in event['requestContext']:
        http_method = event['requestContext']['http'].get('method')
    if not http_method:
        http_method = 'GET'



    # Extraer el path (Soporta Payload v1.0 y v2.0)
    path = event.get('path')
    if not path and 'requestContext' in event and 'http' in event['requestContext']:
        path = event['requestContext']['http'].get('path')
    if not path:
        path = '/'
    
    conn = None
    cursor = None
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = ""
        if 'monedas' in path:
            query = "SELECT id, codigo, nombre, simbolo FROM monedas WHERE estado = 'ACTIVO'"
        elif 'tipos-ingreso' in path:
            query = "SELECT id, tipo_renta_id, nombre FROM tipos_ingreso WHERE estado = 'ACTIVO'"
        elif 'categorias-gasto' in path:
            query = "SELECT id, nombre, porcentaje_deduccion FROM categorias_gasto WHERE estado = 'ACTIVO'"
        elif 'tipos-comprobante' in path:
            query = "SELECT id, codigo, nombre FROM tipos_comprobante WHERE estado = 'ACTIVO'"
        else:
            return {"statusCode": 404, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": "Catalogo no encontrado"})}
            
        cursor.execute(query)
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "success", "data": results}, cls=CustomEncoder)}

    except Exception as e:
        return {"statusCode": 500, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"status": "error", "message": str(e)})}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
