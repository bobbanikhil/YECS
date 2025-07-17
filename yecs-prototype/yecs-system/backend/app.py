from flask import Flask, request, jsonify
from flask_cors import CORS
from database.database import db, User, BusinessProfile, FinancialData, CreditScore
from models.scoring_algorithm import YECScoringAlgorithm
from models.ml_models import YECSMLModel
from utils.bias_detector import BiasDetector
from utils.data_processor import DatasetProcessor
import os
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///yecs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize extensions
db.init_app(app)

# Initialize models
scoring_algorithm = YECScoringAlgorithm()
ml_model = YECSMLModel()
bias_detector = BiasDetector()
data_processor = DatasetProcessor()

# Set up logging
logging.basicConfig(level=logging.INFO)


# Create tables function (updated for Flask 3.0+)
def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()


# Initialize database tables
create_tables()


@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'YECS API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'first_name', 'last_name', 'age']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409

        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            age=data['age']
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'message': 'User created successfully'
        }), 201

    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<int:user_id>/business-profile', methods=['POST'])
def create_business_profile(user_id):
    """Create business profile for a user"""
    try:
        data = request.get_json()

        # Fixed: Use db.session.get() instead of User.query.get()
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Create business profile
        business_profile = BusinessProfile(
            user_id=user_id,
            business_name=data.get('business_name', ''),
            industry=data.get('industry', ''),
            business_plan_quality=data.get('business_plan_quality', 0.0),
            revenue_projection=data.get('revenue_projection', 0.0),
            years_of_experience=data.get('years_of_experience', 0),
            education_level=data.get('education_level', '')
        )

        db.session.add(business_profile)
        db.session.commit()

        return jsonify({
            'business_profile_id': business_profile.id,
            'message': 'Business profile created successfully'
        }), 201

    except Exception as e:
        logging.error(f"Error creating business profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<int:user_id>/financial-data', methods=['POST'])
def create_financial_data(user_id):
    """Create financial data for a user"""
    try:
        data = request.get_json()

        # Fixed: Use db.session.get() instead of User.query.get()
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Create financial data
        financial_data = FinancialData(
            user_id=user_id,
            monthly_income=data.get('monthly_income', 0.0),
            monthly_expenses=data.get('monthly_expenses', 0.0),
            savings_amount=data.get('savings_amount', 0.0),
            debt_amount=data.get('debt_amount', 0.0),
            utility_payment_score=data.get('utility_payment_score', 0.0),
            rent_payment_score=data.get('rent_payment_score', 0.0)
        )

        db.session.add(financial_data)
        db.session.commit()

        return jsonify({
            'financial_data_id': financial_data.id,
            'message': 'Financial data created successfully'
        }), 201

    except Exception as e:
        logging.error(f"Error creating financial data: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<int:user_id>/calculate-score', methods=['POST'])
def calculate_yecs_score(user_id):
    """Calculate YECS score for a user"""
    try:
        # Fixed: Use db.session.get() instead of User.query.get()
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get business profile
        business_profile = BusinessProfile.query.filter_by(user_id=user_id).first()
        if not business_profile:
            return jsonify({'error': 'Business profile not found'}), 404

        # Get financial data
        financial_data = FinancialData.query.filter_by(user_id=user_id).first()
        if not financial_data:
            return jsonify({'error': 'Financial data not found'}), 404

        # Prepare data for scoring
        user_data = {
            'business': {
                'business_plan_quality': business_profile.business_plan_quality,
                'revenue_projection': business_profile.revenue_projection,
                'years_of_experience': business_profile.years_of_experience,
                'market_analysis_score': 0.7,
                'industry_average_revenue': 100000
            },
            'financial': {
                'monthly_income': financial_data.monthly_income,
                'monthly_expenses': financial_data.monthly_expenses,
                'savings_amount': financial_data.savings_amount,
                'debt_amount': financial_data.debt_amount,
                'utility_payment_score': financial_data.utility_payment_score,
                'rent_payment_score': financial_data.rent_payment_score,
                'student_loan_payment_score': 0.8,
                'subscription_payment_score': 0.9,
                'tax_filing_score': 0.9,
                'overdraft_score': 0.8
            },
            'credit': {
                'traditional_credit_score': 0,
                'credit_utilization': 0.2,
                'recent_credit_inquiries': 1
            },
            'education': {
                'education_level': business_profile.education_level,
                'industry_experience_years': business_profile.years_of_experience,
                'professional_certifications': 2,
                'entrepreneurship_courses': 1
            },
            'social': {
                'identity_verification_score': 0.9,
                'professional_network_score': 0.7,
                'online_business_presence': 0.6,
                'community_involvement_score': 0.5
            }
        }

        # Calculate YECS score
        final_score, component_scores = scoring_algorithm.calculate_yecs_score(user_data)

        # Save score to database
        credit_score = CreditScore(
            user_id=user_id,
            yecs_score=final_score,
            business_viability_score=component_scores['business_viability'],
            payment_history_score=component_scores['payment_history'],
            financial_management_score=component_scores['financial_management'],
            personal_creditworthiness_score=component_scores['personal_creditworthiness'],
            education_background_score=component_scores['education_background'],
            social_verification_score=component_scores['social_verification'],
            risk_level=component_scores['risk_level']
        )

        db.session.add(credit_score)
        db.session.commit()

        return jsonify({
            'user_id': user_id,
            'yecs_score': final_score,
            'risk_level': component_scores['risk_level'],
            'component_scores': component_scores,
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        logging.error(f"Error calculating YECS score: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<int:user_id>/scores', methods=['GET'])
def get_user_scores(user_id):
    """Get user's score history"""
    try:
        scores = CreditScore.query.filter_by(user_id=user_id).order_by(CreditScore.created_at.desc()).all()

        score_history = []
        for score in scores:
            score_history.append({
                'score_id': score.id,
                'yecs_score': score.yecs_score,
                'risk_level': score.risk_level,
                'component_scores': {
                    'business_viability': score.business_viability_score,
                    'payment_history': score.payment_history_score,
                    'financial_management': score.financial_management_score,
                    'personal_creditworthiness': score.personal_creditworthiness_score,
                    'education_background': score.education_background_score,
                    'social_verification': score.social_verification_score
                },
                'created_at': score.created_at.isoformat()
            })

        return jsonify({
            'user_id': user_id,
            'score_history': score_history
        }), 200

    except Exception as e:
        logging.error(f"Error getting user scores: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/bias-analysis', methods=['POST'])
def analyze_bias():
    """Analyze bias in the scoring system"""
    try:
        # Get all scores and user data
        scores_query = db.session.query(CreditScore, User).join(User).all()

        if not scores_query:
            return jsonify({'error': 'No data available for bias analysis'}), 404

        # Prepare data for bias analysis
        import pandas as pd

        scores_data = []
        demographics_data = []

        for score, user in scores_query:
            scores_data.append({
                'user_id': user.id,
                'yecs_score': score.yecs_score
            })

            demographics_data.append({
                'user_id': user.id,
                'age': user.age,
                'gender': 'unknown',
                'zip_code': 'unknown'
            })

        scores_df = pd.DataFrame(scores_data)
        demographics_df = pd.DataFrame(demographics_data)

        # Perform bias analysis
        bias_results = bias_detector.detect_demographic_bias(scores_df, demographics_df)

        # Generate report
        bias_report = bias_detector.generate_bias_report(bias_results)

        return jsonify({
            'bias_analysis': bias_results,
            'bias_report': bias_report,
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        logging.error(f"Error analyzing bias: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
