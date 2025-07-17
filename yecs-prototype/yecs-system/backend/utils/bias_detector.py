import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import logging


class BiasDetector:
    def __init__(self):
        self.protected_attributes = ['age', 'gender', 'race', 'ethnicity', 'zip_code']
        self.bias_threshold = 0.1  # 10% threshold for bias detection

    def detect_demographic_bias(self, scores: pd.DataFrame, demographics: pd.DataFrame) -> Dict:
        """Detect bias across demographic groups"""
        bias_results = {}

        # Merge scores with demographics
        merged_data = pd.merge(scores, demographics, on='user_id', how='inner')

        for attribute in self.protected_attributes:
            if attribute in merged_data.columns:
                bias_results[attribute] = self._analyze_attribute_bias(
                    merged_data, attribute, 'yecs_score'
                )

        return bias_results

    def _analyze_attribute_bias(self, data: pd.DataFrame, attribute: str, score_column: str) -> Dict:
        """Analyze bias for a specific attribute"""
        try:
            # Group by attribute and calculate statistics
            grouped = data.groupby(attribute)[score_column].agg(['mean', 'std', 'count'])

            # Calculate statistical parity
            overall_mean = data[score_column].mean()
            group_means = grouped['mean']

            # Calculate disparate impact ratios
            disparate_impact = {}
            for group in group_means.index:
                if overall_mean > 0:
                    disparate_impact[group] = group_means[group] / overall_mean

            # Identify potential bias
            biased_groups = []
            for group, ratio in disparate_impact.items():
                if abs(ratio - 1.0) > self.bias_threshold:
                    biased_groups.append({
                        'group': group,
                        'ratio': ratio,
                        'mean_score': group_means[group],
                        'sample_size': grouped.loc[group, 'count']
                    })

            return {
                'overall_mean': overall_mean,
                'group_statistics': grouped.to_dict('index'),
                'disparate_impact': disparate_impact,
                'biased_groups': biased_groups,
                'bias_detected': len(biased_groups) > 0
            }

        except Exception as e:
            logging.error(f"Bias analysis failed for {attribute}: {str(e)}")
            return {'error': str(e)}

    def calculate_fairness_metrics(self, predictions: pd.DataFrame, actual_outcomes: pd.DataFrame,
                                   demographics: pd.DataFrame) -> Dict:
        """Calculate comprehensive fairness metrics"""
        # Merge all data
        merged_data = predictions.merge(actual_outcomes, on='user_id') \
            .merge(demographics, on='user_id')

        fairness_metrics = {}

        for attribute in self.protected_attributes:
            if attribute in merged_data.columns:
                fairness_metrics[attribute] = self._calculate_group_fairness(
                    merged_data, attribute
                )

        return fairness_metrics

    def _calculate_group_fairness(self, data: pd.DataFrame, attribute: str) -> Dict:
        """Calculate fairness metrics for a specific group"""
        try:
            # Assume binary outcome (loan approved/denied)
            # Convert scores to binary decisions (score >= 650 = approved)
            data['predicted_approval'] = (data['yecs_score'] >= 650).astype(int)

            groups = data.groupby(attribute)

            # Calculate metrics for each group
            group_metrics = {}
            for group_name, group_data in groups:
                total = len(group_data)
                approved = group_data['predicted_approval'].sum()
                approval_rate = approved / total if total > 0 else 0

                group_metrics[group_name] = {
                    'total_applications': total,
                    'approved_applications': approved,
                    'approval_rate': approval_rate,
                    'average_score': group_data['yecs_score'].mean()
                }

            # Calculate equalized odds if actual outcomes are available
            if 'actual_approval' in data.columns:
                equalized_odds = self._calculate_equalized_odds(data, attribute)
                group_metrics['equalized_odds'] = equalized_odds

            return group_metrics

        except Exception as e:
            logging.error(f"Group fairness calculation failed for {attribute}: {str(e)}")
            return {'error': str(e)}

    def _calculate_equalized_odds(self, data: pd.DataFrame, attribute: str) -> Dict:
        """Calculate equalized odds metric"""
        try:
            groups = data.groupby(attribute)
            equalized_odds = {}

            for group_name, group_data in groups:
                # True positive rate
                tp = ((group_data['predicted_approval'] == 1) &
                      (group_data['actual_approval'] == 1)).sum()
                p = (group_data['actual_approval'] == 1).sum()
                tpr = tp / p if p > 0 else 0

                # False positive rate
                fp = ((group_data['predicted_approval'] == 1) &
                      (group_data['actual_approval'] == 0)).sum()
                n = (group_data['actual_approval'] == 0).sum()
                fpr = fp / n if n > 0 else 0

                equalized_odds[group_name] = {
                    'true_positive_rate': tpr,
                    'false_positive_rate': fpr
                }

            return equalized_odds

        except Exception as e:
            logging.error(f"Equalized odds calculation failed: {str(e)}")
            return {'error': str(e)}

    def generate_bias_report(self, bias_results: Dict) -> str:
        """Generate a comprehensive bias report"""
        report = "# YECS Bias Detection Report\n\n"

        for attribute, results in bias_results.items():
            if 'error' in results:
                report += f"## {attribute.title()}\n"
                report += f"Error in analysis: {results['error']}\n\n"
                continue

            report += f"## {attribute.title()}\n"
            report += f"Overall Mean Score: {results['overall_mean']:.2f}\n"

            if results['bias_detected']:
                report += "⚠️ **BIAS DETECTED** ⚠️\n\n"
                report += "Potentially biased groups:\n"
                for group in results['biased_groups']:
                    report += f"- {group['group']}: Ratio {group['ratio']:.3f}, "
                    report += f"Mean Score {group['mean_score']:.2f}, "
                    report += f"Sample Size {group['sample_size']}\n"
            else:
                report += "✅ No significant bias detected\n"

            report += "\n"

        return report

    def apply_bias_mitigation(self, scores: pd.DataFrame, demographics: pd.DataFrame,
                              method: str = 'equalized_odds') -> pd.DataFrame:
        """Apply bias mitigation techniques"""
        if method == 'equalized_odds':
            return self._apply_equalized_odds_mitigation(scores, demographics)
        elif method == 'demographic_parity':
            return self._apply_demographic_parity_mitigation(scores, demographics)
        else:
            raise ValueError(f"Unknown bias mitigation method: {method}")

    def _apply_equalized_odds_mitigation(self, scores: pd.DataFrame,
                                         demographics: pd.DataFrame) -> pd.DataFrame:
        """Apply equalized odds bias mitigation"""
        # Merge data
        merged_data = pd.merge(scores, demographics, on='user_id', how='inner')

        # For each protected attribute, adjust scores to achieve equalized odds
        for attribute in self.protected_attributes:
            if attribute in merged_data.columns:
                # Calculate group-specific adjustments
                groups = merged_data.groupby(attribute)
                overall_mean = merged_data['yecs_score'].mean()

                for group_name, group_data in groups:
                    group_mean = group_data['yecs_score'].mean()
                    adjustment = (overall_mean - group_mean) * 0.1  # 10% adjustment

                    # Apply adjustment
                    mask = merged_data[attribute] == group_name
                    merged_data.loc[mask, 'yecs_score'] += adjustment

        # Ensure scores remain within valid range
        merged_data['yecs_score'] = merged_data['yecs_score'].clip(300, 850)

        return merged_data[['user_id', 'yecs_score']]

    def _apply_demographic_parity_mitigation(self, scores: pd.DataFrame,
                                             demographics: pd.DataFrame) -> pd.DataFrame:
        """Apply demographic parity bias mitigation"""
        # Similar implementation to equalized odds but with different adjustment logic
        merged_data = pd.merge(scores, demographics, on='user_id', how='inner')

        # Apply adjustments to achieve demographic parity
        for attribute in self.protected_attributes:
            if attribute in merged_data.columns:
                # Calculate adjustments to equalize approval rates
                groups = merged_data.groupby(attribute)

                # Calculate overall approval rate (assuming 650+ is approved)
                overall_approval_rate = (merged_data['yecs_score'] >= 650).mean()

                for group_name, group_data in groups:
                    group_approval_rate = (group_data['yecs_score'] >= 650).mean()

                    if group_approval_rate < overall_approval_rate:
                        # Boost scores for underrepresented groups
                        adjustment = 20  # Fixed adjustment
                        mask = merged_data[attribute] == group_name
                        merged_data.loc[mask, 'yecs_score'] += adjustment

        # Ensure scores remain within valid range
        merged_data['yecs_score'] = merged_data['yecs_score'].clip(300, 850)

        return merged_data[['user_id', 'yecs_score']]
