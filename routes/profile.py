"""
routes/profile.py
User profile view and edit.
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from models import db
from models.user import User

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/profile')
@login_required
def profile():
    return render_template('profile.html')


@profile_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    username     = request.form.get('username', '').strip()
    organization = request.form.get('organization', '').strip()
    current_pw   = request.form.get('current_password', '')
    new_pw       = request.form.get('new_password', '')
    confirm_pw   = request.form.get('confirm_password', '')

    # Validate username
    if not username:
        flash('Username cannot be empty.', 'error')
        return redirect(url_for('profile.profile'))

    if username != current_user.username:
        existing = User.query.filter_by(username=username).first()
        if existing:
            flash('That username is already taken.', 'error')
            return redirect(url_for('profile.profile'))

    current_user.username     = username
    current_user.organization = organization

    # Password change (optional — only if filled)
    if current_pw or new_pw or confirm_pw:
        if not check_password_hash(current_user.password, current_pw):
            flash('Current password is incorrect.', 'error')
            return redirect(url_for('profile.profile'))
        if len(new_pw) < 6:
            flash('New password must be at least 6 characters.', 'error')
            return redirect(url_for('profile.profile'))
        if new_pw != confirm_pw:
            flash('New passwords do not match.', 'error')
            return redirect(url_for('profile.profile'))
        current_user.password = generate_password_hash(new_pw)

    db.session.commit()
    flash('Profile updated successfully!', 'success')
    return redirect(url_for('profile.profile'))
