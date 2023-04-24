import React, { useEffect, useState,lazy,Suspense, useMemo,useCallback } from 'react';
import MyGoogleMap from "./component/MyGoogleMap/MyGoogleMap";
import Papa from 'papaparse';
import LineGraph from "./component/LineGraph/LineGraph";
import classes from './App.module.css';
const DisplayTable = lazy(()=>import('./component/DisplayTable/DisplayTable'));
function App() {
  //state aera
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0); // state for decade select
  const [searchKeyword, setSearchKeyword] = useState(''); // state for searching risk factors
  const [sortOrder, setSortOrder] = useState(''); // Add a state for sort order
  const [chosenChartValue,setChosenChartValue] = useState('default'); //state for category selection

  //fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/dataset.csv');
        const csvData = await response.text();
        const parsedData = await parseCsvData(csvData);
        setData(parsedData);
      } catch (error) {
        console.error('Error Occurs while fetching csv', error);
      }
    };

    fetchData();
  }, []);
  const parseCsvData = (csvData) => {
    return new Promise((resolve) => {
      Papa.parse(csvData, {
        header: true,
        complete: function (results) {
          resolve(results.data);
        },
      });
    });
  };
  //handler for select specific year
  const yearChangeHandler = useCallback((year)=>{
    setSelectedYear(year);
  },[]);
  //handler for search specific risk factors keyword
  const keywordHandler = useCallback((keyword)=>{
    setSearchKeyword(keyword.toLowerCase());
  },[]);
  //handler for order filter
  const sortDataByRiskRating = (dataToSort, order) => {
    if (order === 'asc' || order === 'desc') {
      return dataToSort.slice().sort((a, b) => {
        const aRiskRating = parseFloat(a['Risk Rating']);
        const bRiskRating = parseFloat(b['Risk Rating']);
        if (order === 'asc') {
          return aRiskRating - bRiskRating;
        } else {
          return bRiskRating - aRiskRating;
        }
      });
    } else {
      return dataToSort;
    }
  };
  const handleSortOrderChange = useCallback((order) => {
    setSortOrder(order);
  },[]);

  //handler for select category
  const selectedValueHandler = useCallback((e)=>{
    if(e.target.value===""){
      setChosenChartValue("default");
    }else{
      setChosenChartValue(e.target.value);
    }
    
  },[]);
  //location, business cate and asset name
  const businessCategories = useMemo(() => {
    const businessCategoriesSet = new Set();
    data.forEach((item) => {
      if (item['Business Category'] && item['Business Category'].trim() !== '') {
        businessCategoriesSet.add(item['Business Category']);
      }
    });
    return Array.from(businessCategoriesSet);
  }, [data]);
  const assetNames = useMemo(()=>{
    const assetNamesSet = new Set();
    data.forEach((item)=>{
      if (item['Asset Name'] && item['Asset Name'].trim() !== '') {
        assetNamesSet.add(item['Asset Name']);
      }
    });
    return Array.from(assetNamesSet);
  },[data]);
  const locations = useMemo(() => {
    const locationsSet = new Set();
    data.forEach((item) => {
      if (item['Lat'] && item['Long']) {
        locationsSet.add(`${item["Lat"]},${item["Long"]}`);
      }
    });
    return Array.from(locationsSet);
  }, [data]);
  //data fillter for chosen value
  const filterDataByChosenValue = (data, chosenChartValue) => {
    let filteredData = data;
  
    if (selectedYear) {
      filteredData = filteredData.filter((item) => item.Year === selectedYear);
    }
  
    if (chosenChartValue === 'default') {
      return filteredData;
    }
    return filteredData.filter((item) =>
      item['Business Category'] === chosenChartValue ||
      item['Asset Name'] === chosenChartValue ||
      `${item['Lat']},${item['Long']}` === chosenChartValue
    );
  };


  const chosenData = filterDataByChosenValue(data, chosenChartValue);
  const sortedChosenData = sortDataByRiskRating(chosenData, sortOrder);

  return (
    <div>
      <div className={classes.topWrapper}>
        <div className={classes.map}>
          <MyGoogleMap data = {chosenData} onYearSelected ={yearChangeHandler} />
        </div>
        <div className={classes.chart}>
          <div className={classes.categorySelectWrapper}>
            <select className={classes.categorySelect} id="value-select" onChange={selectedValueHandler}>
            <option value="">Select the category</option>
            <optgroup label="Business Category">
              {businessCategories.map((item) => (
              <option key={item} value={item}>
              {item}
            </option>
          ))}
            </optgroup>
            <optgroup label="Assert Name">
                {assetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
            </optgroup>
            <optgroup label="Location">
              {locations.map((item) => (
                <option key={item} value={item} data-category="Location">
                  {item}
                </option>
              ))}
            </optgroup>
            </select>
          </div>

          <div className={classes.ch}>
            <LineGraph chosenData={chosenData}/>
          </div>
          
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DisplayTable data={sortedChosenData} onSearch={keywordHandler} sortOrder={sortOrder} onSortOrderChange={handleSortOrderChange} />
      </Suspense>         
    </div>
  );
}

export default App;
