import React, { useState,useMemo,useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import classes from './LineGraph.module.css'
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, [Tooltip]);

const aggregateData = (data) => {
  let aggregatedData = {};
  data.forEach((item) => {
    const key = `${item['Business Category']}-${item['Year']}`;
    if (aggregatedData[key]) {
      aggregatedData[key].count++;
      aggregatedData[key].totalRiskRating += parseFloat(item['Risk Rating']);
    } else {
      aggregatedData[key] = {
        'Business Category': item['Business Category'],
        Year: item['Year'],
        count: 1,
        totalRiskRating: parseFloat(item['Risk Rating']),
      };
    }
  });

  return Object.values(aggregatedData).map((item) => {
    return {
      ...item,
      AvgRiskRating: item.totalRiskRating / item.count,
    };
  });
};



const LineGraph = (props) => {
  const [showAggregatedData, setShowAggregatedData] = useState(false);
  const chosenData = props.chosenData;

  const sortedChosenData = useMemo(() => {
    return [...chosenData].sort((a, b) => {
      return parseInt(a.Year) - parseInt(b.Year);
    });
  }, [chosenData]);

  const aggregatedChosenData = useMemo(() => aggregateData(chosenData), [chosenData]);
  const sortedAggregatedChosenData = useMemo(() => {
    return [...aggregatedChosenData].sort((a, b) => {
      return parseInt(a.Year) - parseInt(b.Year);
    });
  }, [aggregatedChosenData]);

  const dataToUse = useMemo(() => {
    return showAggregatedData ? sortedAggregatedChosenData : sortedChosenData;
  }, [showAggregatedData, sortedAggregatedChosenData, sortedChosenData]);
  const year = useMemo(() => dataToUse.map((item) => item.Year), [dataToUse]);
  const riskRatings = useMemo(
    () =>
      dataToUse.map((item) =>
        showAggregatedData ? parseFloat(item['AvgRiskRating']) : parseFloat(item['Risk Rating'])
      ),
    [dataToUse, showAggregatedData]
  );

  const data = {
    labels: year,
    datasets: [
      {
        labels: 'Risk Rating',
        data: riskRatings,
        backgroundColor: 'aqua',
        borderColor: 'black',
        pointBorderColor: 'aqua',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: true,
        callbacks: {
            label: (tooltipItem) => {
                const dataIndex = tooltipItem.dataIndex;
                const year = dataToUse[dataIndex]['Year'];
                
                if (showAggregatedData) {
                  const businessCategory = dataToUse[dataIndex]['Business Category'];
                  const avgRiskRating = dataToUse[dataIndex]['AvgRiskRating'];
                  
                  return [
                    `Business Category: ${businessCategory}`,
                    `Year: ${year}`,
                    `Average Risk Rating: ${avgRiskRating}`,
                  ];
                } else {
                  const assetName = dataToUse[dataIndex]['Asset Name'];
                  const riskRating = dataToUse[dataIndex]['Risk Rating'];
                  const riskFactors = dataToUse[dataIndex]['Risk Factors'];
              
                  return [
                    `Asset Name: ${assetName}`,
                    `Risk Rating: ${riskRating}`,
                    `Risk Factors: ${riskFactors}`,
                    `Year: ${year}`,
                  ];
                }
            },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Risk Rating',
        },
        min: 0,
        max: 1,
      },
    },
  };
  const toggleAggregatedData = useCallback(() => {
    setShowAggregatedData((prevShowAggregatedData) => !prevShowAggregatedData);
  }, []);


  return (
    <div>
      <button className={classes.dataAggregatedButton} onClick={toggleAggregatedData}>
        {showAggregatedData ? 'Show Original Data' : 'Show Aggregated Data'}
      </button>
      <Line data={data} options={options}></Line>
    </div>
  );
  };
  
  export default LineGraph;