import pandas as pd
import numpy as np
from typing import Dict, Tuple
import logging


class YECScoringAlgorithm:
    def __init__(self):
        self.weights = {
            'business_viability': 0.25,
            'payment_history': 0.20,
            'financial_management': 0.18,
            'personal_creditworthiness': 0.15,
            'education_background': 0.12,
            'social_verification': 0.10
        }
        self.score_range = (300, 850)  # Similar to FICO range

    def calculate_business_viability_score(self, business_data: Dict) -> float:
        """Calculate business viability score (0-100)"""
        score = 0.0

        # Business plan quality (0-30 points)
        plan_quality = business_data.get('business_plan_quality', 0)
        score += min(plan_quality * 30, 30)

        # Revenue projections realism (0-25 points)
        revenue_proj = business_data.get('revenue_projection', 0)
        industry_avg = business_data.get('industry_average_revenue', 100000)
        if revenue_proj > 0:
            realism_ratio = min(revenue_proj / industry_avg, 2.0)
            score += (1 - abs(realism_ratio - 1)) * 25

        # Industry experience (0-25 points)
        experience = business_data.get('years_of_experience', 0)
        score += min(experience * 5, 25)

        # Market analysis depth (0-20 points)
        market_analysis = business_data.get('market_analysis_score', 0)
        score += min(market_analysis * 20, 20)

        return min(score, 100)

    def calculate_payment_history_score(self, financial_data: Dict) -> float:
        """Calculate alternative payment history score (0-100)"""
        score = 0.0

        # Utility payments (0-30 points)
        utility_score = financial_data.get('utility_payment_score', 0)
        score += utility_score * 30

        # Rent payments (0-25 points)
        rent_score = financial_data.get('rent_payment_score', 0)
        score += rent_score * 25

        # Student loan payments (0-20 points)
        student_loan_score = financial_data.get('student_loan_payment_score', 0)
        score += student_loan_score * 20

        # Mobile/subscription payments (0-15 points)
        subscription_score = financial_data.get('subscription_payment_score', 0)
        score += subscription_score * 15

        # Tax filing consistency (0-10 points)
        tax_score = financial_data.get('tax_filing_score', 0)
        score += tax_score * 10

        return min(score, 100)

    def calculate_financial_management_score(self, financial_data: Dict) -> float:
        """Calculate financial management capability score (0-100)"""
        score = 0.0

        # Debt-to-income ratio (0-30 points)
        monthly_income = financial_data.get('monthly_income', 1)
        debt_amount = financial_data.get('debt_amount', 0)
        if monthly_income > 0:
            debt_to_income = debt_amount / (monthly_income * 12)
            if debt_to_income <= 0.3:
                score += 30
            elif debt_to_income <= 0.5:
                score += 20
            elif debt_to_income <= 0.8:
                score += 10

        # Savings rate (0-25 points)
        savings_amount = financial_data.get('savings_amount', 0)
        if monthly_income > 0:
            savings_rate = savings_amount / (monthly_income * 12)
            score += min(savings_rate * 100, 25)

        # Cash flow management (0-25 points)
        monthly_expenses = financial_data.get('monthly_expenses', 0)
        if monthly_income > monthly_expenses:
            cash_flow_ratio = (monthly_income - monthly_expenses) / monthly_income
            score += cash_flow_ratio * 25

        # Overdraft frequency (0-20 points)
        overdraft_score = financial_data.get('overdraft_score', 1.0)
        score += overdraft_score * 20

        return min(score, 100)

    def calculate_personal_creditworthiness_score(self, credit_data: Dict) -> float:
        """Calculate personal creditworthiness score (0-100)"""
        score = 0.0

        # Traditional credit score (0-50 points)
        traditional_score = credit_data.get('traditional_credit_score', 0)
        if traditional_score > 0:
            # Normalize FICO score to 0-50 range
            normalized = (traditional_score - 300) / (850 - 300)
            score += normalized * 50
        else:
            # If no traditional score, use alternative assessment
            score += 25  # Neutral score for no history

        # Credit utilization (0-30 points)
        credit_utilization = credit_data.get('credit_utilization', 0)
        if credit_utilization <= 0.1:
            score += 30
        elif credit_utilization <= 0.3:
            score += 20
        elif credit_utilization <= 0.5:
            score += 10

        # Credit inquiry patterns (0-20 points)
        recent_inquiries = credit_data.get('recent_credit_inquiries', 0)
        if recent_inquiries == 0:
            score += 20
        elif recent_inquiries <= 2:
            score += 15
        elif recent_inquiries <= 4:
            score += 10

        return min(score, 100)

    def calculate_education_background_score(self, education_data: Dict) -> float:
        """Calculate education and professional background score (0-100)"""
        score = 0.0

        # Educational attainment (0-40 points)
        education_level = education_data.get('education_level', '').lower()
        if 'phd' in education_level or 'doctorate' in education_level:
            score += 40
        elif 'master' in education_level or 'mba' in education_level:
            score += 35
        elif 'bachelor' in education_level:
            score += 30
        elif 'associate' in education_level:
            score += 20
        elif 'high school' in education_level:
            score += 15

        # Relevant industry experience (0-30 points)
        industry_experience = education_data.get('industry_experience_years', 0)
        score += min(industry_experience * 3, 30)

        # Professional certifications (0-20 points)
        certifications = education_data.get('professional_certifications', 0)
        score += min(certifications * 5, 20)

        # Entrepreneurship education (0-10 points)
        entrepreneurship_education = education_data.get('entrepreneurship_courses', 0)
        score += min(entrepreneurship_education * 2, 10)

        return min(score, 100)

    def calculate_social_verification_score(self, social_data: Dict) -> float:
        """Calculate social and digital verification score (0-100)"""
        score = 0.0

        # Digital identity consistency (0-30 points)
        identity_verification = social_data.get('identity_verification_score', 0)
        score += identity_verification * 30

        # Professional network quality (0-25 points)
        network_score = social_data.get('professional_network_score', 0)
        score += network_score * 25

        # Online business presence (0-25 points)
        online_presence = social_data.get('online_business_presence', 0)
        score += online_presence * 25

        # Community involvement (0-20 points)
        community_score = social_data.get('community_involvement_score', 0)
        score += community_score * 20

        return min(score, 100)

    def calculate_yecs_score(self, user_data: Dict) -> Tuple[int, Dict]:
        """Calculate the final YECS score and component scores"""

        # Calculate component scores
        business_score = self.calculate_business_viability_score(user_data.get('business', {}))
        payment_score = self.calculate_payment_history_score(user_data.get('financial', {}))
        financial_score = self.calculate_financial_management_score(user_data.get('financial', {}))
        credit_score = self.calculate_personal_creditworthiness_score(user_data.get('credit', {}))
        education_score = self.calculate_education_background_score(user_data.get('education', {}))
        social_score = self.calculate_social_verification_score(user_data.get('social', {}))

        # Calculate weighted final score
        weighted_score = (
                business_score * self.weights['business_viability'] +
                payment_score * self.weights['payment_history'] +
                financial_score * self.weights['financial_management'] +
                credit_score * self.weights['personal_creditworthiness'] +
                education_score * self.weights['education_background'] +
                social_score * self.weights['social_verification']
        )

        # Convert to FICO-like range (300-850)
        final_score = int(300 + (weighted_score / 100) * 550)

        # Determine risk level
        if final_score >= 750:
            risk_level = "LOW"
        elif final_score >= 650:
            risk_level = "MEDIUM"
        elif final_score >= 550:
            risk_level = "HIGH"
        else:
            risk_level = "VERY_HIGH"

        component_scores = {
            'business_viability': business_score,
            'payment_history': payment_score,
            'financial_management': financial_score,
            'personal_creditworthiness': credit_score,
            'education_background': education_score,
            'social_verification': social_score,
            'risk_level': risk_level
        }

        return final_score, component_scores
