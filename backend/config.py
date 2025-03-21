
class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'  # Use bcrypt for password hashing
    SECURITY_PASSWORD_SALT = 'shubham@123'  # Optional, bcrypt handles salting internally
    SECRET_KEY = "atkal@123"
    
    #redis
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_PORT = 6379
    CACHE_DEFAULT_TIMEOUT = 30
    
    WTF_CSRF_ENABLED = False
    SECURITY_UNAUTHORIZED_VIEW = None  # Prevent Flask-Security from redirecting on unauthorized access
    SECURITY_REDIRECT_BEHAVIOR = "spa"  # Single Page Application mode to prevent redirects
    # SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_TOKEN_AUTHENTICATION_KEY = 'auth_token'