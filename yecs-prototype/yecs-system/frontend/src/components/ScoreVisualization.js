import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ScoreVisualization = ({ scoreData }) => {
  const { yecs_score, component_scores, risk_level } = scoreData;

  // Component scores data for bar chart
  const componentChartData = {
    labels: [
      'Business Viability',
      'Payment History',
      'Financial Management',
      'Personal Credit',
      'Education Background',
      'Social Verification'
    ],
    datasets: [
      {
        label: 'Component Scores',
        data: [
          component_scores.business_viability,
          component_scores.payment_history,
          component_scores.financial_management,
          component_scores.personal_creditworthiness,
          component_scores.education_background,
          component_scores.social_verification
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Risk level pie chart data
  const riskChartData = {
    labels: ['Current Score', 'Remaining'],
    datasets: [
      {
        data: [yecs_score - 300, 850 - yecs_score],
        backgroundColor: [
          getRiskColor(risk_level),
          '#E0E0E0'
        ],
        borderColor: [
          getRiskColor(risk_level),
          '#E0E0E0'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'YECS Component Breakdown',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `YECS Score: ${yecs_score}`,
      },
    },
  };

  function getRiskColor(riskLevel) {
    switch (riskLevel) {
      case 'LOW':
        return '#28a745';
      case 'MEDIUM':
        return '#ffc107';
      case 'HIGH':
        return '#fd7e14';
      case 'VERY_HIGH':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  function getRiskVariant(riskLevel) {
    switch (riskLevel) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'danger';
      case 'VERY_HIGH':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  return (
    <div>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>YECS Score Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <h2 className="display-4">{yecs_score}</h2>
                <p className="text-muted">Out of 850</p>
                <ProgressBar
                  now={((yecs_score - 300) / 550) * 100}
                  variant={getRiskVariant(risk_level)}
                  style={{ height: '20px' }}
                />
                <div className="mt-2">
                  <span className={`badge bg-${getRiskVariant(risk_level)} fs-6`}>
                    {risk_level} RISK
                  </span>
                </div>
              </div>
              <Doughnut data={riskChartData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Component Scores</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={componentChartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Detailed Component Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Business Viability (25%)</strong>
                    <ProgressBar
                      now={component_scores.business_viability}
                      label={`${component_scores.business_viability.toFixed(1)}%`}
                      variant="info"
                    />
                  </div>
                  <div className="mb-3">
                    <strong>Payment History (20%)</strong>
                    <ProgressBar
                      now={component_scores.payment_history}
                      label={`${component_scores.payment_history.toFixed(1)}%`}
                      variant="success"
                    />
                  </div>
                  <div className="mb-3">
                    <strong>Financial Management (18%)</strong>
                    <ProgressBar
                      now={component_scores.financial_management}
                      label={`${component_scores.financial_management.toFixed(1)}%`}
                      variant="warning"
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Personal Credit (15%)</strong>
                    <ProgressBar
                      now={component_scores.personal_creditworthiness}
                      label={`${component_scores.personal_creditworthiness.toFixed(1)}%`}
                      variant="danger"
                    />
                  </div>
                  <div className="mb-3">
                    <strong>Education Background (12%)</strong>
                    <ProgressBar
                      now={component_scores.education_background}
                      label={`${component_scores.education_background.toFixed(1)}%`}
                      variant="secondary"
                    />
                  </div>
                  <div className="mb-3">
                    <strong>Social Verification (10%)</strong>
                    <ProgressBar
                      now={component_scores.social_verification}
                      label={`${component_scores.social_verification.toFixed(1)}%`}
                      variant="dark"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ScoreVisualization;
