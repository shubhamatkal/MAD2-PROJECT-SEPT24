class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'  # Use bcrypt for password hashing
    SECURITY_PASSWORD_SALT = 'shubham@123'  # Optional, bcrypt handles salting internally
    SECRET_KEY = "atkal@123"

    WTF_CSRF_ENABLED = False
