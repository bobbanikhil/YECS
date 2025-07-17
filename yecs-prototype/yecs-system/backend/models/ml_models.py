import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import logging


class YECSMLModel:
    def __init__(self):
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False

    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for machine learning"""
        features = pd.DataFrame()

        # Business features
        features['business_plan_quality'] = data.get('business_plan_quality', 0)
        features['revenue_projection'] = data.get('revenue_projection', 0)
        features['years_of_experience'] = data.get('years_of_experience', 0)
        features['market_analysis_score'] = data.get('market_analysis_score', 0)

        # Financial features
        features['monthly_income'] = data.get('monthly_income', 0)
        features['monthly_expenses'] = data.get('monthly_expenses', 0)
        features['savings_amount'] = data.get('savings_amount', 0)
        features['debt_amount'] = data.get('debt_amount', 0)

        # Payment history features
        features['utility_payment_score'] = data.get('utility_payment_score', 0)
        features['rent_payment_score'] = data.get('rent_payment_score', 0)
        features['student_loan_payment_score'] = data.get('student_loan_payment_score', 0)

        # Education features
        features['education_level_numeric'] = self.encode_education_level(data.get('education_level', ''))
        features['industry_experience_years'] = data.get('industry_experience_years', 0)
        features['professional_certifications'] = data.get('professional_certifications', 0)

        # Social features
        features['identity_verification_score'] = data.get('identity_verification_score', 0)
        features['professional_network_score'] = data.get('professional_network_score', 0)
        features['online_business_presence'] = data.get('online_business_presence', 0)

        # Calculate derived features
        features['debt_to_income_ratio'] = features['debt_amount'] / (features['monthly_income'] * 12 + 1)
        features['savings_rate'] = features['savings_amount'] / (features['monthly_income'] * 12 + 1)
        features['expense_ratio'] = features['monthly_expenses'] / (features['monthly_income'] + 1)

        return features

    def encode_education_level(self, education_level: str) -> int:
        """Encode education level to numeric value"""
        education_level = education_level.lower()
        if 'phd' in education_level or 'doctorate' in education_level:
            return 6
        elif 'master' in education_level or 'mba' in education_level:
            return 5
        elif 'bachelor' in education_level:
            return 4
        elif 'associate' in education_level:
            return 3
        elif 'high school' in education_level:
            return 2
        else:
            return 1

    def train_model(self, training_data: pd.DataFrame, target_scores: pd.Series):
        """Train the ML model with provided data"""
        try:
            # Prepare features
            X = self.prepare_features(training_data)
            y = target_scores

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            # Train models
            self.rf_model.fit(X_train_scaled, y_train)
            self.gb_model.fit(X_train_scaled, y_train)

            # Evaluate models
            rf_pred = self.rf_model.predict(X_test_scaled)
            gb_pred = self.gb_model.predict(X_test_scaled)

            rf_r2 = r2_score(y_test, rf_pred)
            gb_r2 = r2_score(y_test, gb_pred)

            logging.info(f"Random Forest R²: {rf_r2:.4f}")
            logging.info(f"Gradient Boosting R²: {gb_r2:.4f}")

            self.is_trained = True

            return {
                'rf_r2': rf_r2,
                'gb_r2': gb_r2,
                'rf_mse': mean_squared_error(y_test, rf_pred),
                'gb_mse': mean_squared_error(y_test, gb_pred)
            }

        except Exception as e:
            logging.error(f"Model training failed: {str(e)}")
            raise

    def predict_score(self, user_data: dict) -> float:
        """Predict YECS score using trained ML model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")

        try:
            # Prepare features
            features_df = pd.DataFrame([user_data])
            X = self.prepare_features(features_df)
            X_scaled = self.scaler.transform(X)

            # Make predictions with both models
            rf_pred = self.rf_model.predict(X_scaled)[0]
            gb_pred = self.gb_model.predict(X_scaled)[0]

            # Ensemble prediction (weighted average)
            ensemble_pred = 0.6 * rf_pred + 0.4 * gb_pred

            # Ensure prediction is within valid range
            return max(300, min(850, ensemble_pred))

        except Exception as e:
            logging.error(f"Prediction failed: {str(e)}")
            raise

    def save_model(self, filepath: str):
        """Save trained model to file"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        model_data = {
            'rf_model': self.rf_model,
            'gb_model': self.gb_model,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }

        joblib.dump(model_data, filepath)

    def load_model(self, filepath: str):
        """Load trained model from file"""
        model_data = joblib.load(filepath)

        self.rf_model = model_data['rf_model']
        self.gb_model = model_data['gb_model']
        self.scaler = model_data['scaler']
        self.is_trained = model_data['is_trained']
