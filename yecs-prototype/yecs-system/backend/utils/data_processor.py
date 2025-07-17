import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os


class DatasetProcessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()

    def process_loan_data(self, file_path):
        """Process the loan approval dataset"""
        df = pd.read_csv(file_path)

        # Clean column names
        df.columns = df.columns.str.strip()

        # Handle missing values
        df = df.fillna(df.median() if df.select_dtypes(include=[np.number]).columns.tolist() else df.mode().iloc[0])

        # Encode categorical variables
        categorical_cols = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le

        # Convert target variable
        if 'Loan_Status' in df.columns:
            df['Loan_Status'] = df['Loan_Status'].map({'Y': 1, 'N': 0})
        elif 'loan_status' in df.columns:
            df['loan_status'] = df['loan_status'].map({'Approved': 1, 'Rejected': 0})

        return df

    def process_student_data(self, file_path):
        """Process the student spending dataset"""
        df = pd.read_csv(file_path)

        # Create financial responsibility score
        df['savings_rate'] = (df['monthly_income'] - df['food'] - df['housing'] - df['transportation']) / df[
            'monthly_income']
        df['debt_to_income'] = df['tuition'] / (df['monthly_income'] * 12)
        df['financial_score'] = np.where(df['savings_rate'] > 0.1, 1, 0)

        # Encode categorical variables
        categorical_cols = ['gender', 'year_in_school', 'major', 'preferred_payment_method']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le

        return df

    def create_training_dataset(self, loan_data, student_data):
        """Combine datasets for YECS training"""
        # Process loan data
        loan_df = self.process_loan_data(loan_data)

        # Process student data
        student_df = self.process_student_data(student_data)

        # Create synthetic YECS scores for training
        features = []
        scores = []

        # Extract features from loan data
        for _, row in loan_df.iterrows():
            feature_vector = [
                row.get('ApplicantIncome', 0) / 10000,  # Income (normalized)
                row.get('LoanAmount', 0) / 1000,  # Loan amount (normalized)
                row.get('Education', 0),  # Education level
                row.get('Self_Employed', 0),  # Self employment
                row.get('Credit_History', 0),  # Credit history
                row.get('Property_Area', 0),  # Property area
            ]

            # Calculate synthetic YECS score (300-850 range)
            base_score = 300
            if row.get('Loan_Status', 0) == 1:  # Approved
                score = base_score + np.random.normal(400, 100)
            else:  # Rejected
                score = base_score + np.random.normal(250, 80)

            score = np.clip(score, 300, 850)

            features.append(feature_vector)
            scores.append(score)

        # Add student data features
        for _, row in student_df.iterrows():
            feature_vector = [
                row.get('monthly_income', 0) / 100,  # Income (normalized)
                row.get('tuition', 0) / 1000,  # Education cost
                row.get('major', 0),  # Major
                row.get('year_in_school', 0),  # Year in school
                row.get('financial_score', 0),  # Financial responsibility
                row.get('savings_rate', 0),  # Savings rate
            ]

            # Calculate synthetic YECS score based on financial behavior
            base_score = 300
            financial_factor = row.get('savings_rate', 0) * 200 + row.get('financial_score', 0) * 100
            score = base_score + financial_factor + np.random.normal(0, 50)
            score = np.clip(score, 300, 850)

            features.append(feature_vector)
            scores.append(score)

        return np.array(features), np.array(scores)

    def save_processed_data(self, features, scores, output_dir):
        """Save processed data for training"""
        os.makedirs(output_dir, exist_ok=True)

        np.save(os.path.join(output_dir, 'features.npy'), features)
        np.save(os.path.join(output_dir, 'scores.npy'), scores)

        # Save label encoders
        joblib.dump(self.label_encoders, os.path.join(output_dir, 'label_encoders.pkl'))

        print(f"Processed data saved to {output_dir}")
        print(f"Features shape: {features.shape}")
        print(f"Scores shape: {scores.shape}")
