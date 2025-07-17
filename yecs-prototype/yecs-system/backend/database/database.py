from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    business_profiles = db.relationship('BusinessProfile', backref='user', lazy=True)
    credit_scores = db.relationship('CreditScore', backref='user', lazy=True)


class BusinessProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(200), nullable=False)
    industry = db.Column(db.String(100), nullable=False)
    business_plan_quality = db.Column(db.Float, default=0.0)
    revenue_projection = db.Column(db.Float, default=0.0)
    years_of_experience = db.Column(db.Integer, default=0)
    education_level = db.Column(db.String(50), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FinancialData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    monthly_income = db.Column(db.Float, default=0.0)
    monthly_expenses = db.Column(db.Float, default=0.0)
    savings_amount = db.Column(db.Float, default=0.0)
    debt_amount = db.Column(db.Float, default=0.0)
    utility_payment_score = db.Column(db.Float, default=0.0)
    rent_payment_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class CreditScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    yecs_score = db.Column(db.Integer, nullable=False)
    business_viability_score = db.Column(db.Float, default=0.0)
    payment_history_score = db.Column(db.Float, default=0.0)
    financial_management_score = db.Column(db.Float, default=0.0)
    personal_creditworthiness_score = db.Column(db.Float, default=0.0)
    education_background_score = db.Column(db.Float, default=0.0)
    social_verification_score = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(20), default='MEDIUM')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
