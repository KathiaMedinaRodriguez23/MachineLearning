import React, { useState } from 'react';
import { Calendar, Zap, TrendingUp } from 'lucide-react';
import './App.css'; // Importa los estilos

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const monthNames = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar opciones de meses posteriores al actual
  const getAvailableMonths = () => {
    const months = [];
    for (let i = currentMonth + 1; i <= 12; i++) {
      months.push({ value: i, label: monthNames[i] });
    }
    // Agregar meses del próximo año si es necesario
    if (currentMonth >= 6) {
      for (let i = 1; i <= currentMonth; i++) {
        months.push({ value: i, label: `${monthNames[i]} (2026)` });
      }
    }
    return months;
  };

  // Simular predicción
  const generatePrediction = async (month) => {
  setLoading(true);

  try {
    const response = await fetch(
      'https://prediccion-de-consumo-electrico.onrender.com/predict',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'mode': 'cors',
        },
        body: JSON.stringify({
          horizon_months: month,
          features: {
            n_appliances: 3,
            household_size: 4,
            fan_hours_last_week: 22.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    console.log('Predicción obtenida:', data)
    setPrediction({
      predicted_month: month,
      predicted_consumption_kwh: Math.round(data.predicted_consumption_kwh * 100) / 100,
    });
  } catch (error) {
    console.error('Error obteniendo la predicción:', error);
  } finally {
    setLoading(false);
  }
};

  const handleMonthSelect = async (monthValue) => {
    console.log('Mes seleccionado:', monthValue);
    setSelectedMonth(monthValue);
    if (monthValue) {
      await generatePrediction(parseInt(monthValue));
    } else {
      setPrediction(null);
    }
  };

  const getMonthName = (monthNum) => {
    if (monthNum <= 12) {
      return monthNames[monthNum];
    }
    return monthNames[monthNum - 12] + ' (2026)';
  };

  const getSeasonalInfo = (month) => {
    const summerMonths = [12, 1, 2, 3];
    const winterMonths = [6, 7, 8, 9];

    if (summerMonths.includes(month)) {
      return { season: 'Verano', color: 'seasonal-summer', icon: '☀️' };
    } else if (winterMonths.includes(month)) {
      return { season: 'Invierno', color: 'seasonal-winter', icon: '❄️' };
    } else {
      return { season: 'Otoño/Primavera', color: 'seasonal-spring', icon: '🍃' };
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="header">
          <div className="header-title">
            <Zap className="header-icon" />
            <h1>Predictor de Consumo Eléctrico</h1>
          </div>
          <p className="header-subtitle">
            Selecciona un mes posterior a junio para ver la predicción de consumo
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <div className="card-header">
              <Calendar className="card-icon card-icon-blue" />
              <h2>Seleccionar Mes</h2>
            </div>

            <div className="form-group">
              <label className="form-label">
                Mes actual: <span className="highlight">Junio 2025</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="form-select"
              >
                <option value="">Selecciona un mes...</option>
                {getAvailableMonths().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedMonth && (
              <div className="selected-month">
                <p>
                  <strong>Mes seleccionado:</strong> {getMonthName(parseInt(selectedMonth))}
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <TrendingUp className="card-icon card-icon-green" />
              <h2>Predicción de Consumo</h2>
            </div>

            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Calculando predicción...</span>
              </div>
            )}

            {!loading && !prediction && (
              <div className="empty-state">
                <div className="empty-content">
                  <Zap className="empty-icon" />
                  <p>Selecciona un mes para ver la predicción</p>
                </div>
              </div>
            )}

            {!loading && prediction && (
              <div className="prediction-container">
                <div className="prediction-main">
                  <div className="prediction-grid">
                    <div className="prediction-item">
                      <h3>Mes Predicho</h3>
                      <p className="prediction-value prediction-value-blue">
                        {prediction.predicted_month}
                      </p>
                      <p className="prediction-label">
                        {getMonthName(prediction.predicted_month)}
                      </p>
                    </div>
                    <div className="prediction-item">
                      <h3>Consumo Estimado</h3>
                      <p className="prediction-value prediction-value-green">
                        {prediction.predicted_consumption_kwh}
                      </p>
                      <p className="prediction-label">kWh</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-card">
                    <h3>Información Estacional</h3>
                    {(() => {
                      const seasonalInfo = getSeasonalInfo(prediction.predicted_month);
                      return (
                        <p className={`seasonal-info ${seasonalInfo.color}`}>
                          <span className="seasonal-icon">{seasonalInfo.icon}</span>
                          {seasonalInfo.season}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="json-card">
                    <h3>Datos JSON</h3>
                    <pre className="json-pre">
{JSON.stringify(prediction, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="system-info">
          <h3>Información del Sistema</h3>
          <div className="features-grid">
            <div className="feature-card feature-card-blue">
              <h4>Predicción Inteligente</h4>
              <p>El sistema considera factores estacionales y patrones históricos de consumo.</p>
            </div>
            <div className="feature-card feature-card-green">
              <h4>Actualización en Tiempo Real</h4>
              <p>Las predicciones se actualizan automáticamente al seleccionar un nuevo mes.</p>
            </div>
            <div className="feature-card feature-card-purple">
              <h4>Formato de Datos</h4>
              <p>Los resultados se muestran en formato JSON estándar para fácil integración.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;