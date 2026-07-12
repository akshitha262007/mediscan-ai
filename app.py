"""
MediScan AI — Flask application entry point.
"""

import os
from flask import Flask, redirect, url_for
from flask_login import LoginManager

from config import Config
from models import db
from models.user import User
from models.scan import Scan  # noqa: F401 – needed for db.create_all()

from routes.auth      import auth_bp
from routes.scan      import scan_bp
from routes.dashboard import dashboard_bp
from routes.compare   import compare_bp
from routes.ai_chat   import chat_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view       = 'auth.login'
    login_manager.login_message    = 'Please sign in to access MediScan.'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(scan_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(compare_bp)
    app.register_blueprint(chat_bp)

    # ── Root redirect ─────────────────────────────────────────────────────────
    @app.route('/')
    def index():
        return redirect(url_for('dashboard.dashboard'))

    # ── Ensure required directories exist ─────────────────────────────────────
    with app.app_context():
        os.makedirs(app.config['UPLOAD_FOLDER'],  exist_ok=True)
        os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
        os.makedirs(app.config['ELA_FOLDER'],     exist_ok=True)
        os.makedirs('database',                   exist_ok=True)
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)