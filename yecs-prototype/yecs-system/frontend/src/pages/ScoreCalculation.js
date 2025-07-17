import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import ScoreVisualization from '../components/ScoreVisualization';

const ScoreCalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  const calculateScore = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.calculateScore(userId);

      if (response.data.yecs_score) {
        setScoreData(response.data);
        toast.success('YECS score calculated successfully!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to calculate score. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate(`/dashboard/${userId}`);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <Card>
          <Card.Header>
            <h3>YECS Score Calculation</h3>
            <p className="text-muted mb-0">Calculate your Young Entrepreneur Credit Score</p>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            {!scoreData ? (
              <div className="text-center">
                <h5>Ready to Calculate Your YECS Score?</h5>
                <p className="text-muted">
                  Our AI-powered algorithm will analyze your business profile, financial information,
                  and alternative payment history to generate your personalized credit score.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={calculateScore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Calculating Score...
                    </>
                  ) : (
                    'Calculate My YECS Score'
                  )}
                </Button>
              </div>
            ) : (
              <div>
                <Alert variant="success">
                  <h5>🎉 Your YECS Score Has Been Calculated!</h5>
                  <p className="mb-0">
                    Your score is <strong>{scoreData.yecs_score}</strong> with a <strong>{scoreData.risk_level}</strong> risk level.
                  </p>
                </Alert>

                <ScoreVisualization scoreData={scoreData} />

                <div className="text-center mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={goToDashboard}
                  >
                    View Full Dashboard
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ScoreCalculation;
