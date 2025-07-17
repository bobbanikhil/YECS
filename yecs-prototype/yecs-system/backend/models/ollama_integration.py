import requests
import json
import numpy as np
from typing import Dict, List


class OllamaIntegration:
    def __init__(self, base_url="http://localhost:11434", model_name="llama3.2"):
        self.base_url = base_url
        self.model_name = model_name
        self.api_url = f"{base_url}/api/chat"

    def generate_score_explanation(self, user_data: Dict, yecs_score: int, component_scores: Dict) -> str:
        """Generate AI explanation for YECS score"""

        prompt = f"""
        You are a financial advisor AI specialized in credit scoring for young entrepreneurs. 

        User Profile:
        - Business Type: {user_data.get('business', {}).get('industry', 'Unknown')}
        - Monthly Income: ${user_data.get('financial', {}).get('monthly_income', 0):,.2f}
        - Education: {user_data.get('education', {}).get('education_level', 'Unknown')}
        - Experience: {user_data.get('business', {}).get('years_of_experience', 0)} years

        YECS Score: {yecs_score}/850

        Component Scores:
        - Business Viability: {component_scores.get('business_viability', 0):.1f}%
        - Payment History: {component_scores.get('payment_history', 0):.1f}%
        - Financial Management: {component_scores.get('financial_management', 0):.1f}%
        - Personal Credit: {component_scores.get('personal_creditworthiness', 0):.1f}%
        - Education: {component_scores.get('education_background', 0):.1f}%
        - Social Verification: {component_scores.get('social_verification', 0):.1f}%

        Please provide:
        1. A brief explanation of the YECS score
        2. Top 3 strengths
        3. Top 3 areas for improvement
        4. Specific actionable recommendations

        Keep the response under 300 words and professional.
        """

        try:
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return result.get('message', {}).get('content', 'Unable to generate explanation')
            else:
                return f"Error generating explanation: {response.status_code}"

        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}"

    def predict_score_improvement(self, current_score: int, planned_actions: List[str]) -> str:
        """Predict score improvement based on planned actions"""

        actions_text = "\n".join([f"- {action}" for action in planned_actions])

        prompt = f"""
        Current YECS Score: {current_score}/850

        Planned Actions:
        {actions_text}

        As a credit scoring expert, analyze these planned actions and provide:
        1. Estimated score improvement (be realistic)
        2. Timeline for seeing results
        3. Priority order of actions
        4. Additional recommendations

        Keep response under 200 words.
        """

        try:
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return result.get('message', {}).get('content', 'Unable to generate prediction')
            else:
                return f"Error generating prediction: {response.status_code}"

        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}"

    def health_check(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
