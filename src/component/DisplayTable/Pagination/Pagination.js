import React from 'react'
import classes from './Pagination.module.css'
const Pagination = ({ currentPage, totalPages, onPageChange, onGotoPageChange, gotoPage, gotoSpecificPage }) => {
  return (
    <div className={classes.pagWrapper}>
        <button onClick={() => onPageChange(+currentPage - 1)} disabled={currentPage === 1}>
        Previous
        </button>
        <input
            className={classes.inputBox}
            type="number"
            value={gotoPage}
            onChange={onGotoPageChange}
            min="1"
            max={totalPages}/>
        <span>
            {currentPage}/{totalPages}
        </span>
        <button className={classes.goBut} onClick={gotoSpecificPage}>Go</button>
        <button className={classes.nextButton} onClick={() => onPageChange(+currentPage + 1)} disabled={currentPage === totalPages}>
            Next
        </button>
    </div>
  )
}

export default Pagination
