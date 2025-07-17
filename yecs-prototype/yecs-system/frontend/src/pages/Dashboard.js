import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Row, Col, Table, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import ScoreVisualization from '../components/ScoreVisualization';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scoreHistory, setScoreHistory] = useState([]);
  const { userId } = useParams();

  const fetchScoreHistory = useCallback(async () => {
    try {
      const response = await apiService.getUserScores(userId);
      setScoreHistory(response.data.score_history);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch score history.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScoreHistory();
  }, [fetchScoreHistory]);

  const getScoreImprovementSuggestions = (componentScores) => {
    const suggestions = [];

    Object.entries(componentScores).forEach(([component, score]) => {
      if (score < 70) {
        switch (component) {
          case 'business_viability':
            suggestions.push({
              component: 'Business Viability',
              suggestion: 'Improve your business plan quality and market analysis',
              priority: 'High'
            });
            break;
          case 'payment_history':
            suggestions.push({
              component: 'Payment History',
              suggestion: 'Maintain consistent utility and rent payments',
              priority: 'Medium'
            });
            break;
          case 'financial_management':
            suggestions.push({
              component: 'Financial Management',
              suggestion: 'Reduce debt-to-income ratio and increase savings',
              priority: 'High'
            });
            break;
          case 'personal_creditworthiness':
            suggestions.push({
              component: 'Personal Credit',
              suggestion: 'Build traditional credit history and reduce utilization',
              priority: 'Medium'
            });
            break;
          case 'education_background':
            suggestions.push({
              component: 'Education',
              suggestion: 'Consider additional certifications or courses',
              priority: 'Low'
            });
            break;
          case 'social_verification':
            suggestions.push({
              component: 'Social Verification',
              suggestion: 'Strengthen professional network and online presence',
              priority: 'Low'
            });
            break;
          default:
            break;
        }
      }
    });

    return suggestions;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (scoreHistory.length === 0) {
    return (
      <Alert variant="info">
        <h5>No Score History Found</h5>
        <p>You haven't calculated your YECS score yet. Please complete the registration process first.</p>
      </Alert>
    );
  }

  const latestScore = scoreHistory[0];
  const suggestions = getScoreImprovementSuggestions(latestScore.component_scores);

  return (
    <div>
      <h2>YECS Dashboard</h2>
      <p className="text-muted">Your comprehensive credit score overview</p>

      <ScoreVisualization scoreData={latestScore} />

      <Row className="mt-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Score History</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>YECS Score</th>
                    <th>Risk Level</th>
                    <th>Business Viability</th>
                    <th>Payment History</th>
                    <th>Financial Management</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreHistory.map((score) => (
                    <tr key={score.score_id}>
                      <td>{formatDate(score.created_at)}</td>
                      <td><strong>{score.yecs_score}</strong></td>
                      <td>
                        <Badge bg={
                          score.risk_level === 'LOW' ? 'success' :
                          score.risk_level === 'MEDIUM' ? 'warning' :
                          'danger'
                        }>
                          {score.risk_level}
                        </Badge>
                      </td>
                      <td>{score.component_scores.business_viability.toFixed(1)}</td>
                      <td>{score.component_scores.payment_history.toFixed(1)}</td>
                      <td>{score.component_scores.financial_management.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Improvement Suggestions</h5>
            </Card.Header>
            <Card.Body>
              {suggestions.length === 0 ? (
                <Alert variant="success">
                  <h6>🎉 Excellent Score!</h6>
                  <p className="mb-0">All your components are performing well. Keep up the great work!</p>
                </Alert>
              ) : (
                <div>
                  {suggestions.map((suggestion, index) => (
                    <Alert
                      key={index}
                      variant={suggestion.priority === 'High' ? 'danger' :
                              suggestion.priority === 'Medium' ? 'warning' : 'info'}
                      className="mb-3"
                    >
                      <Alert.Heading className="fs-6">
                        {suggestion.component}
                        <Badge className="ms-2" bg={
                          suggestion.priority === 'High' ? 'danger' :
                          suggestion.priority === 'Medium' ? 'warning' : 'secondary'
                        }>
                          {suggestion.priority}
                        </Badge>
                      </Alert.Heading>
                      <p className="mb-0 small">{suggestion.suggestion}</p>
                    </Alert>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
