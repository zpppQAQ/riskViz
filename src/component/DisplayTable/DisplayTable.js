import React,{useState,useEffect} from 'react';
import { v4 as uuidv4 } from 'uuid';
import classes from './DisplayTable.module.css';
import Pagination from './Pagination/Pagination';
const DisplayTable = (props) => {
  const [keyword, setKeyWord] = useState('');
  const [currentPage,setCurrentPage] = useState(1);
  const [gotoPage, setGotoPage] = useState(1);
  const [filteredData, setFilteredData] = useState(props.data);

  const itemsPerPage = 100; //item per page
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


  let heading = [];
  for (let item in props.data[0]) {
    heading.push(item);
  }
  const handleFilterChange = (e) => {
    setKeyWord(e.target.value);
  };
  //set 1 second timeout to prevent over render
  useEffect(() => {
    const oneSecTimeout = setTimeout(()=>{
      if (keyword) {
        setFilteredData(
          props.data.filter((item) =>
            item['Risk Factors']
              ? item['Risk Factors'].toLowerCase().includes(keyword)
              : false
          )
        );
      } else {
        setFilteredData(props.data);
      }
    },1000);
    return ()=>{
      clearTimeout(oneSecTimeout);
    }
  }, [props.data, keyword]);
  
  // Handle sort order change
  const handleSortOrderChange = (e) => {
      props.onSortOrderChange(e.target.value);
    };
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setGotoPage(pageNumber);
  };
  const handleGotoPageChange = (e) => {
    setGotoPage(e.target.value);
  };

  const gotoSpecificPage = () => {
    setCurrentPage(gotoPage);
  };

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={classes.tableArea}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onGotoPageChange={handleGotoPageChange}
        gotoPage={gotoPage}
        gotoSpecificPage={gotoSpecificPage}/>
      
      <input
        className={classes.filterBox}
        type="text"
        placeholder="Filter by risk factors"
        value={keyword}
        onChange={handleFilterChange}/>
      <select className={classes.riskSelectBox} value={props.sortOrder} onChange={handleSortOrderChange}>
        <option value="asc">Risk Rating: Ascending</option>
        <option value="desc">Risk Rating: Descending</option>
      </select>
      <input
            className={classes.filterBox}
            type="text"
            placeholder="Filter by risk factors"
            value={keyword}
            onChange={handleFilterChange}/>
      <table>
        <thead>
          <tr>
            {heading.map((key) => (
              <th className={classes.header} key={uuidv4()}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr key={uuidv4()}>
              {heading.map((key) => (
                <td className={classes.everyLine} key={uuidv4()}>{item[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisplayTable;
